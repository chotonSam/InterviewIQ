"use client";
import Animate from "@/components/motion/Animate";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedbackPanel from "@/components/interview/FeedbackPanel";

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function InterviewSession({ interview }) {
  const { questions } = interview;
  const total = questions.length;

  // results[questionId] = { text, feedback } for every answered question (restored from DB on reload)
  const [results, setResults] = useState(() =>
    Object.fromEntries(questions.filter((q) => q.feedback).map((q) => [q.id, { text: q.answer, feedback: q.feedback }]))
  );
  const [index, setIndex] = useState(() => {
    const i = questions.findIndex((q) => !q.feedback);
    return i === -1 ? 0 : i;
  });
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("type"); // "speak" is UI only for now
  const [seconds, setSeconds] = useState(0);

  const question = questions[index];
  const result = results[question.id];
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function submitAnswer() {
    setError("");
    setEvaluating(true);
    try {
      const res = await fetch(`/api/interviews/${interview.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, text: answer }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not evaluate your answer.");
      setResults((r) => ({ ...r, [question.id]: { text: answer, feedback: data.feedback } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    setIndex((i) => Math.min(i + 1, total - 1));
    setAnswer("");
    setError("");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-6 px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-signal-red">
              <span className="rec-dot h-2 w-2 rounded-full bg-signal-red" /> LIVE
            </span>
            <span className="shrink-0 text-slate-muted">·</span>
            <p className="truncate text-sm font-medium">
              {interview.category} <span className="font-normal text-slate-muted">· {interview.difficulty}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="font-mono text-sm text-slate-muted">{formatTime(seconds)}</span>
            <Link href="/dashboard" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">
              End session
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 pb-4 lg:px-10" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-1.5 flex-1 rounded-full ${results[q.id] ? "bg-signal-green" : i === index ? "bg-indigo" : "bg-ink-line"}`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-green">
          Question {index + 1} of {total}
        </p>

        <Animate as="section" key={question.id} scroll={false} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-7">
          <p className="mb-3 font-mono text-xs text-slate-muted">INTERVIEWER</p>
          <h1 className="font-display text-3xl leading-snug">&ldquo;{question.text}&rdquo;</h1>
        </Animate>

        <section className="rounded-2xl border border-ink-line bg-ink-soft/40 p-7">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="answer" className="font-mono text-xs text-slate-muted">YOUR ANSWER</label>
            <div className="flex items-center gap-1 rounded-full border border-ink-line bg-ink p-1 text-xs">
              {["type", "speak"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`focus-ring rounded-full px-3 py-1 capitalize transition-colors ${mode === m ? "bg-indigo text-white" : "text-slate-muted hover:text-paper"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="answer"
            rows={6}
            value={result ? result.text : answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={Boolean(result) || evaluating}
            maxLength={4000}
            placeholder={mode === "type" ? "Start typing your answer…" : "Voice answers are coming later — type for now."}
            className="field focus-ring resize-none leading-relaxed disabled:opacity-60"
          />

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>
          )}

          {!result && (
            <div className="mt-4 flex items-center justify-between">
              <p className="font-mono text-xs text-slate-muted">{wordCount} words</p>
              <button
                type="button"
                onClick={submitAnswer}
                disabled={evaluating || wordCount === 0}
                className="btn-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {evaluating ? "Evaluating…" : "Submit answer"}
                {!evaluating && <span aria-hidden="true">→</span>}
              </button>
            </div>
          )}
        </section>

        {result && (
          <FeedbackPanel
            feedback={result.feedback}
            answer={result.text}
            isLast={index === total - 1}
            onNext={nextQuestion}
          />
        )}
      </main>
    </>
  );
}
