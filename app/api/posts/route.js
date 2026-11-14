import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post, { POST_TAGS } from "@/lib/models/Post";
import Like from "@/lib/models/Like";
import { getSessionUserId } from "@/lib/session";
import { serializePost } from "@/lib/posts";
import { parseTag, sanitizeTag, isValidTag } from "@/lib/topics";
import { canonicalTag } from "@/lib/canonicalTag";
import { verifiedOrResponse } from "@/lib/requireVerified";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 5;

// GET /api/posts?page=1  → one page of posts (newest first) with "liked by me" flags
export async function GET(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const wanted = sanitizeTag(sp.get("tag") ?? "");
    const filter = isValidTag(wanted) ? { tag: wanted } : {}; // show only posts about one topic (built-in or typed)

    await connectDB();
    void User;
    const total = await Post.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "name username image")
      .lean();

    const liked = await Like.find({ user: userId, post: { $in: posts.map((p) => p._id) } }).select("post").lean();
    const likedSet = new Set(liked.map((l) => String(l.post)));

    // how many posts each topic has (for the filter chips); topics people typed themselves, most used first,
    // are also offered as suggestions in the form
    const rows = await Post.aggregate([{ $group: { _id: "$tag", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }]);
    const tagCounts = Object.fromEntries(rows.map((r) => [r._id, r.n]));
    const custom = rows.filter((r) => !POST_TAGS.includes(r._id)).slice(0, 30);

    return NextResponse.json({
      page,
      totalPages,
      total,
      tagCounts,
      topics: custom.map((c) => c._id),
      posts: posts.map((p) => serializePost(p, userId, likedSet)),
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
    const parsed = parseTag(data.tag);

    if (!title || title.length > 120) return NextResponse.json({ error: "Title is required (max 120 characters)." }, { status: 400 });
    if (!body || body.length > 2000) return NextResponse.json({ error: "Post text is required (max 2000 characters)." }, { status: 400 });

    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const blocked = await verifiedOrResponse(userId);
    if (blocked) return blocked;

    await connectDB();
    const tag = parsed.tag ? await canonicalTag(Post, parsed.tag, POST_TAGS) : "Experience";
    const post = await Post.create({ user: userId, title, body, tag });
    return NextResponse.json({ id: String(post._id) }, { status: 201 });
  } catch (err) {
    console.error("[create post]", err);
    return NextResponse.json({ error: "Could not publish your post." }, { status: 500 });
  }
}
