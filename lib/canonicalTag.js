import { connectDB } from "@/lib/db";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Keeps one spelling per topic, so "react", "React" and "REACT" don't become three different topics:
//  1. matches a built-in topic ignoring capitals  ->  uses the built-in spelling
//  2. matches a topic somebody already created    ->  reuses their spelling
//  3. otherwise it's new                          ->  first letter capitalised
export async function canonicalTag(Model, tag, presets) {
  const preset = presets.find((p) => p.toLowerCase() === tag.toLowerCase());
  if (preset) return preset;
  await connectDB();
  const existing = await Model.findOne({ tag: new RegExp(`^${escapeRegex(tag)}$`, "i") }).select("tag").lean();
  return existing?.tag ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}
