import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Interview from "@/lib/models/Interview";
import Post from "@/lib/models/Post";
import LearningResource from "@/lib/models/LearningResource";
import { getProgressSummary } from "@/lib/progress";

// Everything shown on a profile page. Email and phone are NOT included (private).
export async function getProfileData(targetId) {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(String(targetId));

  const [user, interviews, myPosts, myResources, postAgg, resourceCount, progress] = await Promise.all([
    User.findById(oid).select("name username bio image createdAt emailVerified").lean(),
    Interview.find({ user: oid, status: "completed" }).select("score").lean(),
    Post.find({ user: oid }).sort({ createdAt: -1 }).limit(30).lean(),
    LearningResource.find({ user: oid }).sort({ createdAt: -1 }).limit(30).lean(),
    Post.aggregate([{ $match: { user: oid } }, { $group: { _id: null, posts: { $sum: 1 }, likes: { $sum: "$likeCount" } } }]),
    LearningResource.countDocuments({ user: oid }),
    getProgressSummary(String(targetId)),
  ]);
  if (!user) return null;

  const scores = interviews.map((i) => i.score ?? 0);
  return {
    user: {
      id: String(user._id),
      name: user.name,
      username: user.username,
      bio: user.bio ?? "",
      image: user.image ?? "",
      verified: Boolean(user.emailVerified),
      joined: new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    },
    stats: {
      interviews: interviews.length,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      best: scores.length ? Math.max(...scores) : null,
      posts: postAgg[0]?.posts ?? 0,
      likes: postAgg[0]?.likes ?? 0,
      resources: resourceCount,
    },
    levels: progress.filter((p) => p.completed.length > 0),
    posts: myPosts.map((p) => ({
      id: String(p._id), title: p.title, body: p.body, tag: p.tag, likes: p.likeCount, comments: p.commentCount, createdAt: p.createdAt.toISOString(),
    })),
    resources: myResources.map((r) => ({
      id: String(r._id), title: r.title, type: r.type, youtubeId: r.youtubeId, thumbnail: r.thumbnail ?? "", url: r.url, tag: r.tag,
      avg: r.ratingCount ? Math.round((r.ratingSum / r.ratingCount) * 10) / 10 : null, ratingCount: r.ratingCount, createdAt: r.createdAt.toISOString(),
    })),
  };
}
