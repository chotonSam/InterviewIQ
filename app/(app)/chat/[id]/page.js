import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import { getSessionUserId } from "@/lib/session";
import ChatRoom from "@/components/chat/ChatRoom";

export const metadata = { title: "Practice Chat — InterviewIQ" };

export default async function ChatPage({ params }) {
  const userId = await getSessionUserId();
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  const s = await ChatSession.findOne({ _id: params.id, user: userId }).lean();
  if (!s) notFound();

  const session = {
    id: String(s._id),
    topic: s.topic,
    level: s.level,
    messages: s.messages.map((m) => ({
      id: String(m._id), role: m.role, kind: m.kind, text: m.text, code: m.code, verdict: m.verdict, ideal: m.ideal,
    })),
  };

  return <ChatRoom session={session} />;
}
