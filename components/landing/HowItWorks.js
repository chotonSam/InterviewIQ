import Animate from "@/components/motion/Animate";
const steps = [
  { n: "01", title: "Choose your setup", body: "Pick a category — frontend, backend, HR, system design — and a difficulty that matches where you're at." },
  { n: "02", title: "Answer real questions", body: "AI generates questions on the spot and runs the session like an actual interviewer, not a static quiz." },
  { n: "03", title: "Get scored feedback", body: "See your score, strengths, weak spots, and a stronger version of your answer — saved to your history." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-ink-line">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">The process</p>
        <h2 className="mb-16 max-w-lg font-display text-4xl">Three steps, every time you practice.</h2>

        <Animate variant="stagger" className="grid gap-px overflow-hidden rounded-2xl bg-ink-line md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} data-reveal-item className="bg-ink p-8">
              <span className="font-mono text-sm text-slate-muted">{s.n}</span>
              <h3 className="mb-3 mt-4 font-display text-2xl">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-muted">{s.body}</p>
            </div>
          ))}
        </Animate>
      </div>
    </section>
  );
}
