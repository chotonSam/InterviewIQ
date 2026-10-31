// Shared helpers for interview topics and the Easy → Medium → Hard progression.
export const LEVELS = ["Easy", "Medium", "Hard"];

// Free-text topics (custom fields) are cleaned before use: letters, numbers, spaces and a few symbols only
export function sanitizeTopic(raw) {
  return String(raw ?? "")
    .replace(/[^\p{L}\p{N} &+.#/\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function isValidTopic(topic) {
  return topic.length >= 2 && /\p{L}/u.test(topic);
}

// Progress is tracked per topic. Custom topics use a key built from their name.
export function customKey(topic) {
  const slug = topic.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `custom:${slug}`;
}

// Easy is always open. Medium opens after completing Easy. Hard opens after completing Medium.
export function unlockedLevels(completed = []) {
  const done = new Set(completed);
  return { Easy: true, Medium: done.has("Easy"), Hard: done.has("Medium") };
}

export function nextLevelAfter(level) {
  const i = LEVELS.indexOf(level);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
}

// The level a person should do next on a topic
export function recommendedLevel(completed = []) {
  const unlocked = unlockedLevels(completed);
  return LEVELS.find((l) => unlocked[l] && !completed.includes(l)) ?? "Easy";
}
