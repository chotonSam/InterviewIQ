"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/time";
import Thumb from "@/components/resources/Thumb";

export default function ProfileActivity({ posts, resources }) {
  const router = useRouter();
  const [tab, setTab] = useState("posts");
  const [error, setError] = useState("");

  async function remove(url, what) {
    if (!window.confirm(`Delete this ${what}? This can't be undone.`)) return;
    setError("");
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? "Could not delete.");
    }
    router.refresh();
  }

  const tabs = [["posts", `My posts (${posts.length})`], ["resources", `My resources (${resources.length})`]];

  return (
    <section>
      <div role="tablist" className="mb-6 flex items-center gap-8 border-b border-ink-line">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`focus-ring relative pb-4 font-medium transition-colors ${tab === id ? "text-paper" : "text-slate-muted hover:text-paper"}`}>
            {label}
            <span className={`absolute -bottom-px left-0 right-0 h-0.5 bg-indigo transition-opacity ${tab === id ? "opacity-100" : "opacity-0"}`} />
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-signal-red">{error}</p>}

      {tab === "posts" && (
        posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-line px-6 py-10 text-center text-sm text-slate-muted">
            You haven&apos;t posted anything yet. <Link href="/community" className="text-indigo hover:text-paper">Share an interview experience</Link>.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <article key={p.id} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-5">
                <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs text-slate-muted">
                  <span>{p.tag} · {timeAgo(p.createdAt)}</span>
                  <button type="button" onClick={() => remove(`/api/posts/${p.id}`, "post")} className="focus-ring rounded text-signal-red/80 transition-colors hover:text-signal-red">Delete</button>
                </div>
                <h3 className="font-medium">{p.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-muted">{p.body}</p>
                <p className="mt-3 flex items-center gap-4 font-mono text-xs text-slate-muted">
                  <span>♥ {p.likes}</span><span>💬 {p.comments}</span>
                  <Link href="/community" className="ml-auto text-indigo hover:text-paper">Open community →</Link>
                </p>
              </article>
            ))}
          </div>
        )
      )}

      {tab === "resources" && (
        resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-line px-6 py-10 text-center text-sm text-slate-muted">
            You haven&apos;t added any resources. <Link href="/resources" className="text-indigo hover:text-paper">Add a video or article</Link>.
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((r) => (
              <article key={r.id} className="flex gap-4 rounded-2xl border border-ink-line bg-ink-soft/40 p-4">
                <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-ink-line">
                  <Thumb resource={r} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 font-mono text-xs text-slate-muted">
                    <span className="text-signal-amber">{r.tag} · {r.type === "video" ? "Video" : "Article"}</span>
                    <button type="button" onClick={() => remove(`/api/resources/${r.id}`, "resource")} className="focus-ring rounded text-signal-red/80 transition-colors hover:text-signal-red">Delete</button>
                  </div>
                  <h3 className="mt-1 truncate font-medium">{r.title}</h3>
                  <p className="mt-2 flex items-center gap-4 font-mono text-xs text-slate-muted">
                    <span>{r.avg !== null ? `★ ${r.avg.toFixed(1)} · ${r.ratingCount} ratings` : "Not rated yet"}</span>
                    <span>{timeAgo(r.createdAt)}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="ml-auto text-indigo hover:text-paper">Open ↗</a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}
