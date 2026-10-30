import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/lib/models/Post";
import Like from "@/lib/models/Like";
import { getSessionUserId } from "@/lib/session";

// POST /api/posts/:id/like → toggles your like, returns { liked, likes }
export async function POST(_req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  try {
    await connectDB();
    if (!(await Post.exists({ _id: params.id }))) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    let liked;
    try {
      await Like.create({ post: params.id, user: userId });
      liked = true;
    } catch (err) {
      if (err?.code !== 11000) throw err;
      // Already liked → remove it (toggle off)
      const removed = await Like.findOneAndDelete({ post: params.id, user: userId });
      if (!removed) return NextResponse.json({ error: "Please try again." }, { status: 409 });
      liked = false;
    }

    const post = await Post.findByIdAndUpdate(params.id, { $inc: { likeCount: liked ? 1 : -1 } }, { new: true }).select("likeCount");
    return NextResponse.json({ liked, likes: Math.max(0, post.likeCount) });
  } catch (err) {
    console.error("[like]", err);
    return NextResponse.json({ error: "Could not update like." }, { status: 500 });
  }
}
