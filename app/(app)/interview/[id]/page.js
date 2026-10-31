import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import Answer from "@/lib/models/Answer";
import Feedback from "@/lib/models/Feedback";
import { getSessionUserId } from "@/lib/session";
import { nextLevelAfter } from "@/lib/topics";
import InterviewSession from "@/components/interview/InterviewSession";

export const metadata = { title: "Mock Interview — InterviewIQ" };

export default async function InterviewPage({ params }) {
  const userId = await getSessionUserId();
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  void Category;

  const interview = await Interview.findOne({ _id: params.id, user: userId }).populate("category", "name slug").lean();
  if (!interview) notFound();

  const [questions, answers, feedbacks] = await Promise.all([
    Question.find({ interview: interview._id }).sort({ order: 1 }).lean(),
    Answer.find({ interview: interview._id }).lean(),
    Feedback.find({ interview: interview._id }).lean(),
  ]);

  const answerByQ = Object.fromEntries(answers.map((a) => [String(a.question), a]));
  const feedbackByQ = Object.fromEntries(feedbacks.map((f) => [String(f.question), f]));

  const isCustom = interview.category?.slug === "custom";
  const topic = interview.topic || interview.category?.name || "Interview";

  const data = {
    id: String(interview._id),
    topic,
    difficulty: interview.difficulty,
    completed: interview.status === "completed",
    score: interview.score,
    nextLevel: nextLevelAfter(interview.difficulty),
    // what the "start next level" button sends to /api/interviews
    startPayload: isCustom ? { customTopic: topic } : { categoryId: String(interview.category?._id) },
    questions: questions.map((q) => {
      const a = answerByQ[String(q._id)];
      const f = feedbackByQ[String(q._id)];
      return {
        id: String(q._id),
        text: q.text,
        code: q.code ?? "",
        kind: q.kind ?? "quick",
        answer: a?.text ?? "",
        feedback: f ? { score: f.score, strengths: f.strengths, improvements: f.improvements, suggested: f.suggested } : null,
      };
    }),
  };

  return <InterviewSession interview={data} />;
}
