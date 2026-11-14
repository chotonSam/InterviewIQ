import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import Answer from "@/lib/models/Answer";
import { getSessionUserId } from "@/lib/session";

// POST /api/interviews/:id/progress { questionId, seconds }
// Saves how long you have actively spent on an unanswered question, so the timer picks up where
// you left off after a refresh or after leaving and coming back. (Also sent with sendBeacon when the page closes.)
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const { questionId, seconds } = await req.json();
    const s = Math.round(Number(seconds));
    if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(questionId) || !Number.isFinite(s) || s < 0 || s > 3600) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await connectDB();
    if (!(await Interview.exists({ _id: params.id, user: userId }))) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
    if (await Answer.exists({ question: questionId })) return NextResponse.json({ ok: true }); // already answered: nothing to save

    // time only ever moves forward (an old, late request can't wind it back)
    await Question.updateOne({ _id: questionId, interview: params.id, timeSpent: { $lt: s } }, { timeSpent: s });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[save progress]", err);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}
