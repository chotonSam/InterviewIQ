import Link from "next/link";
import { toneBg, toneText } from "@/lib/data";

export default function RecentInterviews({ items }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40">
      <div className="flex items-center justify-between border-b border-ink-line px-6 py-5">
        <h2 className="font-medium">Recent interviews</h2>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="mb-4 text-sm text-slate-muted">You haven&apos;t done a mock interview yet.</p>
          <Link href="/interview" className="btn-primary px-5 py-2.5 text-sm">Start your first interview</Link>
        </div>
      ) : (
        <div className="divide-y divide-ink-line">
          {items.map((i) => (
            <Link key={i.id} href={`/interview/${i.id}`} className="focus-ring flex items-center justify-between px-6 py-4 transition-colors hover:bg-ink-line/20">
              <div className="flex min-w-0 items-center gap-4">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneBg[i.tone]}`} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{i.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-muted">{i.when}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-6">
                {i.status === "completed" ? (
                  <span className={`font-mono text-sm ${toneText[i.tone]}`}>{i.score}/100</span>
                ) : (
                  <span className="font-mono text-xs text-signal-amber">In progress</span>
                )}
                <span className="text-slate-muted" aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
