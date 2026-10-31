import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";
import Question from "@/lib/models/Question";
import Feedback from "@/lib/models/Feedback";
import { getProgressSummary } from "@/lib/progress";
import { recommendedLevel } from "@/lib/topics";

export function toneFor(score) {
  if (score >= 80) return "green";
  if (score >= 70) return "indigo";
  if (score >= 60) return "amber";
  return "red";
}

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

export function formatWhen(date) {
  return new Date(date).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export async function getDashboardData(userId) {
  await connectDB();
  void Category; // make sure the model is registered for populate

  const all = await Interview.find({ user: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .populate("category", "name slug")
    .lean();

  const completed = all.filter((i) => i.status === "completed" && typeof i.score === "number");
  const avg = completed.length ? Math.round(completed.reduce((s, i) => s + i.score, 0) / completed.length) : null;

  // Practice streak: consecutive days (ending today or yesterday) with at least one interview
  const days = new Set(all.map((i) => dayKey(i.createdAt)));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Average score per category
  const byCat = {};
  for (const i of completed) {
    const name = i.topic || i.category?.name || "Other";
    (byCat[name] ??= { sum: 0, count: 0 });
    byCat[name].sum += i.score;
    byCat[name].count += 1;
  }
  const categoryScores = Object.entries(byCat)
    .map(([name, v]) => ({ name, score: Math.round(v.sum / v.count) }))
    .sort((a, b) => b.score - a.score)
    .map((c) => ({ ...c, tone: toneFor(c.score) }));

  return {
    stats: {
      total: all.length,
      avg,
      streak,
      strongest: categoryScores[0]?.name ?? null,
    },
    categoryScores,
    trend: completed
      .slice(0, 10)
      .reverse()
      .map((i) => ({
        score: i.score,
        label: `${i.topic || i.category?.name || "Interview"} · ${i.difficulty}`,
        date: (i.completedAt || i.createdAt).toISOString(),
      })),
    nextUp: await buildNextUp(userId, all),
    recent: all.slice(0, 5).map((i) => ({
      id: String(i._id),
      title: `${i.topic || i.category?.name || "Interview"} · ${i.difficulty}`,
      when: formatWhen(i.createdAt),
      status: i.status,
      score: i.score,
      tone: typeof i.score === "number" ? toneFor(i.score) : "indigo",
    })),
  };
}

// "What should I do now?" — resume an unfinished interview, or suggest the next level on the latest topic
async function buildNextUp(userId, all) {
  if (all.length === 0) return { type: "first" };

  const unfinished = all.find((i) => i.status === "in_progress");
  if (unfinished) {
    const [done, total] = await Promise.all([
      Feedback.countDocuments({ interview: unfinished._id }),
      Question.countDocuments({ interview: unfinished._id }),
    ]);
    return {
      type: "resume",
      id: String(unfinished._id),
      title: `${unfinished.topic || unfinished.category?.name || "Interview"} · ${unfinished.difficulty}`,
      done,
      total,
    };
  }

  const latest = all[0];
  const key = latest.topicKey || String(latest.category?._id ?? "");
  const progress = (await getProgressSummary(userId)).find((p) => p.key === key);
  const completedLevels = progress?.completed ?? [];
  const level = recommendedLevel(completedLevels);
  if (completedLevels.includes(level)) return { type: "chat" }; // everything on this topic is done

  const topic = latest.topic || latest.category?.name || "Interview";
  const isCustom = latest.category?.slug === "custom";
  return {
    type: "next",
    topic,
    level,
    startPayload: isCustom ? { customTopic: topic } : { categoryId: String(latest.category?._id) },
  };
}
