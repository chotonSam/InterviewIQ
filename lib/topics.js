// Shared helpers for interview topics and the Easy → Medium → Hard progression.
export const LEVELS = ["Easy", "Medium", "Hard"];

// Timed mode: seconds allowed per question at each level
export const TIME_LIMITS = { Easy: 90, Medium: 120, Hard: 180 };

// 75 -> "1:15", 9 -> "0:09"
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

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

// ---- custom topics for posts and resources ("Other…") ----
export const MAX_TAG = 30;

export function sanitizeTag(raw) {
  return sanitizeTopic(raw).slice(0, MAX_TAG).trim();
}
export function isValidTag(tag) {
  return tag.length >= 2 && /\p{L}/u.test(tag);
}
// -> { tag: string | null, error?: string }.  tag === null means "nothing typed, use the default".
export function parseTag(raw) {
  const typed = String(raw ?? "").trim();
  if (!typed) return { tag: null };
  const tag = sanitizeTag(typed);
  if (!isValidTag(tag)) return { tag: null, error: "Topic must be 2-30 characters and include a letter (numbers and & + . # / - are fine)." };
  return { tag };
}

// ---- "Did you mean…?" ----
// Edit distance that counts a swapped pair of letters ("Fornt" vs "Front") as one mistake
function distance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

// The existing topic that a typed topic is probably a typo of, or null.
// Short words may be off by 1 letter, longer ones by 2. An exact match (ignoring capitals) is not a typo —
// the server already merges those into one spelling.
export function closestTopic(typed, candidates) {
  const t = String(typed ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  if (t.length < 3) return null;
  const limit = t.length <= 5 ? 1 : 2;
  let best = null;
  for (const c of candidates) {
    const lc = c.toLowerCase();
    if (lc === t) return null;
    const d = distance(t, lc);
    if (d <= limit && d < t.length / 2 && (!best || d < best.d)) best = { c, d };
  }
  return best ? best.c : null;
}
