import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import { getSessionUserId } from "@/lib/session";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

const shape = (c) => ({
  id: String(c._id),
  author: c.user?.name ?? "Unknown",
  username: c.user?.username ?? "",
  authorImage: c.user?.image ?? "",
  text: c.text,
  parentId: c.parent ? String(c.parent) : null,
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
    const comments = await Comment.find({ post: params.id }).sort({ createdAt: 1 }).limit(200).populate("user", "name username image").lean();
    return NextResponse.json({ comments: comments.map(shape) });
  } catch (err) {
    console.error("[list comments]", err);
    return NextResponse.json({ error: "Could not load comments." }, { status: 500 });
  }
}

// POST /api/posts/:id/comments  { text, parentId? }  — parentId makes it a reply to that comment
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  try {
    const { text, parentId } = await req.json();
    const clean = String(text ?? "").trim();
    if (!clean) return NextResponse.json({ error: "Write a comment first." }, { status: 400 });
    if (clean.length > 500) return NextResponse.json({ error: "Comment is too long (max 500 characters)." }, { status: 400 });

    if (parentId && !mongoose.isValidObjectId(parentId)) return NextResponse.json({ error: "Invalid comment." }, { status: 400 });

    await connectDB();
    void User;
    const target = await Post.findById(params.id).select("user");
    if (!target) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    // Replying? The comment must belong to this post. Replies stay one level deep: a reply to a reply
    // is filed under the same top-level comment (the person you answered is still the one notified).
    let parent = null;
    if (parentId) {
      parent = await Comment.findOne({ _id: parentId, post: params.id }).select("user parent");
      if (!parent) return NextResponse.json({ error: "The comment you are replying to no longer exists." }, { status: 404 });
    }

    const created = await Comment.create({ post: params.id, user: userId, text: clean, parent: parent ? parent.parent ?? parent._id : null });
    await Post.updateOne({ _id: params.id }, { $inc: { commentCount: 1 } });

    // Who hears about it:
    //  - the person you replied to   → "replied to your comment"
    //  - the post's author           → "commented on your post" (unless they are the person already told above)
    if (parent) await notify({ recipient: parent.user, actor: userId, type: "reply", post: params.id, text: clean });
    if (!parent || String(parent.user) !== String(target.user)) {
      await notify({ recipient: target.user, actor: userId, type: "comment", post: params.id, text: clean });
    }

    const comment = await Comment.findById(created._id).populate("user", "name username image").lean();
    return NextResponse.json({ comment: shape(comment) }, { status: 201 });
  } catch (err) {
    console.error("[create comment]", err);
    return NextResponse.json({ error: "Could not post your comment." }, { status: 500 });
  }
}
