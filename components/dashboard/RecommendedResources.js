import Link from "next/link";
import { connectDB } from "@/lib/db";
import LearningResource from "@/lib/models/LearningResource";
import Thumb from "@/components/resources/Thumb";

// Shows the top community-rated resources (real data, real thumbnails)
export default async function RecommendedResources() {
  await connectDB();
  const items = await LearningResource.find().sort({ ratingCount: -1, ratingSum: -1, createdAt: -1 }).limit(3).lean();

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-medium">Top learning resources</h2>
        <Link href="/resources" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">See all resources →</Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-ink-line bg-ink-soft/40 px-6 py-8 text-center text-sm text-slate-muted">
          No resources yet.{" "}
          <Link href="/resources" className="text-indigo hover:text-paper">Add the first video or article</Link>.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          {items.map((r) => {
            const avg = r.ratingCount ? (r.ratingSum / r.ratingCount).toFixed(1) : null;
            const resource = { type: r.type, youtubeId: r.youtubeId, thumbnail: r.thumbnail ?? "", url: r.url };
            return (
              <Link key={String(r._id)} href="/resources" className="focus-ring overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40 transition-colors hover:border-indigo/60">
                <div className="relative aspect-video overflow-hidden bg-ink-line">
                  <Thumb resource={resource} className="h-full w-full" />
                  {r.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo/90 text-sm text-white">▶</span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="font-mono text-xs text-signal-amber">{r.tag}</span>
                  <p className="mt-1.5 text-sm font-medium">{r.title}</p>
                  <p className="mt-2 font-mono text-xs text-slate-muted">{avg ? `★ ${avg} · ${r.ratingCount} ratings` : "Not rated yet"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
