import { toneBg } from "@/lib/data";

export default function CategoryBreakdown({ items }) {
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
      <h2 className="mb-6 font-medium">By category</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-muted">Your category scores will appear after your first completed interview.</p>
      ) : (
        <ul className="space-y-5">
          {items.map((c) => (
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
      )}
    </div>
  );
}
