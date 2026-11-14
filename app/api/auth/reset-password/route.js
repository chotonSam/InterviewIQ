import { NextResponse } from "next/server";
import { resetWithToken, resetWithCode } from "@/lib/passwords";

// POST /api/auth/reset-password
//   { token, password }          — from the link in the email
//   { email, code, password }    — from the 6-digit code
export async function POST(req) {
  try {
    const body = await req.json();
    const r = body.token ? await resetWithToken(body.token, body.password) : await resetWithCode(body.email, body.code, body.password);
    if (r.ok) return NextResponse.json({ ok: true });

    const errors = {
      weak: [400, r.message],
      format: [400, "Enter the 6-digit code from the email."],
      expired: [400, "This link has expired. Ask for a new reset email."],
      locked: [429, "Too many wrong tries. Ask for a new reset email."],
      invalid: [400, body.token ? "This link isn't valid or was already used. Ask for a new reset email." : "That code isn't right or has expired. Check it, or ask for a new email."],
    };
    const [status, error] = errors[r.code] ?? [400, "Could not reset the password."];
    return NextResponse.json({ error, code: r.code }, { status });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
