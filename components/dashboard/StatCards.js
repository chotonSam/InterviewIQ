import { toneText } from "@/lib/data";
import { toneFor } from "@/lib/dashboard";

export default function StatCards({ stats }) {
  const cards = [
    { label: "Total interviews", value: String(stats.total) },
    {
      label: "Average score",
      value: stats.avg ?? "—",
      suffix: stats.avg !== null ? "/100" : "",
      tone: stats.avg !== null ? toneFor(stats.avg) : null,
    },
    { label: "Practice streak", value: String(stats.streak), suffix: stats.streak === 1 ? " day" : " days" },
    { label: "Strongest category", value: stats.strongest ?? "—", small: true },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((s) => (
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
