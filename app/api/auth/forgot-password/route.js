import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/passwords";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/forgot-password { email }
// The answer is always the same, whether or not an account exists (so nobody can use this to find out who is registered).
export async function POST(req) {
  try {
    const { email } = await req.json();
    const clean = String(email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const r = await requestPasswordReset(clean);
    const dev = process.env.NODE_ENV !== "production" ? { devCode: r.devCode, devLink: r.devLink } : {};
    return NextResponse.json({ ok: true, ...dev });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
