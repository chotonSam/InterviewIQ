import Animate from "@/components/motion/Animate";
import CountUp from "@/components/motion/CountUp";
import { formatDuration } from "@/lib/topics";

export default function FeedbackPanel({ feedback, answer, time = 0, timedOut = false, limit = 0, isLast, onNext, onFinish }) {
  const tone = feedback.score >= 70 ? "text-signal-green" : feedback.score >= 40 ? "text-signal-amber" : "text-signal-red";

  return (
    <Animate as="section" scroll={false} className="rounded-2xl border border-indigo/50 bg-ink-soft/60 p-7" aria-live="polite">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo">AI feedback</p>
        <span className={`font-display text-3xl ${tone}`}>
          <CountUp value={feedback.score} />
          <span className="font-body text-base text-slate-muted">/100</span>
        </span>
      </div>

      {(timedOut || time > 0) && (
        <p className={`mb-4 font-mono text-xs ${timedOut ? "text-signal-red" : "text-slate-muted"}`}>
          {timedOut ? "⏱ Time ran out" : `⏱ Answered in ${formatDuration(time)}${limit ? ` of ${formatDuration(limit)}` : ""}`}
        </p>
      )}

      {(feedback.strengths.length > 0 || feedback.improvements.length > 0) && (
        <ul className="mb-5 space-y-2 text-sm">
          {feedback.strengths.map((s) => (
            <li key={s} className="flex gap-2 text-slate-muted"><span className="text-signal-green">✓</span> {s}</li>
          ))}
          {feedback.improvements.map((s) => (
            <li key={s} className="flex gap-2 text-slate-muted"><span className="text-signal-amber">△</span> {s}</li>
          ))}
        </ul>
      )}

      <div className="border-t border-ink-line pt-4">
        <p className="mb-1.5 font-mono text-xs text-slate-muted">IDEAL ANSWER</p>
        <p className="text-sm leading-relaxed text-paper/90">{feedback.suggested}</p>
      </div>

      <div className="mt-6 flex justify-end">
        {isLast ? (
          <button type="button" onClick={onFinish} className="btn-primary px-6 py-2.5 text-sm">See my results <span aria-hidden="true">→</span></button>
        ) : (
          <button type="button" onClick={onNext} className="btn-primary px-6 py-2.5 text-sm">Next question <span aria-hidden="true">→</span></button>
        )}
      </div>
    </Animate>
  );
}
