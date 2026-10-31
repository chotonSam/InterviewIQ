import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import { getSessionUserId } from "@/lib/session";
import { generateQuestions } from "@/lib/gemini";
import { getCustomCategory } from "@/lib/categories";
import { LEVELS, sanitizeTopic, isValidTopic, customKey, unlockedLevels } from "@/lib/topics";

const QUESTION_COUNT = 10;

// Create an interview.
//   body: { categoryId, difficulty }            → a standard category
//   body: { customTopic, difficulty }           → any field the user typed
// Rules: Easy is open; Medium needs a completed Easy; Hard needs a completed Medium (per topic).
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { categoryId, customTopic, difficulty } = await req.json();
    if (!LEVELS.includes(difficulty)) return NextResponse.json({ error: "Choose a difficulty." }, { status: 400 });

    // ---- which topic? ----
    let category, topic, topicKey;
    const isCustom = typeof customTopic === "string" && customTopic.trim() !== "";

    if (isCustom) {
      topic = sanitizeTopic(customTopic);
      if (!isValidTopic(topic)) return NextResponse.json({ error: "Enter a field name (2–60 letters/numbers)." }, { status: 400 });
      category = await getCustomCategory();
      topicKey = customKey(topic);
    } else {
      if (!mongoose.isValidObjectId(categoryId)) return NextResponse.json({ error: "Choose a category." }, { status: 400 });
      await connectDB();
      category = await Category.findById(categoryId).lean();
      if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
      topic = category.name;
      topicKey = String(category._id);
    }
    await connectDB();

    // Interviews created before "topicKey" existed are matched through their category
    const sameTopic = isCustom
      ? { topicKey }
      : { $or: [{ topicKey }, { topicKey: { $in: ["", null] }, category: category._id }] };

    // ---- is this level unlocked? ----
    const done = await Interview.find({ user: userId, status: "completed", ...sameTopic }).select("difficulty").lean();
    const unlocked = unlockedLevels(done.map((d) => d.difficulty));
    if (!unlocked[difficulty]) {
      const need = LEVELS[LEVELS.indexOf(difficulty) - 1];
      return NextResponse.json({ error: `Locked. Complete ${need} on this topic first.` }, { status: 403 });
    }

    // ---- unfinished interview at this level? continue it instead of making a new one ----
    const unfinished = await Interview.findOne({ user: userId, status: "in_progress", difficulty, ...sameTopic }).select("_id").lean();
    if (unfinished) return NextResponse.json({ id: String(unfinished._id), resumed: true });

    // ---- generate FIRST, so a failed AI call leaves nothing behind ----
    let questions;
    try {
      questions = await generateQuestions({ topic, difficulty, count: QUESTION_COUNT });
    } catch (err) {
      console.error("[create interview / gemini]", err);
      const hint = process.env.NODE_ENV !== "production" ? ` (${err.message})` : "";
      return NextResponse.json({ error: "The AI could not generate questions right now. Please try again." + hint }, { status: 502 });
    }

    const interview = await Interview.create({ user: userId, category: category._id, topic, topicKey, difficulty });
    await Question.insertMany(
      questions.map((q, i) => ({ interview: interview._id, order: i + 1, text: q.text, code: q.code, kind: q.kind }))
    );

    return NextResponse.json({ id: String(interview._id) }, { status: 201 });
  } catch (err) {
    console.error("[create interview]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
