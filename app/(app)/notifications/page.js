import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Notification from "@/lib/models/Notification";
import { getSessionUserId } from "@/lib/session";
import NotificationList from "@/components/notifications/NotificationList";

export const metadata = { title: "Notifications — InterviewIQ" };

export default async function NotificationsPage() {
  const userId = await getSessionUserId();
  await connectDB();
  void User; void Post;

  const items = await Notification.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate("actor", "name username image")
    .populate("post", "title")
    .lean();

  const initial = items
    .filter((n) => n.post && n.actor)
    .map((n) => ({
      id: String(n._id),
      type: n.type,
      text: n.text,
      read: n.read,
      createdAt: n.updatedAt.toISOString(),
      actor: { name: n.actor.name, username: n.actor.username, image: n.actor.image ?? "" },
      postId: String(n.post._id),
      postTitle: n.post.title,
    }));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">Comments and likes on your posts</p>
            <h1 className="mt-1 font-display text-2xl leading-none">Notifications</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
        <NotificationList initial={initial} />
      </main>
    </>
  );
}
