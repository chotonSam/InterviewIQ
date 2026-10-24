import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";

const DEFAULTS = [
  { name: "Frontend Development", slug: "frontend", description: "HTML, CSS, JavaScript, React, browsers" },
  { name: "Backend Development", slug: "backend", description: "APIs, databases, servers, authentication" },
  { name: "System Design", slug: "system-design", description: "Scalability, architecture, trade-offs" },
  { name: "HR / Behavioral", slug: "hr-behavioral", description: "Teamwork, conflict, motivation, experience" },
  { name: "Data Structures & Algorithms", slug: "dsa", description: "Problem solving and complexity" },
];

// Seeds the default categories the first time, then returns them
export async function ensureCategories() {
  await connectDB();
  if ((await Category.countDocuments()) === 0) {
    try {
      await Category.insertMany(DEFAULTS, { ordered: false });
    } catch {
      /* another request seeded at the same time — fine */
    }
  }
  const cats = await Category.find().sort({ name: 1 }).lean();
  return cats.map((c) => ({ id: String(c._id), name: c.name, description: c.description }));
}
