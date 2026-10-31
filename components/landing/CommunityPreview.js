import Link from "next/link";
import Animate from "@/components/motion/Animate";
import { avatarUrl } from "@/lib/avatar";
import { timeAgo } from "@/lib/time";

export default function CommunityPreview({ posts, user }) {
  const community = user ? "/community" : "/auth";

  return (
    <section id="community" className="border-t border-ink-line">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">From the community</p>
            <h2 className="max-w-lg font-display text-4xl">Other candidates, sharing what worked.</h2>
          </div>
          <Link href={community} className="focus-ring hidden rounded text-sm text-slate-muted transition-colors hover:text-paper sm:inline-block">
            {posts.length ? "Browse all posts →" : "Open the community →"}
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-line px-6 py-14 text-center">
            <p className="mb-4 text-slate-muted">No posts yet — be the first to share an interview experience.</p>
            <Link href={community} className="btn-primary px-6 py-3 text-sm">{user ? "Write a post" : "Join to post"}</Link>
          </div>
        ) : (
          <Animate variant="stagger" className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <article key={p.id} data-reveal-item className="flex flex-col rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
                <div className="mb-4 flex items-center gap-3">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl(p.image, 64)} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo/30 text-xs font-medium">{p.author.slice(0, 1).toUpperCase()}</div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{p.author}</p>
                    <p className="font-mono text-xs text-slate-muted">{timeAgo(p.createdAt)} · {p.tag}</p>
                  </div>
                </div>
                <h3 className="mb-2 font-medium">{p.title}</h3>
                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-muted">{p.body}</p>
                <div className="mt-auto flex items-center gap-4 font-mono text-xs text-slate-muted">
                  <span>♥ {p.likes}</span>
                  <span>💬 {p.comments}</span>
                </div>
              </article>
            ))}
          </Animate>
        )}
      </div>
    </section>
  );
}
