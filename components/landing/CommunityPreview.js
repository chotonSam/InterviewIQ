import Animate from "@/components/motion/Animate";
import { communityPosts } from "@/lib/data";

export default function CommunityPreview() {
  return (
    <section id="community" className="border-t border-ink-line">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">From the community</p>
            <h2 className="max-w-lg font-display text-4xl">Other candidates, sharing what worked.</h2>
          </div>
          <a href="#" className="focus-ring hidden rounded text-sm text-slate-muted transition-colors hover:text-paper sm:inline-block">
            Browse all posts →
          </a>
        </div>

        <Animate variant="stagger" className="grid gap-6 md:grid-cols-3">
          {communityPosts.map((p) => (
            <article key={p.id} data-reveal-item className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${p.color}`} />
                <div>
                  <p className="text-sm font-medium">{p.author}</p>
                  <p className="font-mono text-xs text-slate-muted">{p.when}</p>
                </div>
              </div>
              <h3 className="mb-2 font-medium">{p.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-muted">{p.body}</p>
              <div className="flex items-center gap-4 font-mono text-xs text-slate-muted">
                <span>♥ {p.likes}</span>
                <span>💬 {p.comments}</span>
              </div>
            </article>
          ))}
        </Animate>
      </div>
    </section>
  );
}
