import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import { getSessionUserId } from "@/lib/session";
import { generateQuestions } from "@/lib/gemini";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QUESTION_COUNT = 6;

// Create an interview: server asks Gemini for questions, validates, then saves everything
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { categoryId, difficulty } = await req.json();

    if (!mongoose.isValidObjectId(categoryId)) return NextResponse.json({ error: "Choose a category." }, { status: 400 });
    if (!DIFFICULTIES.includes(difficulty)) return NextResponse.json({ error: "Choose a difficulty." }, { status: 400 });

    await connectDB();
    const category = await Category.findById(categoryId).lean();
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    // Generate first — if the AI fails we don't leave an empty interview behind
    let questions;
    try {
      questions = await generateQuestions({ category: category.name, difficulty, count: QUESTION_COUNT });
    } catch (err) {
      console.error("[create interview / gemini]", err);
      return NextResponse.json({ error: "The AI could not generate questions right now. Please try again." }, { status: 502 });
    }

    const interview = await Interview.create({ user: userId, category: category._id, difficulty });
    await Question.insertMany(questions.map((text, i) => ({ interview: interview._id, order: i + 1, text })));

    return NextResponse.json({ id: String(interview._id) }, { status: 201 });
  } catch (err) {
    console.error("[create interview]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
