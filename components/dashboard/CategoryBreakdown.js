import { categoryScores, toneBg } from "@/lib/data";

export default function CategoryBreakdown() {
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
      <h2 className="mb-6 font-medium">By category</h2>
      <ul className="space-y-5">
        {categoryScores.map((c) => (
          <li key={c.name}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span>{c.name}</span>
              <span className="font-mono text-slate-muted">{c.score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
              <div className={`h-full rounded-full ${toneBg[c.tone]}`} style={{ width: `${c.score}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
