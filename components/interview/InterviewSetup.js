"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIFFICULTIES = [
  { id: "Easy", hint: "Fundamentals" },
  { id: "Medium", hint: "Real-world scenarios" },
  { id: "Hard", hint: "Depth and trade-offs" },
];

export default function InterviewSetup({ categories }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, difficulty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start the interview.");
      router.push(`/interview/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={start} className="mx-auto max-w-3xl space-y-10 px-6 py-10 lg:px-10">
      <fieldset>
        <legend className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">1 · Choose a category</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className={`cursor-pointer rounded-2xl border p-5 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo ${
                categoryId === c.id ? "border-indigo bg-indigo/10" : "border-ink-line bg-ink-soft/40 hover:border-indigo/50"
              }`}
            >
              <input type="radio" name="category" value={c.id} checked={categoryId === c.id} onChange={() => setCategoryId(c.id)} className="sr-only" />
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-slate-muted">{c.description}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">2 · Choose a difficulty</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((d) => (
            <label
              key={d.id}
              className={`cursor-pointer rounded-2xl border p-5 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo ${
                difficulty === d.id ? "border-indigo bg-indigo/10" : "border-ink-line bg-ink-soft/40 hover:border-indigo/50"
              }`}
            >
              <input type="radio" name="difficulty" value={d.id} checked={difficulty === d.id} onChange={() => setDifficulty(d.id)} className="sr-only" />
              <p className="font-medium">{d.id}</p>
              <p className="mt-1 text-sm text-slate-muted">{d.hint}</p>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-muted">6 questions · AI generated for you</p>
        <button type="submit" disabled={loading || !categoryId} className="btn-primary px-7 py-3.5 disabled:opacity-60">
          {loading ? "Preparing your questions…" : "Start interview"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </form>
  );
}
