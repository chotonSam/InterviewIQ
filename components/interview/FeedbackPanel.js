import Annot from "@/components/Annot";
import Link from "next/link";

export default function FeedbackPanel({ feedback, answer, isLast, onNext }) {
  return (
    <section className="rounded-2xl border border-indigo/50 bg-ink-soft/60 p-7" aria-live="polite">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo">AI feedback</p>
        <span className="font-display text-3xl">
          {feedback.score}
          <span className="font-body text-base text-slate-muted">/100</span>
        </span>
      </div>

      <p className="mb-6 leading-relaxed text-paper/90">
        {/* Demo: static annotations. Later, the AI response will provide annotated spans. */}
        {answer.length > 0 ? answer : <Annot tone="amber">No answer provided</Annot>}
      </p>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-xs text-signal-green">STRENGTHS</p>
          <ul className="space-y-2 text-sm text-slate-muted">
            {feedback.strengths.map((s) => (
              <li key={s} className="flex gap-2"><span className="text-signal-green">✓</span> {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-mono text-xs text-signal-amber">IMPROVE</p>
          <ul className="space-y-2 text-sm text-slate-muted">
            {feedback.improvements.map((s) => (
              <li key={s} className="flex gap-2"><span className="text-signal-amber">△</span> {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-line pt-5">
        <p className="mb-2 font-mono text-xs text-slate-muted">SUGGESTED ANSWER</p>
        <p className="text-sm leading-relaxed text-slate-muted">&ldquo;{feedback.suggested}&rdquo;</p>
      </div>

      <div className="mt-6 flex justify-end">
        {isLast ? (
          <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium transition-colors hover:text-indigo">
            Finish &amp; view dashboard <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button type="button" onClick={onNext} className="focus-ring inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium transition-colors hover:text-indigo">
            Next question <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
