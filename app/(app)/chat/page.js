import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import { getSessionUserId } from "@/lib/session";
import ChatStart from "@/components/chat/ChatStart";
import ChatList from "@/components/chat/ChatList";

export const metadata = { title: "Practice Chat — InterviewIQ" };

export default async function ChatHomePage() {
  const userId = await getSessionUserId();
  await connectDB();
  const sessions = await ChatSession.find({ user: userId }).sort({ updatedAt: -1 }).limit(15).select("topic level updatedAt messages").lean();

  const list = sessions.map((s) => ({
    id: String(s._id),
    topic: s.topic,
    level: s.level,
    count: s.messages.length,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">Casual practice, no scoring</p>
            <h1 className="mt-1 font-display text-2xl leading-none">Practice chat</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-6 py-10 lg:px-10">
        <p className="text-sm leading-relaxed text-slate-muted">
          Chat with an AI coach on any topic. It asks short questions one at a time and gives instant feedback on your answers.
          You can ask for a hint, an explanation, or harder questions whenever you like. Unlike a mock interview, nothing here is scored or locked.
        </p>
        <ChatStart />
        <ChatList sessions={list} />
      </main>
    </>
  );
}
