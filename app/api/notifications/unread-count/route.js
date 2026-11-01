import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    await connectDB();
    return NextResponse.json({ count: await Notification.countDocuments({ user: userId, read: false }) });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
