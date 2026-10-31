import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";

export const CUSTOM_SLUG = "custom";

const DEFAULTS = [
  { name: "Frontend Development", slug: "frontend", description: "HTML, CSS, JavaScript, React, browsers" },
  { name: "Backend Development", slug: "backend", description: "APIs, databases, servers, authentication" },
  { name: "System Design", slug: "system-design", description: "Scalability, architecture, trade-offs" },
  { name: "HR / Behavioral", slug: "hr-behavioral", description: "Teamwork, conflict, motivation, experience" },
  { name: "Data Structures & Algorithms", slug: "dsa", description: "Problem solving and complexity" },
  // Holder for user-typed fields (not shown as a normal card)
  { name: "Custom field", slug: CUSTOM_SLUG, description: "Any field the user types" },
];

// Makes sure every default exists (safe to run many times), then returns the visible ones
export async function ensureCategories() {
  await connectDB();
  await Category.bulkWrite(
    DEFAULTS.map(({ slug, ...rest }) => ({ updateOne: { filter: { slug }, update: { $setOnInsert: rest }, upsert: true } }))
  );
  const cats = await Category.find({ slug: { $ne: CUSTOM_SLUG } }).sort({ name: 1 }).lean();
  return cats.map((c) => ({ id: String(c._id), name: c.name, description: c.description }));
}

export async function getCustomCategory() {
  await connectDB();
  const { slug, ...rest } = DEFAULTS.find((d) => d.slug === CUSTOM_SLUG);
  return Category.findOneAndUpdate({ slug }, { $setOnInsert: rest }, { upsert: true, new: true });
}
