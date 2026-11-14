import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { sendMail, isMailConfigured } from "@/lib/mail";
import { passwordResetEmail } from "@/lib/emailTemplates";
import { appUrl } from "@/lib/verification";

const LINK_TTL_MS = 60 * 60 * 1000;     // reset link: 1 hour
const CODE_TTL_MS = 10 * 60 * 1000;     // reset code: 10 minutes
const COOLDOWN_MS = 60 * 1000;          // one reset email per minute…
const DAILY_MAX = 5;                    // …and 5 a day per account
const MAX_CODE_TRIES = 5;               // wrong guesses per code
const FAIL_LIMIT = 5;                   // wrong "current password" tries before a pause
const LOCK_MS = 15 * 60 * 1000;

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const codeHash = (userId, code) => crypto.createHmac("sha256", process.env.AUTH_SECRET || "dev-secret").update(`reset:${userId}:${code}`).digest("hex");

export function validatePassword(pw) {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (Buffer.byteLength(pw) > 72) return "Password is too long (max 72 characters).";
  return null;
}

// Sets the new password everywhere it needs to change.  Returns the new session version.
async function applyNewPassword(userId, password, { wasVerified = true } = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const set = {
    passwordHash,
    passwordChangedAt: new Date(),
    "reset.tokenHash": "", "reset.expiresAt": null, "reset.codeHash": "", "reset.codeExpiresAt": null, "reset.codeAttempts": 0,
    "security.failedChecks": 0, "security.lockedUntil": null,
  };
  // getting the reset email proves the person controls this inbox
  if (!wasVerified) { set.emailVerified = true; set.emailVerifiedAt = new Date(); }
  const updated = await User.findOneAndUpdate({ _id: userId }, { $set: set, $inc: { tokenVersion: 1 } }, { new: true }).select("tokenVersion");
  return updated?.tokenVersion ?? 0;
}

