"use client";

import { useCallback, useEffect, useState } from "react";
import { PostCard, api, postJSON } from "@/components/community/PostCard";

const TAGS = ["Experience", "Question", "Frontend", "Backend", "System Design", "HR / Behavioral", "Resources"];

export default function CommunityFeed() {
  const [posts, setPosts] = useState(null); // null = loading
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Experience");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const load = useCallback(async (p) => {
    try {
      setLoadError("");
      const data = await api(`/api/posts?page=${p}`);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      setLoadError(err.message);
      setPosts((cur) => cur ?? []);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  async function createPost(e) {
    e.preventDefault();
    setPostError("");
    setPosting(true);
    try {
      await postJSON("/api/posts", { title, body, tag });
      setTitle("");
      setBody("");
      await load(1);
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(id) {
    // Optimistic update, then replace with the server's numbers
    setPosts((all) => all.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
    try {
      const { liked, likes } = await api(`/api/posts/${id}/like`, { method: "POST" });
      setPosts((all) => all.map((p) => (p.id === id ? { ...p, liked, likes } : p)));
    } catch {
      load(page); // undo by reloading the real state
    }
  }

  async function removePost(id) {
    if (!window.confirm("Delete this post? Its comments and likes will be removed too.")) return;
    try {
      await api(`/api/posts/${id}`, { method: "DELETE" });
      await load(posts.length === 1 && page > 1 ? page - 1 : page); // stay on a page that still exists
    } catch (err) {
      setLoadError(err.message);
    }
  }

  const updateCount = useCallback((id, n) => {
    setPosts((all) => (all ? all.map((p) => (p.id === id && p.comments !== n ? { ...p, comments: n } : p)) : all));
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10 lg:px-10">
      <form onSubmit={createPost} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
        <p className="mb-4 text-sm font-medium">Share with the community</p>
        <label htmlFor="post-title" className="sr-only">Post title</label>
        <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
          placeholder="Title (e.g. What I learned from my HR round)" className="field focus-ring mb-3" />
        <label htmlFor="post-body" className="sr-only">Post body</label>
        <textarea id="post-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000}
          placeholder="Share an experience, ask a question…" className="field focus-ring resize-none" />

        {postError && <p role="alert" className="mt-3 text-sm text-signal-red">{postError}</p>}

        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <label htmlFor="post-tag" className="sr-only">Topic</label>
            <select id="post-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="field focus-ring w-auto py-2">
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" disabled={!title.trim() || !body.trim() || posting}
            className="btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {posting ? "Publishing…" : "Publish post"}
          </button>
        </div>
      </form>

      {loadError && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{loadError}</p>}

      {posts === null && <p className="text-center text-sm text-slate-muted">Loading posts…</p>}
      {posts?.length === 0 && !loadError && (
        <p className="rounded-2xl border border-ink-line bg-ink-soft/40 px-6 py-10 text-center text-sm text-slate-muted">
          No posts yet. Be the first to share something.
        </p>
      )}

      <div className="space-y-5">
        {posts?.map((p) => <PostCard key={p.id} post={p} onLike={toggleLike} onCount={updateCount} onDelete={removePost} />)}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between font-mono text-sm">
          <button type="button" onClick={() => load(page - 1)} disabled={page === 1}
            className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => load(n)} aria-current={n === page ? "page" : undefined}
                className={`focus-ring h-9 w-9 rounded-lg transition-colors ${n === page ? "bg-indigo text-white" : "text-slate-muted hover:bg-ink-line/40 hover:text-paper"}`}>
                {n}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => load(page + 1)} disabled={page === totalPages}
            className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40">
            Next →
          </button>
        </nav>
      )}
    </main>
  );
}
