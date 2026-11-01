import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Like from "@/lib/models/Like";
import { getSessionUserId } from "@/lib/session";
import { serializePost } from "@/lib/posts";
import PostView from "@/components/community/PostView";

export const metadata = { title: "Post — InterviewIQ" };

export default async function SinglePostPage({ params }) {
  const userId = await getSessionUserId();
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  void User;
  const post = await Post.findById(params.id).populate("user", "name username image").lean();
  if (!post) notFound();

  const liked = await Like.exists({ post: post._id, user: userId });
  const data = serializePost(post, userId, new Set(liked ? [String(post._id)] : []));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-6 lg:px-10">
          <Link href="/community" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">← Community</Link>
          <h1 className="truncate font-display text-2xl leading-none">Post</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
        <PostView initial={data} />
      </main>
    </>
  );
}
