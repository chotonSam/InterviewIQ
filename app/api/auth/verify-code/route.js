import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { confirmEmailCode } from "@/lib/verification";

// POST /api/auth/verify-code { code } — the 6-digit code from the email (login required)
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { code } = await req.json();
    const r = await confirmEmailCode(userId, code);
    if (r.ok) return NextResponse.json({ ok: true });

    const errors = {
      format: [400, "Enter the 6-digit code from the email."],
      expired: [400, "That code has expired (they last 10 minutes). Click “Send again” for a new one."],
      locked: [429, "Too many wrong tries. Click “Send again” to get a new code."],
      wrong: [400, `That code isn't right. ${r.remaining ?? 0} ${r.remaining === 1 ? "try" : "tries"} left.`],
      not_found: [404, "Account not found."],
    };
    const [status, error] = errors[r.code] ?? [400, "Could not verify the code."];
    return NextResponse.json({ error, code: r.code }, { status });
  } catch (err) {
    console.error("[verify-code]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
