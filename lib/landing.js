import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Interview from "@/lib/models/Interview";
import Feedback from "@/lib/models/Feedback";
import Post from "@/lib/models/Post";
import { getCurrentUser } from "@/lib/session";

// The landing page must never break because of the database, so every lookup is guarded.
export async function getLandingUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function getLandingData() {
  try {
    await connectDB();
    void User;
    const [learners, completed, answers, avg, posts] = await Promise.all([
      User.countDocuments(),
      Interview.countDocuments({ status: "completed" }),
      Feedback.countDocuments(),
      Interview.aggregate([{ $match: { status: "completed", score: { $ne: null } } }, { $group: { _id: null, avg: { $avg: "$score" } } }]),
      Post.find().sort({ likeCount: -1, createdAt: -1 }).limit(3).populate("user", "name image").lean(),
    ]);

    return {
      stats: { learners, completed, answers, avg: avg[0] ? Math.round(avg[0].avg) : null },
      posts: posts.map((p) => ({
        id: String(p._id),
        author: p.user?.name ?? "Member",
        image: p.user?.image ?? "",
        title: p.title,
        body: p.body,
        tag: p.tag,
        createdAt: p.createdAt.toISOString(),
        likes: p.likeCount,
        comments: p.commentCount,
      })),
    };
  } catch (err) {
    console.error("[landing data]", err);
    return { stats: null, posts: [] };
  }
}
