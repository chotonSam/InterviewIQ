import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import { getSessionUserId } from "@/lib/session";
import { chatReply } from "@/lib/gemini";

const MAX_MESSAGES = 200;

const serializeMessage = (m) => ({
  id: String(m._id),
  role: m.role,
  kind: m.kind,
  text: m.text,
  code: m.code,
  verdict: m.verdict,
  ideal: m.ideal,
});

// The question the coach is still waiting for an answer to (asked after the last feedback)
function pendingQuestion(messages) {
  const lastQ = messages.map((m) => m.kind).lastIndexOf("question");
  const lastFb = messages.map((m) => m.kind).lastIndexOf("feedback");
  return lastQ > lastFb ? messages[lastQ] : null;
}

// POST /api/chat/:id { message } → the user's message + the coach's structured reply
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid chat." }, { status: 400 });

  try {
    const { message } = await req.json();
    const text = String(message ?? "").trim();
    if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });

    await connectDB();
    const session = await ChatSession.findOne({ _id: params.id, user: userId });
    if (!session) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    if (session.messages.length >= MAX_MESSAGES) {
      return NextResponse.json({ error: "This chat is full. Start a new one to keep practicing." }, { status: 409 });
    }

    let reply;
    try {
      reply = await chatReply({
        topic: session.topic,
        level: session.level,
        history: session.messages.map((m) => ({ role: m.role, kind: m.kind, text: m.text, code: m.code, verdict: m.verdict })),
        pending: pendingQuestion(session.messages),
        message: text,
      });
    } catch (err) {
      console.error("[chat reply / gemini]", err);
      const hint = process.env.NODE_ENV !== "production" ? ` (${err.message})` : "";
      return NextResponse.json({ error: "The AI coach could not reply right now. Please try again." + hint }, { status: 502 });
    }

    // Order matters: feedback on your answer → any explanation → the next question
    const added = [{ role: "user", kind: "text", text }];
    if (reply.feedback) added.push({ role: "ai", kind: "feedback", text: reply.feedback.comment, verdict: reply.feedback.verdict, ideal: reply.feedback.ideal });
    if (reply.message) added.push({ role: "ai", kind: "message", text: reply.message });
    if (reply.question) added.push({ role: "ai", kind: "question", text: reply.question.text, code: reply.question.code });

    session.messages.push(...added);
    session.level = reply.level;
    await session.save();

    return NextResponse.json({
      level: session.level,
      messages: session.messages.slice(-added.length).map(serializeMessage),
    });
  } catch (err) {
    console.error("[chat message]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

// DELETE /api/chat/:id
export async function DELETE(_req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid chat." }, { status: 400 });

  try {
    await connectDB();
    const deleted = await ChatSession.findOneAndDelete({ _id: params.id, user: userId });
    if (!deleted) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete chat]", err);
    return NextResponse.json({ error: "Could not delete the chat." }, { status: 500 });
  }
}
