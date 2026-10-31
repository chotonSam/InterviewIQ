import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import { getSessionUserId } from "@/lib/session";
import { chatStart } from "@/lib/gemini";
import { LEVELS, sanitizeTopic, isValidTopic } from "@/lib/topics";

// POST /api/chat { topic, level } → starts a practice chat; the coach greets and asks the first question
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const body = await req.json();
    const topic = sanitizeTopic(body.topic);
    const level = LEVELS.includes(body.level) ? body.level : "Easy";
    if (!isValidTopic(topic)) return NextResponse.json({ error: "Enter a topic (2–60 letters/numbers)." }, { status: 400 });

    let start;
    try {
      start = await chatStart({ topic, level });
    } catch (err) {
      console.error("[chat start / gemini]", err);
      const hint = process.env.NODE_ENV !== "production" ? ` (${err.message})` : "";
      return NextResponse.json({ error: "The AI coach could not start right now. Please try again." + hint }, { status: 502 });
    }

    const messages = [];
    if (start.message) messages.push({ role: "ai", kind: "message", text: start.message });
    messages.push({ role: "ai", kind: "question", text: start.question.text, code: start.question.code });

    await connectDB();
    const session = await ChatSession.create({ user: userId, topic, level: start.level, messages });
    return NextResponse.json({ id: String(session._id) }, { status: 201 });
  } catch (err) {
    console.error("[create chat]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
