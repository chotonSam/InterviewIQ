import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import Answer from "@/lib/models/Answer";
import Feedback from "@/lib/models/Feedback";
import { getSessionUserId } from "@/lib/session";
import { evaluateAnswer } from "@/lib/gemini";

// Submit an answer: server sends question + answer to Gemini, stores answer + feedback
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { questionId, text } = await req.json();
    const answerText = String(text ?? "").trim();

    if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(questionId)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (!answerText) return NextResponse.json({ error: "Write an answer first." }, { status: 400 });
    if (answerText.length > 4000) return NextResponse.json({ error: "Answer is too long (max 4000 characters)." }, { status: 400 });

    await connectDB();

    const interview = await Interview.findOne({ _id: params.id, user: userId }).populate("category", "name");
    if (!interview) return NextResponse.json({ error: "Interview not found." }, { status: 404 });

    const question = await Question.findOne({ _id: questionId, interview: interview._id });
    if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

    if (await Answer.exists({ question: question._id })) {
      return NextResponse.json({ error: "This question was already answered." }, { status: 409 });
    }

    // Evaluate BEFORE saving so a failed AI call can simply be retried
    let result;
    try {
      result = await evaluateAnswer({
        category: interview.category.name,
        difficulty: interview.difficulty,
        question: question.text,
        answer: answerText,
      });
    } catch (err) {
      console.error("[evaluate / gemini]", err);
      const hint = process.env.NODE_ENV !== "production" ? ` (${err.message})` : "";
      return NextResponse.json({ error: "The AI could not evaluate your answer right now. Please try again." + hint }, { status: 502 });
    }

    const answer = await Answer.create({ interview: interview._id, question: question._id, user: userId, text: answerText });
    await Feedback.create({ answer: answer._id, interview: interview._id, question: question._id, ...result });

    // Completed when every question has feedback → interview score = average
    const [totalQuestions, feedbacks] = await Promise.all([
      Question.countDocuments({ interview: interview._id }),
      Feedback.find({ interview: interview._id }).select("score").lean(),
    ]);

    let completed = false;
    let interviewScore = null;
    if (feedbacks.length >= totalQuestions) {
      interviewScore = Math.round(feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length);
      interview.status = "completed";
      interview.score = interviewScore;
      interview.completedAt = new Date();
      await interview.save();
      completed = true;
    }

    return NextResponse.json({ feedback: result, completed, interviewScore });
  } catch (err) {
    if (err?.code === 11000) return NextResponse.json({ error: "This question was already answered." }, { status: 409 });
    console.error("[submit answer]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
