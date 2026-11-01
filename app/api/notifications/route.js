import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Notification from "@/lib/models/Notification";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/notifications → your latest 50 notifications
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    await connectDB();
    void User; void Post;
    const items = await Notification.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("actor", "name username image")
      .populate("post", "title")
      .lean();
    return NextResponse.json({
      notifications: items
        .filter((n) => n.post && n.actor)
        .map((n) => ({
          id: String(n._id),
          type: n.type,
          text: n.text,
          read: n.read,
          createdAt: n.updatedAt,
          actor: { name: n.actor.name, username: n.actor.username, image: n.actor.image ?? "" },
          postId: String(n.post._id),
          postTitle: n.post.title,
        })),
    });
  } catch (err) {
    console.error("[list notifications]", err);
    return NextResponse.json({ error: "Could not load notifications." }, { status: 500 });
  }
}

// POST /api/notifications  { id } or { all: true } → mark as read
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const body = await req.json();
    if (body.all !== true && !mongoose.isValidObjectId(body.id)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await connectDB();
    if (body.all === true) {
      await Notification.updateMany({ user: userId, read: false }, { read: true });
    } else {
      await Notification.updateOne({ _id: body.id, user: userId }, { read: true });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[mark read]", err);
    return NextResponse.json({ error: "Could not update notifications." }, { status: 500 });
  }
}
