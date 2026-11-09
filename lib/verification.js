import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { sendMail, isMailConfigured } from "@/lib/mail";
import { verificationEmail } from "@/lib/emailTemplates";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // link works for 24 hours
const COOLDOWN_MS = 60 * 1000;            // at most one email per minute…
const DAILY_MAX = 5;                      // …and 5 per day per account (stops inbox spam)
const CODE_TTL_MS = 10 * 60 * 1000;       // the 6-digit code works for 10 minutes
const MAX_CODE_TRIES = 5;                 // wrong guesses allowed per code

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
// The code is stored as an HMAC (keyed with AUTH_SECRET + the user's id), never in plain text
const codeHash = (userId, code) => crypto.createHmac("sha256", process.env.AUTH_SECRET || "dev-secret").update(`${userId}:${code}`).digest("hex");
export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");

// Sends (or re-sends) the verification email for a user.
// Returns { ok, sent, already?, code?, retryIn?, devLink? }
export async function sendVerificationEmail(userId) {
  await connectDB();
  const user = await User.findById(userId).select("name email emailVerified verification");
  if (!user) return { ok: false, code: "not_found" };
  if (user.emailVerified) return { ok: true, sent: false, already: true };

  const now = Date.now();
  const v = user.verification ?? {};

  // ---- rate limits ----
  if (v.lastSentAt && now - new Date(v.lastSentAt).getTime() < COOLDOWN_MS) {
    return { ok: false, code: "cooldown", retryIn: Math.ceil((COOLDOWN_MS - (now - new Date(v.lastSentAt).getTime())) / 1000) };
  }
  const windowFresh = v.windowStart && now - new Date(v.windowStart).getTime() < 24 * 60 * 60 * 1000;
  const sentCount = windowFresh ? v.sentCount ?? 0 : 0;
  if (sentCount >= DAILY_MAX) return { ok: false, code: "limit" };

  // ---- new single-use token; only its hash is stored ----
  const token = crypto.randomBytes(32).toString("hex");
  const link = `${appUrl()}/verify-email?token=${token}`;
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0"); // 6-digit one-time code
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "verification.tokenHash": sha256(token),
        "verification.expiresAt": new Date(now + TOKEN_TTL_MS),
        "verification.lastSentAt": new Date(now),
        "verification.windowStart": windowFresh ? v.windowStart : new Date(now),
        "verification.sentCount": sentCount + 1,
        "verification.codeHash": codeHash(String(userId), code),
        "verification.codeExpiresAt": new Date(now + CODE_TTL_MS),
        "verification.codeAttempts": 0,
      },
    }
  );

  // ---- no mail server set up ----
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === "production") return { ok: false, code: "not_configured" };
    console.log(`\n[verify-email] SMTP is not configured — for ${user.email}:\n  code: ${code}\n  link: ${link}\n`);
    return { ok: true, sent: false, devLink: link, devCode: code };
  }

  // ---- send ----
  try {
    const { subject, text, html } = verificationEmail({ name: user.name, link, code });
    await sendMail({ to: user.email, subject, text, html });
    return { ok: true, sent: true };
  } catch (err) {
    console.error("[verify-email] could not send:", err.message);
    // a failed send shouldn't use up the person's attempts
    await User.updateOne(
      { _id: userId },
      { $set: { "verification.lastSentAt": v.lastSentAt ?? null, "verification.sentCount": sentCount } }
    );
    return { ok: false, code: "send_failed" };
  }
}

// Confirms the token from the emailed link. Returns { ok } or { ok:false, code: "invalid" | "expired" }
export async function confirmEmailToken(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return { ok: false, code: "invalid" };
  await connectDB();
  const tokenHash = sha256(token);

  const user = await User.findOneAndUpdate(
    { "verification.tokenHash": tokenHash, "verification.expiresAt": { $gt: new Date() } },
    { $set: { emailVerified: true, emailVerifiedAt: new Date(), "verification.tokenHash": "", "verification.expiresAt": null, "verification.codeHash": "", "verification.codeExpiresAt": null, "verification.codeAttempts": 0 } },
    { new: true }
  ).select("name");
  if (user) return { ok: true, name: user.name };

  const stale = await User.exists({ "verification.tokenHash": tokenHash });
  return { ok: false, code: stale ? "expired" : "invalid" };
}

// Confirms the 6-digit code the person typed. Needs the logged-in user's id.
// Returns { ok } or { ok:false, code: "format" | "expired" | "locked" | "wrong", remaining? }
export async function confirmEmailCode(userId, code) {
  const clean = String(code ?? "").trim();
  if (!/^\d{6}$/.test(clean)) return { ok: false, code: "format" };

  await connectDB();
  const user = await User.findById(userId).select("emailVerified verification");
  if (!user) return { ok: false, code: "not_found" };
  if (user.emailVerified) return { ok: true, already: true };

  const v = user.verification ?? {};
  if (!v.codeHash || !v.codeExpiresAt || new Date(v.codeExpiresAt).getTime() <= Date.now()) return { ok: false, code: "expired" };

  // Every guess uses one of the 5 tries — claimed atomically, so parallel guesses can't beat the limit
  const claimed = await User.findOneAndUpdate(
    { _id: userId, "verification.codeAttempts": { $lt: MAX_CODE_TRIES } },
    { $inc: { "verification.codeAttempts": 1 } },
    { new: true }
  ).select("verification");
  if (!claimed) return { ok: false, code: "locked" };

  const expected = Buffer.from(claimed.verification.codeHash || "");
  const given = Buffer.from(codeHash(String(userId), clean));
  const match = expected.length === given.length && crypto.timingSafeEqual(expected, given);
  if (!match) {
    const remaining = Math.max(0, MAX_CODE_TRIES - claimed.verification.codeAttempts);
    return { ok: false, code: remaining === 0 ? "locked" : "wrong", remaining };
  }

  await User.updateOne(
    { _id: userId },
    { $set: { emailVerified: true, emailVerifiedAt: new Date(), "verification.tokenHash": "", "verification.expiresAt": null, "verification.codeHash": "", "verification.codeExpiresAt": null, "verification.codeAttempts": 0 } }
  );
  return { ok: true };
}
