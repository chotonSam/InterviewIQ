import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { createSession } from "@/lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));

    // Same message for both cases so we don't reveal which emails exist
    if (!valid) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

    await createSession(user._id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
