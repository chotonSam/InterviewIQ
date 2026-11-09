import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

// Community actions (post, comment, reply, add a resource) need a verified email.
// Returns null when allowed, or a 403 response to send back.
// Set REQUIRE_VERIFIED_EMAIL=false in .env.local to switch this check off.
export async function verifiedOrResponse(userId) {
  if (process.env.REQUIRE_VERIFIED_EMAIL === "false") return null;
  await connectDB();
  const u = await User.findById(userId).select("emailVerified").lean();
  if (u?.emailVerified) return null;
  return NextResponse.json(
    { error: "Please verify your email first. Check your inbox for the link, or use “Resend email” in the banner at the top.", code: "email_not_verified" },
    { status: 403 }
  );
}
