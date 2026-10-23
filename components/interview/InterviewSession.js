"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedbackPanel from "@/components/interview/FeedbackPanel";
import { interviewQuestions, mockFeedback } from "@/lib/data";

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function InterviewSession({ category = "Frontend Development", difficulty = "Medium" }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("answering"); // answering | evaluating | evaluated
  const [mode, setMode] = useState("type"); // type | speak (speak = UI only for now)
  const [seconds, setSeconds] = useState(0);

  const total = interviewQuestions.length;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function submitAnswer() {
    setStatus("evaluating");
    // Backend step: POST /api/interviews/:id/answers -> server calls Gemini -> returns feedback
    setTimeout(() => setStatus("evaluated"), 1200);
  }

  function nextQuestion() {
    setIndex((i) => Math.min(i + 1, total - 1));
    setAnswer("");
    setStatus("answering");
  }

  return (
    <>
      {/* Header: session meta + progress */}
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-6 px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-signal-red">
              <span className="rec-dot h-2 w-2 rounded-full bg-signal-red" /> LIVE
            </span>
            <span className="shrink-0 text-slate-muted">·</span>
            <p className="truncate text-sm font-medium">
              {category} <span className="font-normal text-slate-muted">· {difficulty}</span>
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
          {interviewQuestions.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-signal-green" : i === index ? "bg-indigo" : "bg-ink-line"}`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-green">
          Question {index + 1} of {total}
        </p>

        {/* Question */}
        <section className="rounded-2xl border border-ink-line bg-ink-soft/40 p-7">
          <p className="mb-3 font-mono text-xs text-slate-muted">INTERVIEWER</p>
          <h1 className="font-display text-3xl leading-snug">&ldquo;{interviewQuestions[index]}&rdquo;</h1>
        </section>

        {/* Answer */}
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
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={status !== "answering"}
            placeholder={mode === "type" ? "Start typing your answer…" : "Voice answers are coming later — type for now."}
            className="field focus-ring resize-none leading-relaxed disabled:opacity-60"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-xs text-slate-muted">{wordCount} words</p>
            <button
              type="button"
              onClick={submitAnswer}
              disabled={status !== "answering" || wordCount === 0}
              className="btn-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "evaluating" ? "Evaluating…" : "Submit answer"}
              {status !== "evaluating" && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </section>

        {status === "evaluated" && (
          <FeedbackPanel
            feedback={mockFeedback}
            answer={answer}
            isLast={index === total - 1}
            onNext={nextQuestion}
          />
        )}
      </main>
    </>
  );
}
