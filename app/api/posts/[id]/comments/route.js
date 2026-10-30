import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const shape = (c) => ({
  id: String(c._id),
  author: c.user?.name ?? "Unknown",
  username: c.user?.username ?? "",
  text: c.text,
  createdAt: c.createdAt,
});

// GET /api/posts/:id/comments → all comments, oldest first (the page polls this for live updates)
export async function GET(_req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  try {
    await connectDB();
    void User;
    const comments = await Comment.find({ post: params.id }).sort({ createdAt: 1 }).limit(200).populate("user", "name username").lean();
    return NextResponse.json({ comments: comments.map(shape) });
  } catch (err) {
    console.error("[list comments]", err);
    return NextResponse.json({ error: "Could not load comments." }, { status: 500 });
  }
}

// POST /api/posts/:id/comments  { text }
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  try {
    const { text } = await req.json();
    const clean = String(text ?? "").trim();
    if (!clean) return NextResponse.json({ error: "Write a comment first." }, { status: 400 });
    if (clean.length > 500) return NextResponse.json({ error: "Comment is too long (max 500 characters)." }, { status: 400 });

    await connectDB();
    void User;
    if (!(await Post.exists({ _id: params.id }))) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    const created = await Comment.create({ post: params.id, user: userId, text: clean });
    await Post.updateOne({ _id: params.id }, { $inc: { commentCount: 1 } });

    const comment = await Comment.findById(created._id).populate("user", "name username").lean();
    return NextResponse.json({ comment: shape(comment) }, { status: 201 });
  } catch (err) {
    console.error("[create comment]", err);
    return NextResponse.json({ error: "Could not post your comment." }, { status: 500 });
  }
}
