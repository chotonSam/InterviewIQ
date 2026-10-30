import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import LearningResource from "@/lib/models/LearningResource";
import Rating from "@/lib/models/Rating";
import { getSessionUserId } from "@/lib/session";
import { RESOURCE_TAGS, parseYouTubeId, cleanUrl } from "@/lib/resources";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 6;

// GET /api/resources?page=1&type=video|article
export async function GET(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const type = ["video", "article"].includes(sp.get("type")) ? sp.get("type") : null;
    const filter = type ? { type } : {};

    await connectDB();
    void User;
    const total = await LearningResource.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const items = await LearningResource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "name username")
      .lean();

    const mine = await Rating.find({ user: userId, resource: { $in: items.map((r) => r._id) } }).select("resource value").lean();
    const myRatings = Object.fromEntries(mine.map((m) => [String(m.resource), m.value]));

    return NextResponse.json({
      page,
      totalPages,
      resources: items.map((r) => ({
        id: String(r._id),
        title: r.title,
        description: r.description,
        url: r.url,
        type: r.type,
        youtubeId: r.youtubeId,
        tag: r.tag,
        author: r.user?.name ?? "Unknown",
        mine: String(r.user?._id) === String(userId),
        createdAt: r.createdAt,
        avg: r.ratingCount ? Math.round((r.ratingSum / r.ratingCount) * 10) / 10 : null,
        ratingCount: r.ratingCount,
        myRating: myRatings[String(r._id)] ?? 0,
      })),
    });
  } catch (err) {
    console.error("[list resources]", err);
    return NextResponse.json({ error: "Could not load resources." }, { status: 500 });
  }
}

// POST /api/resources  { title, url, tag, description }
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const data = await req.json();
    const title = String(data.title ?? "").trim();
    const description = String(data.description ?? "").trim();
    const url = cleanUrl(data.url);
    const tag = RESOURCE_TAGS.includes(data.tag) ? data.tag : "General";

    if (!title || title.length > 120) return NextResponse.json({ error: "Title is required (max 120 characters)." }, { status: 400 });
    if (description.length > 300) return NextResponse.json({ error: "Description is too long (max 300 characters)." }, { status: 400 });
    if (!url) return NextResponse.json({ error: "Enter a valid link starting with http:// or https://" }, { status: 400 });

    const youtubeId = parseYouTubeId(url);

    await connectDB();
    const resource = await LearningResource.create({
      user: userId, title, description, url, tag,
      type: youtubeId ? "video" : "article",
      youtubeId: youtubeId ?? "",
    });
    return NextResponse.json({ id: String(resource._id) }, { status: 201 });
  } catch (err) {
    console.error("[create resource]", err);
    return NextResponse.json({ error: "Could not add the resource." }, { status: 500 });
  }
}
