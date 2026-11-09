import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import LearningResource from "@/lib/models/LearningResource";
import Rating from "@/lib/models/Rating";
import { getSessionUserId } from "@/lib/session";
import { RESOURCE_TAGS, parseYouTubeId, cleanUrl } from "@/lib/resources";
import { fetchPreviewImage } from "@/lib/og";
import { verifiedOrResponse } from "@/lib/requireVerified";
import { isCloudinaryImage } from "@/lib/avatar";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 6;

// GET /api/resources?page=1&type=video|article&tag=Frontend&q=react&sort=new|top|popular&mine=1
export async function GET(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const type = ["video", "article"].includes(sp.get("type")) ? sp.get("type") : null;
    const tag = RESOURCE_TAGS.includes(sp.get("tag")) ? sp.get("tag") : null;
    const q = (sp.get("q") ?? "").trim().slice(0, 60);
    const sort = ["new", "top", "popular"].includes(sp.get("sort")) ? sp.get("sort") : "new";

    // Filters WITHOUT the topic — also used to count how many resources each topic has
    const base = {};
    if (type) base.type = type;
    if (sp.get("mine") === "1") base.user = new mongoose.Types.ObjectId(userId);
    if (q) {
      // the search text is escaped, so it is matched literally (no regex tricks)
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      base.$or = [{ title: rx }, { description: rx }];
    }
    const filter = tag ? { ...base, tag } : base;

    await connectDB();
    void User;
    const [total, tagRows] = await Promise.all([
      LearningResource.countDocuments(filter),
      LearningResource.aggregate([{ $match: base }, { $group: { _id: "$tag", n: { $sum: 1 } } }]),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const tagCounts = Object.fromEntries(tagRows.map((r) => [r._id, r.n]));
    const skip = (page - 1) * PAGE_SIZE;

    let items;
    if (sort === "new") {
      items = await LearningResource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).populate("user", "name username").lean();
    } else {
      // "top" = best average rating, "popular" = most ratings. Rank first, then load that page of documents.
      const order = sort === "top" ? { avg: -1, ratingCount: -1, createdAt: -1 } : { ratingCount: -1, avg: -1, createdAt: -1 };
      const ranked = await LearningResource.aggregate([
        { $match: filter },
        { $addFields: { avg: { $cond: [{ $gt: ["$ratingCount", 0] }, { $divide: ["$ratingSum", "$ratingCount"] }, 0] } } },
        { $sort: order },
        { $skip: skip },
        { $limit: PAGE_SIZE },
        { $project: { _id: 1 } },
      ]);
      const ids = ranked.map((r) => r._id);
      const docs = await LearningResource.find({ _id: { $in: ids } }).populate("user", "name username").lean();
      const byId = new Map(docs.map((d) => [String(d._id), d]));
      items = ids.map((id) => byId.get(String(id))).filter(Boolean);
    }

    // Articles added before previews existed: look their preview image up once (a few at a time)
    const missing = items.filter((r) => r.type === "article" && !r.thumbnail && !r.thumbTried).slice(0, 3);
    if (missing.length) {
      await Promise.allSettled(
        missing.map(async (r) => {
          const img = await fetchPreviewImage(r.url);
          await LearningResource.updateOne({ _id: r._id }, { thumbnail: img, thumbTried: true });
          r.thumbnail = img;
          r.thumbTried = true;
        })
      );
    }

    const mine = await Rating.find({ user: userId, resource: { $in: items.map((r) => r._id) } }).select("resource value").lean();
    const myRatings = Object.fromEntries(mine.map((m) => [String(m.resource), m.value]));

    return NextResponse.json({
      page,
      totalPages,
      total,
      tagCounts,
      resources: items.map((r) => ({
        id: String(r._id),
        title: r.title,
        description: r.description,
        url: r.url,
        type: r.type,
        youtubeId: r.youtubeId,
        thumbnail: r.thumbnail ?? "",
        tag: r.tag,
        author: r.user?.name ?? "Unknown",
        authorUsername: r.user?.username ?? "",
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
    const customThumb = typeof data.thumbnail === "string" && data.thumbnail !== "" ? data.thumbnail : "";

    if (!title || title.length > 120) return NextResponse.json({ error: "Title is required (max 120 characters)." }, { status: 400 });
    if (description.length > 300) return NextResponse.json({ error: "Description is too long (max 300 characters)." }, { status: 400 });
    if (!url) return NextResponse.json({ error: "Enter a valid link starting with http:// or https://" }, { status: 400 });

    if (customThumb && !isCloudinaryImage(customThumb)) return NextResponse.json({ error: "Invalid thumbnail image." }, { status: 400 });

    const blocked = await verifiedOrResponse(userId);
    if (blocked) return blocked;

    const youtubeId = parseYouTubeId(url);
    // Thumbnail: the one the user uploaded, else (articles) the page's own preview image. Videos use YouTube's.
    const thumbnail = customThumb || (youtubeId ? "" : await fetchPreviewImage(url));

    await connectDB();
    const resource = await LearningResource.create({
      user: userId, title, description, url, tag,
      type: youtubeId ? "video" : "article",
      youtubeId: youtubeId ?? "",
      thumbnail,
      thumbTried: true,
    });
    return NextResponse.json({ id: String(resource._id) }, { status: 201 });
  } catch (err) {
    console.error("[create resource]", err);
    return NextResponse.json({ error: "Could not add the resource." }, { status: 500 });
  }
}
