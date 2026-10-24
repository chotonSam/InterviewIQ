import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const u = (new URL(req.url).searchParams.get("u") ?? "").trim().toLowerCase();

  if (!/^[a-z0-9_]{3,20}$/.test(u)) {
    return NextResponse.json({ available: false, reason: "invalid" }, { status: 400 });
  }

  try {
    await connectDB();
    const taken = await User.exists({ username: u });
    return NextResponse.json({ available: !taken });
  } catch (err) {
    console.error("[check-username]", err);
    return NextResponse.json({ error: "Could not check username." }, { status: 500 });
  }
}
