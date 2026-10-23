import Link from "next/link";
import Annot from "@/components/Annot";

const heroStats = [
  { label: "Mock interviews run", value: "12,400+" },
  { label: "Avg. score lift", value: "+22%", tone: "text-signal-green" },
  { label: "Question categories", value: "18" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-10">
        {/* Left */}
        <div>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">AI mock interviews</p>
          <h1 className="mb-6 font-display text-5xl leading-[1.05] sm:text-6xl">
            Walk into the real one
            <br />
            having already had it.
          </h1>
          <p className="mb-9 max-w-md text-lg leading-relaxed text-slate-muted">
            Pick a role and difficulty, answer real interview questions out loud or in writing, and get scored
            feedback — strengths, gaps, and a better answer — in seconds.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/interview" className="btn-primary px-6 py-3.5">
              Start a mock interview <span aria-hidden="true">→</span>
            </Link>
            <a href="#how-it-works" className="focus-ring rounded px-2 py-3.5 font-medium text-paper/90 hover:text-paper">
              See how it works
            </a>
          </div>

          <dl className="mt-14 flex gap-10 font-mono text-sm">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="text-slate-muted">{s.label}</dt>
                <dd className={`mt-1 text-2xl ${s.tone ?? "text-paper"}`}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: annotated transcript (signature element) */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-indigo/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-ink-line bg-ink-soft shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-ink-line px-5 py-4">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-muted">
                <span className="h-2 w-2 rounded-full bg-signal-amber" />
                Frontend Development · Medium
              </div>
              <span className="font-mono text-xs text-slate-muted">Q3 of 6</span>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-2 font-mono text-xs text-slate-muted">INTERVIEWER</p>
                <p className="leading-relaxed text-paper/90">
                  &ldquo;Tell me about a time you had to optimize a slow-loading page. What did you do?&rdquo;
                </p>
              </div>

              <div className="border-t border-ink-line pt-5">
                <p className="mb-2 font-mono text-xs text-slate-muted">YOUR ANSWER</p>
                <p className="leading-relaxed text-paper/90">
                  In my last group project the dashboard was <Annot tone="green">taking almost 6 seconds to load</Annot>,
                  so I profiled it and found unused JS bundles. I <Annot tone="amber">split the code and lazy-loaded charts</Annot>,
                  which helped a lot.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 rounded bg-signal-green/15 px-1.5 py-0.5 font-mono text-signal-green">✓ strong</span>
                    <span className="text-slate-muted">Concrete starting metric — good.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 rounded bg-signal-amber/15 px-1.5 py-0.5 font-mono text-signal-amber">△ add detail</span>
                    <span className="text-slate-muted">Quantify the result: what did load time become?</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink-line pt-4">
                <span className="font-mono text-xs text-slate-muted">AI score</span>
                <span className="font-display text-3xl text-paper">
                  78<span className="font-body text-base text-slate-muted">/100</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
