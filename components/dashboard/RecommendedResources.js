import { resources } from "@/lib/data";
import { PlayIcon, BookIcon } from "@/components/Icons";

export default function RecommendedResources() {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-medium">Recommended for your gaps</h2>
        <a href="#" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">See all resources →</a>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {resources.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40 transition-colors hover:border-indigo/60">
            <div className="flex aspect-video items-center justify-center bg-ink-line text-slate-muted">
              {r.kind === "video" ? <PlayIcon /> : <BookIcon width="28" height="28" />}
            </div>
            <div className="p-4">
              <span className="font-mono text-xs text-signal-amber">{r.tag}</span>
              <p className="mt-1.5 text-sm font-medium">{r.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
