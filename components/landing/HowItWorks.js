import Animate from "@/components/motion/Animate";
const steps = [
  { n: "01", title: "Pick a field — or type your own", body: "Frontend, backend, HR… or any field you can name. Everyone starts at Easy." },
  { n: "02", title: "Answer 10 short questions", body: "Predict the output, spot the bug, handle a quick scenario. Short like a real interview, and you can answer as briefly or as fully as you like." },
  { n: "03", title: "Get scored, then level up", body: "An instant AI score and an ideal answer for each question. Finish a level to unlock the next: Easy → Medium → Hard." },
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
