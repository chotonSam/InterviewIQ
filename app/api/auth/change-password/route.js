import { NextResponse } from "next/server";
import { getSessionUserId, createSession } from "@/lib/session";
import { changePassword } from "@/lib/passwords";

// POST /api/auth/change-password { currentPassword, newPassword } — login required.
// Success signs out every OTHER device and keeps this one logged in.
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    const r = await changePassword(userId, currentPassword, newPassword);
    if (r.ok) {
      await createSession(userId, r.tokenVersion); // a fresh cookie for this device
      return NextResponse.json({ ok: true });
    }
    const errors = {
      weak: [400, r.message],
      wrong: [400, `Your current password is incorrect.${r.remaining > 0 ? ` ${r.remaining} ${r.remaining === 1 ? "try" : "tries"} left.` : ""}`],
      same: [400, "Your new password must be different from the current one."],
      locked: [429, `Too many wrong attempts. Try again in about ${r.retryIn ?? 15} minutes, or use "Forgot password" on the login page.`],
      not_found: [404, "Account not found."],
    };
    const [status, error] = errors[r.code] ?? [400, "Could not change the password."];
    return NextResponse.json({ error, code: r.code }, { status });
  } catch (err) {
    console.error("[change-password]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
