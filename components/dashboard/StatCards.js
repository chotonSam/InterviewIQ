import { stats, toneText } from "@/lib/data";

export default function StatCards() {
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
          <p className="mb-3 font-mono text-xs text-slate-muted">{s.label}</p>
          <p className={`font-display ${s.small ? "mt-2.5 text-2xl" : "text-4xl"} ${s.tone ? toneText[s.tone] : ""}`}>
            {s.value}
            {s.suffix && <span className="font-body text-lg text-slate-muted">{s.suffix}</span>}
          </p>
        </div>
      ))}
    </section>
  );
}
