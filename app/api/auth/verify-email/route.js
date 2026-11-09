import { NextResponse } from "next/server";
import { confirmEmailToken } from "@/lib/verification";

// POST /api/auth/verify-email { token } — no login needed (people often open the link on another device)
export async function POST(req) {
  try {
    const { token } = await req.json();
    const r = await confirmEmailToken(token);
    if (r.ok) return NextResponse.json({ ok: true });
    const message =
      r.code === "expired"
        ? "This link has expired. Log in and use “Resend email” to get a new one."
        : "This link isn't valid, or it was already used. If your email is already verified, you're all set. Otherwise log in and use “Resend email”.";
    return NextResponse.json({ error: message, code: r.code }, { status: 400 });
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
