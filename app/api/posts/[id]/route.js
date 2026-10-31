import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import Like from "@/lib/models/Like";
import { getSessionUserId } from "@/lib/session";

// DELETE /api/posts/:id → only the author can delete; its comments and likes go with it
export async function DELETE(_req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  try {
    await connectDB();
    const deleted = await Post.findOneAndDelete({ _id: params.id, user: userId });
    if (!deleted) return NextResponse.json({ error: "Post not found, or it isn't yours." }, { status: 404 });
    await Promise.all([Comment.deleteMany({ post: params.id }), Like.deleteMany({ post: params.id })]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete post]", err);
    return NextResponse.json({ error: "Could not delete the post." }, { status: 500 });
  }
}
