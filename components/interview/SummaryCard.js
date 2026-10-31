"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Animate from "@/components/motion/Animate";
import CountUp from "@/components/motion/CountUp";

export default function SummaryCard({ interview, results, onReview }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const scores = interview.questions.map((q) => results[q.id]?.feedback.score ?? 0);
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const strong = scores.filter((s) => s >= 70).length;
  const tone = average >= 70 ? "text-signal-green" : average >= 40 ? "text-signal-amber" : "text-signal-red";
  const next = interview.nextLevel;

  async function startNext() {
    setError("");
    setStarting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...interview.startPayload, difficulty: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start the next level.");
      router.push(`/interview/${data.id}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  return (
    <Animate as="section" scroll={false} className="rounded-2xl border border-indigo/50 bg-ink-soft/60 p-8 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">{interview.difficulty} complete</p>
      <h1 className="mb-6 font-display text-4xl">{interview.topic}</h1>

      <p className={`font-display text-7xl ${tone}`}>
        <CountUp value={average} />
        <span className="font-body text-2xl text-slate-muted">/100</span>
      </p>
      <p className="mt-3 text-sm text-slate-muted">
        {strong} of {scores.length} answers scored 70 or higher.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-xl border border-ink-line bg-ink/60 p-5">
        {next ? (
          <>
            <p className="mb-1 font-medium"><span aria-hidden="true">🔓 </span>{next} is now unlocked</p>
            <p className="mb-4 text-sm text-slate-muted">
              {next === "Medium" ? "Ready for real-world questions on this field?" : "Ready for the tricky edge cases?"}
            </p>
            <button type="button" onClick={startNext} disabled={starting} className="btn-primary px-6 py-3 text-sm disabled:opacity-60">
              {starting ? "Preparing questions…" : `Start ${next}`} {!starting && <span aria-hidden="true">→</span>}
            </button>
          </>
        ) : (
          <>
            <p className="mb-1 font-medium"><span aria-hidden="true">🏆 </span>All three levels done on this field</p>
            <p className="mb-4 text-sm text-slate-muted">Try another field, or practice with the AI coach.</p>
            <Link href="/interview" className="btn-primary px-6 py-3 text-sm">Choose another field</Link>
          </>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-signal-red">{error}</p>}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <button type="button" onClick={onReview} className="focus-ring rounded text-slate-muted transition-colors hover:text-paper">Review my answers</button>
        <Link href="/dashboard" className="focus-ring rounded text-slate-muted transition-colors hover:text-paper">Dashboard</Link>
      </div>
    </Animate>
  );
}
