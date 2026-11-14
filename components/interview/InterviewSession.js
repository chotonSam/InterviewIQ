"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Animate from "@/components/motion/Animate";
import FeedbackPanel from "@/components/interview/FeedbackPanel";
import SummaryCard from "@/components/interview/SummaryCard";
import { formatDuration } from "@/lib/topics";

const KIND_LABEL = {
  concept: "Concept",
  output: "Predict the output",
  bug: "Spot the bug",
  change: "What if you change it?",
  scenario: "Scenario",
  quick: "Quick question",
};

const NO_ANSWER = "(no answer — time ran out)";

export default function InterviewSession({ interview }) {
  const { questions, timed, limit } = interview;
  const total = questions.length;

  // results[questionId] = { text, feedback, time, timedOut } for every answered question (restored from the database on reload)
  const [results, setResults] = useState(() =>
    Object.fromEntries(
      questions.filter((q) => q.feedback).map((q) => [q.id, { text: q.answer, feedback: q.feedback, time: q.answerTime, timedOut: q.timedOut }])
    )
  );
  // spent[questionId] = seconds actively spent (the timer picks up from what was saved)
  const [spent, setSpent] = useState(() => Object.fromEntries(questions.map((q) => [q.id, q.feedback ? q.answerTime : q.timeSpent])));
  const [index, setIndex] = useState(() => {
    const i = questions.findIndex((q) => !q.feedback);
    return i === -1 ? 0 : i;
  });
  const [showSummary, setShowSummary] = useState(interview.completed);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  const question = questions[index];
  const result = results[question.id];
  const spentNow = spent[question.id] ?? 0;
  const remaining = timed ? Math.max(0, limit - spentNow) : null;
  const timeUp = timed && !result && remaining === 0;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const allDone = Object.keys(results).length === total;

  const running = !result && !evaluating; // is this question open for answering?
  const ticking = running && !timeUp;      // is the clock moving?

  // latest values for callbacks that must not go stale
  const answerRef = useRef("");
  answerRef.current = answer;
  const spentRef = useRef(spent);
  spentRef.current = spent;
  const stateRef = useRef({});
  stateRef.current = { id: question.id, running };
  const savedRef = useRef(Object.fromEntries(questions.map((q) => [q.id, q.timeSpent])));

  // ---- the clock: counts only while this tab is visible, so leaving the page pauses it ----
  useEffect(() => {
    if (!ticking) return;
    const id = question.id;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") setSpent((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
    }, 1000);
    return () => clearInterval(t);
  }, [ticking, question.id]);

  // ---- save the time so a refresh or a return visit continues from the same point ----
  const save = useCallback(
    (beacon = false) => {
      const { id, running: open } = stateRef.current;
      if (!open) return;
      const seconds = spentRef.current[id] ?? 0;
      if (seconds <= (savedRef.current[id] ?? 0)) return; // nothing new
      savedRef.current[id] = seconds;
      const url = `/api/interviews/${interview.id}/progress`;
      const payload = JSON.stringify({ questionId: id, seconds });
      if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
      }
    },
    [interview.id]
  );

  useEffect(() => {
    const every10s = setInterval(() => save(false), 10000);
    const onHidden = () => document.visibilityState === "hidden" && save(true);
    const onPageHide = () => save(true);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(every10s);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
      save(true); // leaving this page (e.g. "Save & exit")
    };
  }, [save]);

  async function submitAnswer(auto = false) {
    const qid = question.id;
    const text = answerRef.current;
    const seconds = spentRef.current[qid] ?? 0;
    const outOfTime = timed && (auto === true || seconds >= limit);

    setError("");
    setEvaluating(true);
    try {
      const res = await fetch(`/api/interviews/${interview.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qid, text, timeSpent: seconds, timedOut: outOfTime }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not evaluate your answer.");
      const time = data.timeSpent ?? seconds;
      setResults((r) => ({ ...r, [qid]: { text: text.trim() || NO_ANSWER, feedback: data.feedback, time, timedOut: Boolean(data.timedOut) } }));
      setSpent((s) => ({ ...s, [qid]: time }));
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  }

  // ---- time's up: send whatever is typed (an empty answer scores very low) — tried once per question ----
  const autoTried = useRef({});
  useEffect(() => {
    if (timed && timeUp && !evaluating && !autoTried.current[question.id]) {
      autoTried.current[question.id] = true;
      submitAnswer(true);
    }
  }); // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(i) {
    save(false); // keep the time of the question we are leaving
    setShowSummary(false);
    setIndex(Math.max(0, Math.min(i, total - 1)));
    setAnswer("");
    setError("");
  }

  function onKeyDown(e) {
    // Enter = new line (answers can be long). Ctrl/Cmd + Enter submits.
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !evaluating && wordCount > 0 && !result) {
      e.preventDefault();
      submitAnswer();
    }
  }

  // ---- what the clock shows ----
  const low = timed && !result && remaining <= 30;
  const critical = timed && !result && remaining <= 10;
  const clockText = result ? `Took ${formatDuration(result.time ?? spentNow)}` : timed ? formatDuration(remaining) : formatDuration(spentNow);
  const announce = !timed || result ? "" : remaining === 30 ? "30 seconds left" : remaining === 10 ? "10 seconds left" : remaining === 0 ? "Time is up" : "";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-signal-red">
              <span className="rec-dot h-2 w-2 rounded-full bg-signal-red" /> LIVE
            </span>
            <span className="shrink-0 text-slate-muted">·</span>
            <p className="truncate text-sm font-medium">
              {interview.topic} <span className="font-normal text-slate-muted">· {interview.difficulty}</span>
              {timed && <span className="ml-2 rounded-full border border-signal-amber/40 px-2 py-0.5 font-mono text-[11px] text-signal-amber">Timed</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <span
              role="timer"
              aria-label={timed && !result ? "Time left for this question" : "Time on this question"}
              className={`rounded-full border px-3 py-1 font-mono text-sm tabular-nums ${
                critical ? "rec-dot border-signal-red/60 text-signal-red" : low ? "border-signal-amber/60 text-signal-amber" : "border-ink-line text-slate-muted"
              }`}
            >
              <span aria-hidden="true">⏱ </span>{clockText}
            </span>
            {allDone && (
              <button type="button" onClick={() => setShowSummary(true)} className="focus-ring rounded text-sm font-medium text-indigo transition-colors hover:text-paper">
                Results
              </button>
            )}
            <Link href="/dashboard" onClick={() => save(true)} className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">
              {allDone ? "Dashboard" : "Save & exit"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 pb-3 sm:gap-1.5 sm:px-6 lg:px-10" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-label={`Go to question ${i + 1}`}
              onClick={() => goTo(i)}
              className={`focus-ring h-1.5 flex-1 rounded-full ${results[q.id] ? "bg-signal-green" : i === index ? "bg-indigo" : "bg-ink-line"}`}
            />
          ))}
        </div>

        {timed && !result && !(showSummary && allDone) && (
          <div className="h-0.5 w-full bg-ink-line" aria-hidden="true">
            <div
              className={`h-full transition-[width] duration-1000 ease-linear ${critical ? "bg-signal-red" : low ? "bg-signal-amber" : "bg-signal-green"}`}
              style={{ width: `${(remaining / limit) * 100}%` }}
            />
          </div>
        )}
      </header>

      <p className="sr-only" role="alert" aria-live="assertive">{announce}</p>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-10 lg:px-10">
        {showSummary && allDone ? (
          <SummaryCard interview={interview} results={results} onReview={() => goTo(0)} />
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-green">
              Question {index + 1} of {total} · {KIND_LABEL[question.kind] ?? KIND_LABEL.quick}
            </p>

            <Animate as="section" key={question.id} scroll={false} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-7">
              <h1 className="font-display text-2xl leading-snug sm:text-3xl">{question.text}</h1>
              {question.code && (
                <pre className="mt-5 overflow-x-auto rounded-xl border border-ink-line bg-ink p-4 font-mono text-sm leading-relaxed text-paper/90">{question.code}</pre>
              )}
            </Animate>

            <section className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
              <label htmlFor="answer" className="mb-3 block font-mono text-xs text-slate-muted">
                YOUR ANSWER · {timed ? `${formatDuration(limit)} PER QUESTION · PAUSES WHEN YOU LEAVE THE PAGE` : "AS SHORT OR AS DETAILED AS YOU LIKE"}
              </label>
              <textarea
                id="answer"
                rows={Math.min(10, Math.max(4, (result ? result.text : answer).split("\n").length + 1))}
                value={result ? result.text : answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={Boolean(result) || evaluating}
                maxLength={2000}
                placeholder="Type your answer…"
                autoFocus
                className="field focus-ring resize-none leading-relaxed disabled:opacity-60"
              />

              {timeUp && !result && (
                <p role="status" className="mt-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
                  {evaluating ? "Time’s up — submitting what you wrote…" : "Time’s up. Submit your answer to see the feedback."}
                </p>
              )}
              {error && <p role="alert" className="mt-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>}

              {!result && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-muted">Ctrl + Enter to submit</p>
                  <button type="button" onClick={() => submitAnswer()} disabled={evaluating || (wordCount === 0 && !timeUp)}
                    className="btn-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    {evaluating ? "Checking…" : "Submit"}
                    {!evaluating && <span aria-hidden="true">→</span>}
                  </button>
                </div>
              )}
            </section>

            {result && (
              <FeedbackPanel
                feedback={result.feedback}
                answer={result.text}
                time={result.time}
                timedOut={result.timedOut}
                limit={timed ? limit : 0}
                isLast={index === total - 1}
                onNext={() => goTo(index + 1)}
                onFinish={() => setShowSummary(true)}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
