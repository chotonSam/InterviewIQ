import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Interview from "@/lib/models/Interview";

// One entry per topic the user has touched: { key, label, completed: ["Easy", ...] }
export async function getProgressSummary(userId) {
  await connectDB();
  void Category;
  const rows = await Interview.find({ user: new mongoose.Types.ObjectId(userId) })
    .select("category topic topicKey difficulty status")
    .populate("category", "name")
    .lean();

  const map = new Map();
  for (const r of rows) {
    const key = r.topicKey || String(r.category?._id ?? "");
    if (!key) continue;
    if (!map.has(key)) map.set(key, { key, label: r.topic || r.category?.name || "Interview", completed: [] });
    if (r.status === "completed" && !map.get(key).completed.includes(r.difficulty)) map.get(key).completed.push(r.difficulty);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}
