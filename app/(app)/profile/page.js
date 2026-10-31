import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Interview from "@/lib/models/Interview";
import Post from "@/lib/models/Post";
import LearningResource from "@/lib/models/LearningResource";
import { getSessionUserId } from "@/lib/session";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileActivity from "@/components/profile/ProfileActivity";

export const metadata = { title: "Profile — InterviewIQ" };

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  await connectDB();

  const [user, interviews, myPosts, myResources] = await Promise.all([
    User.findById(userId).select("name username email phone image createdAt").lean(),
    Interview.find({ user: new mongoose.Types.ObjectId(userId), status: "completed" }).select("score").lean(),
    Post.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
    LearningResource.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const posts = myPosts.map((p) => ({
    id: String(p._id), title: p.title, body: p.body, tag: p.tag, likes: p.likeCount, comments: p.commentCount, createdAt: p.createdAt.toISOString(),
  }));
  const resources = myResources.map((r) => ({
    id: String(r._id), title: r.title, type: r.type, youtubeId: r.youtubeId, thumbnail: r.thumbnail ?? "", url: r.url, tag: r.tag,
    avg: r.ratingCount ? Math.round((r.ratingSum / r.ratingCount) * 10) / 10 : null, ratingCount: r.ratingCount, createdAt: r.createdAt.toISOString(),
  }));

  const avg = interviews.length ? Math.round(interviews.reduce((s, i) => s + (i.score ?? 0), 0) / interviews.length) : null;
  const since = new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const stats = [
    { label: "Interviews completed", value: interviews.length },
    { label: "Average score", value: avg ?? "—" },
    { label: "Community posts", value: posts.length },
    { label: "Member since", value: since, small: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">{user.username}</p>
            <h1 className="mt-1 font-display text-2xl leading-none">Profile</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10 lg:px-10">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-5">
              <p className="mb-2 font-mono text-xs text-slate-muted">{s.label}</p>
              <p className={`font-display ${s.small ? "text-xl leading-9" : "text-3xl"}`}>{s.value}</p>
            </div>
          ))}
        </section>

        <ProfileForm
          user={{ name: user.name, username: user.username, email: user.email, phone: user.phone ?? "", image: user.image ?? "" }}
        />

        <ProfileActivity posts={posts} resources={resources} />
      </main>
    </>
  );
}