// ---------------------------------------------------------------------------------------------
// Forgot password: send a code + link.  Never reveals whether the email has an account.
// Returns { sent, devLink?, devCode? }  (dev fields only exist when no mail server is configured)
// ---------------------------------------------------------------------------------------------
export async function requestPasswordReset(email) {
  await connectDB();
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("name email reset");
  if (!user) return { sent: false };

  const now = Date.now();
  const r = user.reset ?? {};
  if (r.lastSentAt && now - new Date(r.lastSentAt).getTime() < COOLDOWN_MS) return { sent: false };
  const windowFresh = r.windowStart && now - new Date(r.windowStart).getTime() < 24 * 60 * 60 * 1000;
  const sentCount = windowFresh ? r.sentCount ?? 0 : 0;
  if (sentCount >= DAILY_MAX) return { sent: false };

  const token = crypto.randomBytes(32).toString("hex");
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const link = `${appUrl()}/reset-password?token=${token}`;

  await User.updateOne({ _id: user._id }, { $set: {
    "reset.tokenHash": sha256(token), "reset.expiresAt": new Date(now + LINK_TTL_MS),
    "reset.codeHash": codeHash(String(user._id), code), "reset.codeExpiresAt": new Date(now + CODE_TTL_MS), "reset.codeAttempts": 0,
    "reset.lastSentAt": new Date(now), "reset.windowStart": windowFresh ? r.windowStart : new Date(now), "reset.sentCount": sentCount + 1,
  } });

  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === "production") return { sent: false };
    console.log(`\n[reset-password] SMTP is not configured — for ${user.email}:\n  code: ${code}\n  link: ${link}\n`);
    return { sent: false, devLink: link, devCode: code };
  }
  try {
    const { subject, text, html } = passwordResetEmail({ name: user.name, link, code });
    await sendMail({ to: user.email, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("[reset-password] could not send:", err.message);
    await User.updateOne({ _id: user._id }, { $set: { "reset.lastSentAt": r.lastSentAt ?? null, "reset.sentCount": sentCount } });
    return { sent: false };
  }
}

// ---- reset with the link ----
export async function resetWithToken(token, password) {
  const weak = validatePassword(password);
  if (weak) return { ok: false, code: "weak", message: weak };
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return { ok: false, code: "invalid" };

  await connectDB();
  const tokenHash = sha256(token);
  // consume the token first, so it can only ever be used once
  const user = await User.findOneAndUpdate(
    { "reset.tokenHash": tokenHash, "reset.expiresAt": { $gt: new Date() } },
    { $set: { "reset.tokenHash": "", "reset.expiresAt": null } },
    { new: false }
  ).select("emailVerified");
  if (!user) return { ok: false, code: (await User.exists({ "reset.tokenHash": tokenHash })) ? "expired" : "invalid" };

  await applyNewPassword(user._id, password, { wasVerified: Boolean(user.emailVerified) });
  return { ok: true };
}

// ---- reset with the 6-digit code ----
export async function resetWithCode(email, code, password) {
  const weak = validatePassword(password);
  if (weak) return { ok: false, code: "weak", message: weak };
  const clean = String(code ?? "").trim();
  if (!/^\d{6}$/.test(clean)) return { ok: false, code: "format" };

  await connectDB();
  const user = await User.findOne({ email: String(email ?? "").trim().toLowerCase() }).select("emailVerified reset");
  const r = user?.reset ?? {};
  // unknown email, no code requested, or an expired code all look the same from outside
  if (!user || !r.codeHash || !r.codeExpiresAt || new Date(r.codeExpiresAt).getTime() <= Date.now()) return { ok: false, code: "invalid" };

  // every guess uses one of the 5 tries (claimed atomically, so parallel guesses can't beat the limit)
  const claimed = await User.findOneAndUpdate(
    { _id: user._id, "reset.codeAttempts": { $lt: MAX_CODE_TRIES } },
    { $inc: { "reset.codeAttempts": 1 } },
    { new: true }
  ).select("reset");
  if (!claimed) return { ok: false, code: "locked" };

  const expected = Buffer.from(claimed.reset.codeHash || "");
  const given = Buffer.from(codeHash(String(user._id), clean));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return { ok: false, code: claimed.reset.codeAttempts >= MAX_CODE_TRIES ? "locked" : "invalid" };
  }

  await applyNewPassword(user._id, password, { wasVerified: Boolean(user.emailVerified) });
  return { ok: true };
}

// ---------------------------------------------------------------------------------------------
// Change password (logged in)
// ---------------------------------------------------------------------------------------------
export async function changePassword(userId, currentPassword, newPassword) {
  const weak = validatePassword(newPassword);
  if (weak) return { ok: false, code: "weak", message: weak };

  await connectDB();
  const user = await User.findById(userId).select("passwordHash security emailVerified");
  if (!user) return { ok: false, code: "not_found" };

  const lockedUntil = user.security?.lockedUntil ? new Date(user.security.lockedUntil).getTime() : 0;
  if (lockedUntil > Date.now()) return { ok: false, code: "locked", retryIn: Math.ceil((lockedUntil - Date.now()) / 60000) };

  if (!(await bcrypt.compare(String(currentPassword ?? ""), user.passwordHash))) {
    const failed = (user.security?.failedChecks ?? 0) + 1;
    const lock = failed >= FAIL_LIMIT;
    await User.updateOne({ _id: userId }, { $set: { "security.failedChecks": lock ? 0 : failed, "security.lockedUntil": lock ? new Date(Date.now() + LOCK_MS) : null } });
    return { ok: false, code: lock ? "locked" : "wrong", retryIn: lock ? Math.ceil(LOCK_MS / 60000) : undefined, remaining: lock ? 0 : FAIL_LIMIT - failed };
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) return { ok: false, code: "same" };

  const tokenVersion = await applyNewPassword(userId, newPassword, { wasVerified: Boolean(user.emailVerified) });
  return { ok: true, tokenVersion };
}
