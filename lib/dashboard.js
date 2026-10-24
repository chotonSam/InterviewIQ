import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";

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
    .populate("category", "name")
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
    const name = i.category?.name ?? "Other";
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
    trend: completed.slice(0, 8).reverse().map((i) => i.score),
    recent: all.slice(0, 5).map((i) => ({
      id: String(i._id),
      title: `${i.category?.name ?? "Interview"} · ${i.difficulty}`,
      when: formatWhen(i.createdAt),
      status: i.status,
      score: i.score,
      tone: typeof i.score === "number" ? toneFor(i.score) : "indigo",
    })),
  };
}
