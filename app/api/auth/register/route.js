import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || name.length > 80) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!USERNAME_RE.test(username)) return NextResponse.json({ error: "Username must be 3–20 characters: letters, numbers, underscore." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    await connectDB();

    if (await User.exists({ username })) return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    if (await User.exists({ email })) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, email, phone, passwordHash });

    await createSession(user._id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) return NextResponse.json({ error: "Username or email already in use." }, { status: 409 });
    console.error("[register]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
