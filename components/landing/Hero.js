import Link from "next/link";
import Animate from "@/components/motion/Animate";
import Annot from "@/components/Annot";

export default function Hero({ user, stats }) {
  const numbers = stats && [
    { label: "Interviews completed", value: stats.completed.toLocaleString() },
    { label: "Answers scored", value: stats.answers.toLocaleString() },
    { label: "Average score", value: stats.avg !== null ? `${stats.avg}/100` : "—", tone: "text-signal-green" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-10">
        {/* Left */}
        <Animate variant="stagger" scroll={false} stagger={0.12}>
          <p data-reveal-item className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">AI mock interviews</p>
          <h1 data-reveal-item className="mb-6 font-display text-5xl leading-[1.05] sm:text-6xl">
            Walk into the real one
            <br />
            having already had it.
          </h1>
          <p data-reveal-item className="mb-9 max-w-md text-lg leading-relaxed text-slate-muted">
            Quick, real-interview questions — predict the output, spot the bug, handle a scenario — scored by AI in seconds.
            Pass a level to unlock the next one.
          </p>
          <div data-reveal-item className="flex flex-wrap items-center gap-4">
            <Link href={user ? "/interview" : "/auth"} className="btn-primary px-6 py-3.5">
              {user ? "Continue practicing" : "Start a mock interview"} <span aria-hidden="true">→</span>
            </Link>
            <a href="#how-it-works" className="focus-ring rounded px-2 py-3.5 font-medium text-paper/90 hover:text-paper">See how it works</a>
          </div>

          {numbers && (
            <dl data-reveal-item className="mt-14 flex flex-wrap gap-x-10 gap-y-4 font-mono text-sm">
              {numbers.map((s) => (
                <div key={s.label}>
                  <dt className="text-slate-muted">{s.label}</dt>
                  <dd className={`mt-1 text-2xl ${s.tone ?? "text-paper"}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Animate>

        {/* Right: annotated transcript (the product, in one picture) */}
        <Animate variant="left" scroll={false} delay={0.35} className="relative">
          <div className="absolute -inset-6 rounded-full bg-indigo/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-ink-line bg-ink-soft shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-ink-line px-5 py-4">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-muted">
                <span className="h-2 w-2 rounded-full bg-signal-green" />
                JavaScript · Easy
              </div>
              <span className="font-mono text-xs text-slate-muted">Question 2 of 10</span>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.15em] text-indigo">Predict the output</p>
                <p className="font-display text-2xl leading-snug">What does this print?</p>
                <pre className="mt-3 rounded-xl border border-ink-line bg-ink p-3 font-mono text-sm text-paper/90">console.log(0.1 + 0.2 === 0.3)</pre>
              </div>

              <div className="border-t border-ink-line pt-5">
                <p className="mb-2 font-mono text-xs text-slate-muted">YOUR ANSWER</p>
                <p className="leading-relaxed text-paper/90">
                  It prints <Annot tone="green">false</Annot> — <Annot tone="green">floating point numbers can&apos;t store 0.1 and 0.2 exactly</Annot>,
                  so the sum is <Annot tone="amber">slightly off</Annot>.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 rounded bg-signal-green/15 px-1.5 py-0.5 font-mono text-signal-green">✓ correct</span>
                    <span className="text-slate-muted">Right output and the right reason.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 rounded bg-signal-amber/15 px-1.5 py-0.5 font-mono text-signal-amber">△ add detail</span>
                    <span className="text-slate-muted">Mention comparing with a small tolerance instead.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink-line pt-4">
                <span className="font-mono text-xs text-slate-muted">AI score</span>
                <span className="font-display text-3xl text-signal-green">92<span className="font-body text-base text-slate-muted">/100</span></span>
              </div>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  );
}
