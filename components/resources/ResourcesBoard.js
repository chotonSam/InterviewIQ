"use client";

import { useCallback, useEffect, useState } from "react";
import { timeAgo } from "@/lib/time";
import { RESOURCE_TAGS } from "@/lib/resources";

async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
}
const postJSON = (url, body) =>
  api(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function StarRating({ value, onRate }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div role="radiogroup" aria-label="Rate this resource" className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onRate(n)}
          className={`focus-ring rounded text-xl leading-none transition-colors ${n <= shown ? "text-signal-amber" : "text-ink-line hover:text-signal-amber/60"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function VideoPlayer({ id, title }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}
      className="focus-ring group relative block aspect-video w-full overflow-hidden bg-ink-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo text-xl text-white shadow-lg">▶</span>
      </span>
    </button>
  );
}

function ResourceCard({ r, onRate, onDelete }) {
  let host = "";
  try { host = new URL(r.url).hostname.replace(/^www\./, ""); } catch {}

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40">
      {r.type === "video" ? (
        <VideoPlayer id={r.youtubeId} title={r.title} />
      ) : (
        <a href={r.url} target="_blank" rel="noopener noreferrer nofollow"
          className="focus-ring flex aspect-video w-full flex-col items-center justify-center gap-2 bg-ink-line/60 text-slate-muted transition-colors hover:text-paper">
          <span className="text-3xl" aria-hidden="true">📄</span>
          <span className="font-mono text-xs">{host}</span>
        </a>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-signal-amber">{r.tag}</span>
          <span className="font-mono text-xs text-slate-muted">{r.type === "video" ? "Video" : "Article"}</span>
        </div>

        <h2 className="font-medium leading-snug">
          {r.type === "article" ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="focus-ring rounded hover:text-indigo">{r.title} ↗</a>
          ) : r.title}
        </h2>
        {r.description && <p className="mt-2 text-sm leading-relaxed text-slate-muted">{r.description}</p>}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between">
            <StarRating value={r.myRating} onRate={(n) => onRate(r.id, n)} />
            <p className="font-mono text-xs text-slate-muted">
              {r.avg !== null ? <><span className="text-paper">{r.avg.toFixed(1)}</span> · {r.ratingCount} {r.ratingCount === 1 ? "rating" : "ratings"}</> : "No ratings yet"}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-muted">
            <span>{r.mine ? "Added by you" : `Added by ${r.author}`} · {timeAgo(r.createdAt)}</span>
            {r.mine && (
              <button type="button" onClick={() => onDelete(r.id)} className="focus-ring rounded text-signal-red/80 transition-colors hover:text-signal-red">Delete</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ResourcesBoard() {
  const [items, setItems] = useState(null); // null = loading
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("all");
  const [loadError, setLoadError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", tag: "General", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async (p, t) => {
    try {
      setLoadError("");
      const data = await api(`/api/resources?page=${p}${t !== "all" ? `&type=${t}` : ""}`);
      setItems(data.resources);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      setLoadError(err.message);
      setItems((cur) => cur ?? []);
    }
  }, []);

  useEffect(() => {
    load(1, type);
  }, [load, type]);

  async function addResource(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await postJSON("/api/resources", form);
      setForm({ title: "", url: "", tag: "General", description: "" });
      setShowForm(false);
      if (type !== "all") setType("all");
      else await load(1, "all");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function rate(id, value) {
    // Optimistic: show the new rating immediately, then use the server's average
    setItems((all) => all.map((r) => {
      if (r.id !== id) return r;
      const count = r.myRating ? r.ratingCount : r.ratingCount + 1;
      const sum = (r.avg ?? 0) * r.ratingCount - r.myRating + value;
      return { ...r, myRating: value, ratingCount: count, avg: Math.round((sum / count) * 10) / 10 };
    }));
    try {
      const d = await postJSON(`/api/resources/${id}/rate`, { value });
      setItems((all) => all.map((r) => (r.id === id ? { ...r, myRating: d.myRating, ratingCount: d.ratingCount, avg: d.avg } : r)));
    } catch {
      load(page, type);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this resource? This can't be undone.")) return;
    try {
      await api(`/api/resources/${id}`, { method: "DELETE" });
      await load(items.length === 1 && page > 1 ? page - 1 : page, type);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const tabs = [["all", "All"], ["video", "Videos"], ["article", "Articles"]];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Filter resources" className="flex items-center gap-1 rounded-full border border-ink-line bg-ink-soft/40 p-1 text-sm">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={type === id} onClick={() => setType(id)}
              className={`focus-ring rounded-full px-4 py-1.5 transition-colors ${type === id ? "bg-indigo text-white" : "text-slate-muted hover:text-paper"}`}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm} className="btn-primary px-5 py-2.5 text-sm">
          {showForm ? "Cancel" : "+ Add a resource"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addResource} className="space-y-4 rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
          <p className="text-sm text-slate-muted">Paste a YouTube link to embed a video, or any other link to share an article.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="r-title" className="mb-2 block text-sm font-medium">Title</label>
              <input id="r-title" value={form.title} onChange={set("title")} maxLength={120} placeholder="e.g. STAR method explained" className="field focus-ring" required />
            </div>
            <div>
              <label htmlFor="r-tag" className="mb-2 block text-sm font-medium">Topic</label>
              <select id="r-tag" value={form.tag} onChange={set("tag")} className="field focus-ring">
                {RESOURCE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="r-url" className="mb-2 block text-sm font-medium">Link</label>
            <input id="r-url" type="url" value={form.url} onChange={set("url")} placeholder="https://www.youtube.com/watch?v=…" className="field focus-ring" required />
          </div>
          <div>
            <label htmlFor="r-desc" className="mb-2 block text-sm font-medium">Why is it useful? <span className="font-normal text-slate-muted">(optional)</span></label>
            <input id="r-desc" value={form.description} onChange={set("description")} maxLength={300} className="field focus-ring" />
          </div>
          {formError && <p role="alert" className="text-sm text-signal-red">{formError}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">{saving ? "Adding…" : "Add resource"}</button>
          </div>
        </form>
      )}

      {loadError && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{loadError}</p>}
      {items === null && <p className="text-center text-sm text-slate-muted">Loading resources…</p>}
      {items?.length === 0 && !loadError && (
        <p className="rounded-2xl border border-ink-line bg-ink-soft/40 px-6 py-10 text-center text-sm text-slate-muted">
          Nothing here yet. Add the first {type === "video" ? "video" : type === "article" ? "article" : "resource"}.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((r) => <ResourceCard key={r.id} r={r} onRate={rate} onDelete={remove} />)}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between font-mono text-sm">
          <button type="button" onClick={() => load(page - 1, type)} disabled={page === 1} className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">← Previous</button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => load(n, type)} aria-current={n === page ? "page" : undefined}
                className={`focus-ring h-9 w-9 rounded-lg transition-colors ${n === page ? "bg-indigo text-white" : "text-slate-muted hover:bg-ink-line/40 hover:text-paper"}`}>{n}</button>
            ))}
          </div>
          <button type="button" onClick={() => load(page + 1, type)} disabled={page === totalPages} className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">Next →</button>
        </nav>
      )}
    </main>
  );
}
