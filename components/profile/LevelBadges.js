import { LEVELS } from "@/lib/topics";

// Fields this person has cleared levels in (a small "achievements" strip)
export default function LevelBadges({ levels, name }) {
  if (levels.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 font-medium">Levels cleared</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {levels.map((f) => (
          <div key={f.key} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-4">
            <p className="mb-2.5 truncate font-medium" title={`${name} — ${f.label}`}>{f.label}</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <span key={l} className={`rounded-full px-2.5 py-1 font-mono text-xs ${
                  f.completed.includes(l) ? "bg-signal-green/15 text-signal-green" : "border border-ink-line text-slate-muted"}`}>
                  {f.completed.includes(l) ? "✓ " : ""}{l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
