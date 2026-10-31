import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post, { POST_TAGS } from "@/lib/models/Post";
import Like from "@/lib/models/Like";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 5;

// GET /api/posts?page=1  → one page of posts (newest first) with "liked by me" flags
export async function GET(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const page = Math.max(1, parseInt(new URL(req.url).searchParams.get("page") ?? "1", 10) || 1);

    await connectDB();
    void User;
    const total = await Post.countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "name username image")
      .lean();

    const liked = await Like.find({ user: userId, post: { $in: posts.map((p) => p._id) } }).select("post").lean();
    const likedSet = new Set(liked.map((l) => String(l.post)));

    return NextResponse.json({
      page,
      totalPages,
      posts: posts.map((p) => ({
        id: String(p._id),
        author: p.user?.name ?? "Unknown",
        username: p.user?.username ?? "",
        authorImage: p.user?.image ?? "",
        mine: String(p.user?._id) === String(userId),
        title: p.title,
        body: p.body,
        tag: p.tag,
        createdAt: p.createdAt,
        likes: p.likeCount,
        comments: p.commentCount,
        liked: likedSet.has(String(p._id)),
      })),
    });
  } catch (err) {
    console.error("[list posts]", err);
    return NextResponse.json({ error: "Could not load posts." }, { status: 500 });
  }
}

// POST /api/posts  { title, body, tag }
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const data = await req.json();
    const title = String(data.title ?? "").trim();
    const body = String(data.body ?? "").trim();
    const tag = POST_TAGS.includes(data.tag) ? data.tag : "Experience";

    if (!title || title.length > 120) return NextResponse.json({ error: "Title is required (max 120 characters)." }, { status: 400 });
    if (!body || body.length > 2000) return NextResponse.json({ error: "Post text is required (max 2000 characters)." }, { status: 400 });

    await connectDB();
    const post = await Post.create({ user: userId, title, body, tag });
    return NextResponse.json({ id: String(post._id) }, { status: 201 });
  } catch (err) {
    console.error("[create post]", err);
    return NextResponse.json({ error: "Could not publish your post." }, { status: 500 });
  }
}
