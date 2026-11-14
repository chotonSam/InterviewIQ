"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/time";
import { RESOURCE_TAGS } from "@/lib/resources";
import { uploadImage } from "@/lib/upload";
import Thumb from "@/components/resources/Thumb";
import TopicPicker from "@/components/TopicPicker";
import TopicChips from "@/components/TopicChips";
import { SearchIcon } from "@/components/Icons";

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

function VideoPlayer({ resource }) {
  const { youtubeId: id, title } = resource;
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
      <Thumb resource={resource} className="h-full w-full opacity-90 transition-opacity group-hover:opacity-100" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo text-xl text-white shadow-lg">▶</span>
      </span>
    </button>
  );
}

// Marks the words you searched for
function Highlight({ text, q }) {
  if (!q) return text;
  const rx = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.split(rx).map((part, i) => (i % 2 === 1 ? <mark key={i} className="rounded bg-indigo/30 px-0.5 text-paper">{part}</mark> : part));
}

function ResourceCard({ r, q, onRate, onDelete }) {
  let host = "";
  try { host = new URL(r.url).hostname.replace(/^www\./, ""); } catch {}

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40">
      {r.type === "video" ? (
        <VideoPlayer resource={r} />
      ) : (
        <a href={r.url} target="_blank" rel="noopener noreferrer nofollow"
          className="focus-ring block aspect-video w-full overflow-hidden bg-ink-line/60" aria-label={`Open ${r.title} on ${host}`}>
          <Thumb resource={r} className="h-full w-full" />
        </a>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-signal-amber">{r.tag}</span>
          <span className="font-mono text-xs text-slate-muted">{r.type === "video" ? "Video" : "Article"}</span>
        </div>

        <h2 className="font-medium leading-snug">
          {r.type === "article" ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="focus-ring rounded hover:text-indigo"><Highlight text={r.title} q={q} /> ↗</a>
          ) : <Highlight text={r.title} q={q} />}
        </h2>
        {r.description && <p className="mt-2 text-sm leading-relaxed text-slate-muted"><Highlight text={r.description} q={q} /></p>}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between">
            <StarRating value={r.myRating} onRate={(n) => onRate(r.id, n)} />
            <p className="font-mono text-xs text-slate-muted">
              {r.avg !== null ? <><span className="text-paper">{r.avg.toFixed(1)}</span> · {r.ratingCount} {r.ratingCount === 1 ? "rating" : "ratings"}</> : "No ratings yet"}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-muted">
            <span>{r.mine ? "Added by you" : (<>Added by <Link href={`/u/${r.authorUsername}`} className="focus-ring rounded text-paper/80 hover:text-indigo">{r.author}</Link></>)} · {timeAgo(r.createdAt)}</span>
            {r.mine && (
              <button type="button" onClick={() => onDelete(r.id)} className="focus-ring rounded text-signal-red/80 transition-colors hover:text-signal-red">Delete</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const SORTS = [["new", "Newest"], ["top", "Top rated"], ["popular", "Most rated"]];
const TYPES = [["all", "All"], ["video", "Videos"], ["article", "Articles"]];

export default function ResourcesBoard() {
  const [items, setItems] = useState(null); // null = first load
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tagCounts, setTagCounts] = useState({});
  const [loadError, setLoadError] = useState("");

  // ---- filters ----
  const [q, setQ] = useState("");            // what is typed
  const [search, setSearch] = useState("");  // what is searched (after a short pause)
  const [tag, setTag] = useState("");        // "" = all topics
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("new");
  const [mine, setMine] = useState(false);

  const hasFilters = Boolean(search || tag || type !== "all" || sort !== "new" || mine);

  // ---- add form ----
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", tag: "General", description: "", thumbnail: "" });
  const [thumbBusy, setThumbBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Wait until the person stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const filtersRef = useRef({});
  filtersRef.current = { search, tag, type, sort, mine };
  const latest = useRef(0);

  const load = useCallback(async (p) => {
    const id = ++latest.current; // ignore answers that arrive after a newer request
    const f = filtersRef.current;
    const qs = new URLSearchParams({ page: String(p) });
    if (f.type !== "all") qs.set("type", f.type);
    if (f.tag) qs.set("tag", f.tag);
    if (f.search) qs.set("q", f.search);
    if (f.sort !== "new") qs.set("sort", f.sort);
    if (f.mine) qs.set("mine", "1");

    setBusy(true);
    try {
      setLoadError("");
      const data = await api(`/api/resources?${qs}`);
      if (id !== latest.current) return;
      setItems(data.resources);
      setTotalPages(data.totalPages);
      setPage(data.page);
      setTotal(data.total);
      setTagCounts(data.tagCounts ?? {});
    } catch (err) {
      if (id !== latest.current) return;
      setLoadError(err.message);
      setItems((cur) => cur ?? []);
    } finally {
      if (id === latest.current) setBusy(false);
    }
  }, []);

  // any filter change → back to page 1
  useEffect(() => {
    load(1);
  }, [load, search, tag, type, sort, mine]);

  function clearFilters() {
    setQ(""); setSearch(""); setTag(""); setType("all"); setSort("new"); setMine(false);
  }

  async function addResource(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await postJSON("/api/resources", form);
      setForm({ title: "", url: "", tag: "General", description: "", thumbnail: "" });
      setShowForm(false);
      if (hasFilters) clearFilters(); // so the new resource is visible (the filter change reloads the list)
      else await load(1);
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
      load(page);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this resource? This can't be undone.")) return;
    try {
      await api(`/api/resources/${id}`, { method: "DELETE" });
      await load(items.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onThumbFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFormError("");
    setThumbBusy(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, thumbnail: url }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setThumbBusy(false);
    }
  }


  // topics people typed themselves: the busiest few get a chip, the rest go in a "More topics" menu.
  // The topic you are filtering by always keeps its chip, even when it has no results under the other filters.
  const customTags = Object.keys(tagCounts)
    .filter((t) => !RESOURCE_TAGS.includes(t))
    .sort((a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b));
  const chip = (active) =>
    `focus-ring shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
      active ? "border-indigo bg-indigo text-white" : "border-ink-line text-slate-muted hover:border-indigo/60 hover:text-paper"}`;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-7 sm:px-6 sm:py-10 lg:px-10">
      {/* ---- search + add ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <label htmlFor="res-search" className="sr-only">Search resources</label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input id="res-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60}
            placeholder="Search by title or description…" autoComplete="off"
            className="field focus-ring pl-11 pr-10 [&::-webkit-search-cancel-button]:hidden" />
          {q && (
            <button type="button" onClick={() => { setQ(""); setSearch(""); }} aria-label="Clear search"
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded px-1 text-slate-muted hover:text-paper">✕</button>
          )}
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm} className="btn-primary px-5 py-3 text-sm">
          {showForm ? "Cancel" : "+ Add a resource"}
        </button>
      </div>

      {/* ---- topics ---- */}
      <TopicChips presets={RESOURCE_TAGS} counts={tagCounts} selected={tag} onSelect={setTag} />

      {/* ---- type / sort / mine ---- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div role="tablist" aria-label="Type" className="flex items-center gap-1 rounded-full border border-ink-line bg-ink-soft/40 p-1 text-sm">
          {TYPES.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={type === id} onClick={() => setType(id)}
              className={`focus-ring rounded-full px-4 py-1.5 transition-colors ${type === id ? "bg-indigo text-white" : "text-slate-muted hover:text-paper"}`}>
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-muted">
          <span className="sr-only sm:not-sr-only">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="field focus-ring w-auto py-2 pr-8" aria-label="Sort resources">
            {SORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>

        <button type="button" aria-pressed={mine} onClick={() => setMine((m) => !m)} className={chip(mine)}>Added by me</button>
      </div>

      {/* ---- result summary ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-muted" aria-live="polite">
        <p>
          {items === null ? "Loading…" : `${total} ${total === 1 ? "resource" : "resources"}`}
          {search && <> for &ldquo;<span className="text-paper">{search}</span>&rdquo;</>}
          {tag && <> in <span className="text-paper">{tag}</span></>}
          {busy && items !== null && <span className="ml-2">· updating…</span>}
        </p>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="focus-ring rounded text-indigo transition-colors hover:text-paper">Clear all filters</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={addResource} className="space-y-4 rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
          <p className="text-sm text-slate-muted">Paste a YouTube link to embed a video, or any other link to share an article.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="r-title" className="mb-2 block text-sm font-medium">Title</label>
              <input id="r-title" value={form.title} onChange={set("title")} maxLength={120} placeholder="e.g. STAR method explained" className="field focus-ring" required />
            </div>
            <TopicPicker id="r-tag" value={form.tag} onChange={(v) => setForm((f) => ({ ...f, tag: v }))} presets={RESOURCE_TAGS} suggestions={customTags} />
          </div>
          <div>
            <label htmlFor="r-url" className="mb-2 block text-sm font-medium">Link</label>
            <input id="r-url" type="url" value={form.url} onChange={set("url")} placeholder="https://www.youtube.com/watch?v=…" className="field focus-ring" required />
          </div>
          <div>
            <label htmlFor="r-desc" className="mb-2 block text-sm font-medium">Why is it useful? <span className="font-normal text-slate-muted">(optional)</span></label>
            <input id="r-desc" value={form.description} onChange={set("description")} maxLength={300} className="field focus-ring" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Thumbnail <span className="font-normal text-slate-muted">(optional — otherwise we use the video&apos;s or the page&apos;s own image automatically)</span></p>
            <div className="flex flex-wrap items-center gap-4">
              {form.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.thumbnail} alt="Your chosen thumbnail" className="h-16 w-28 rounded-lg object-cover" />
              )}
              <label className={`focus-within:outline focus-within:outline-2 focus-within:outline-indigo cursor-pointer rounded-full border border-ink-line px-4 py-2 text-sm text-slate-muted transition-colors hover:border-indigo/60 hover:text-paper ${thumbBusy ? "opacity-60" : ""}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onThumbFile} disabled={thumbBusy} className="sr-only" />
                {thumbBusy ? "Uploading…" : form.thumbnail ? "Change image" : "Upload image"}
              </label>
              {form.thumbnail && !thumbBusy && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnail: "" }))} className="focus-ring rounded text-sm text-slate-muted hover:text-signal-red">Remove</button>
              )}
            </div>
          </div>
          {formError && <p role="alert" className="text-sm text-signal-red">{formError}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={saving || thumbBusy || !form.tag.trim()} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">{saving ? "Adding…" : "Add resource"}</button>
          </div>
        </form>
      )}

      {loadError && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{loadError}</p>}

      {items?.length === 0 && !loadError && (
        <div className="rounded-2xl border border-dashed border-ink-line px-6 py-12 text-center">
          {hasFilters ? (
            <>
              <p className="mb-1 font-medium">No resources match your search</p>
              <p className="mb-4 text-sm text-slate-muted">Try a different word, another topic, or remove a filter.</p>
              <button type="button" onClick={clearFilters} className="btn-primary px-5 py-2.5 text-sm">Clear all filters</button>
            </>
          ) : (
            <p className="text-sm text-slate-muted">Nothing here yet. Add the first resource.</p>
          )}
        </div>
      )}

      <div className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${busy ? "opacity-60" : ""}`}>
        {items?.map((r) => <ResourceCard key={r.id} r={r} q={search} onRate={rate} onDelete={remove} />)}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between font-mono text-sm">
          <button type="button" onClick={() => load(page - 1)} disabled={page === 1} className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">← Previous</button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => load(n)} aria-current={n === page ? "page" : undefined}
                className={`focus-ring h-9 w-9 rounded-lg transition-colors ${n === page ? "bg-indigo text-white" : "text-slate-muted hover:bg-ink-line/40 hover:text-paper"}`}>{n}</button>
            ))}
          </div>
          <button type="button" onClick={() => load(page + 1)} disabled={page === totalPages} className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">Next →</button>
        </nav>
      )}
    </main>
  );
}
