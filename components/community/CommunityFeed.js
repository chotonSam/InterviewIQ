"use client";

import { useState } from "react";
import { currentUser, initialPosts } from "@/lib/community";

const PAGE_SIZE = 4;

function Avatar({ color }) {
  return <div className={`h-8 w-8 shrink-0 rounded-full ${color}`} />;
}

function PostCard({ post, onLike, onComment }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onComment(post.id, text.trim());
    setText("");
  }

  return (
    <article className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar color={post.color} />
          <div>
            <p className="text-sm font-medium">{post.author}</p>
            <p className="font-mono text-xs text-slate-muted">{post.when}</p>
          </div>
        </div>
        <span className="rounded-full border border-ink-line px-3 py-1 font-mono text-xs text-slate-muted">{post.tag}</span>
      </div>

      <h2 className="mb-2 font-medium">{post.title}</h2>
      <p className="mb-5 text-sm leading-relaxed text-slate-muted">{post.body}</p>

      <div className="flex items-center gap-5 font-mono text-xs">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          aria-pressed={post.liked}
          className={`focus-ring flex items-center gap-1.5 rounded transition-colors ${post.liked ? "text-signal-red" : "text-slate-muted hover:text-paper"}`}
        >
          <span aria-hidden="true">{post.liked ? "♥" : "♡"}</span> {post.likes}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="focus-ring flex items-center gap-1.5 rounded text-slate-muted transition-colors hover:text-paper"
        >
          <span aria-hidden="true">💬</span> {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-4 border-t border-ink-line pt-5">
          {post.comments.length === 0 && <p className="text-sm text-slate-muted">No comments yet. Be the first.</p>}
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-ink-line" />
              <div>
                <p className="text-xs">
                  <span className="font-medium">{c.author}</span>
                  <span className="ml-2 font-mono text-slate-muted">{c.when}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-muted">{c.text}</p>
              </div>
            </div>
          ))}

          <form onSubmit={submit} className="flex gap-3 pt-1">
            <label htmlFor={`c-${post.id}`} className="sr-only">Write a comment</label>
            <input
              id={`c-${post.id}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              className="field focus-ring"
            />
            <button type="submit" disabled={!text.trim()} className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const visible = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function createPost(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    // Backend step: POST /api/posts
    setPosts((p) => [
      { id: Date.now(), author: currentUser.name, color: currentUser.color, when: "Just now", tag: "Experience",
        title: title.trim(), body: body.trim(), likes: 0, liked: false, comments: [] },
      ...p,
    ]);
    setTitle("");
    setBody("");
    setPage(1);
  }

  function toggleLike(id) {
    // Backend step: POST /api/posts/:id/like (toggle) and return the new count
    setPosts((all) => all.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
  }

  function addComment(id, text) {
    // Backend step: POST /api/posts/:id/comments + real-time push to other viewers
    setPosts((all) =>
      all.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { id: Date.now(), author: currentUser.name, when: "Just now", text }] }
          : p
      )
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10 lg:px-10">
      {/* Create post */}
      <form onSubmit={createPost} className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar color={currentUser.color} />
          <p className="text-sm font-medium">Share with the community</p>
        </div>
        <label htmlFor="post-title" className="sr-only">Post title</label>
        <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. What I learned from my HR round)" className="field focus-ring mb-3" />
        <label htmlFor="post-body" className="sr-only">Post body</label>
        <textarea id="post-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share an experience, ask a question…" className="field focus-ring resize-none" />
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={!title.trim() || !body.trim()} className="btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            Publish post
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="space-y-5">
        {visible.map((p) => (
          <PostCard key={p.id} post={p} onLike={toggleLike} onComment={addComment} />
        ))}
      </div>

      {/* Pagination */}
      <nav aria-label="Pagination" className="flex items-center justify-between font-mono text-sm">
        <button
          type="button"
          onClick={() => setPage((n) => Math.max(1, n - 1))}
          disabled={page === 1}
          className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={`focus-ring h-9 w-9 rounded-lg transition-colors ${n === page ? "bg-indigo text-white" : "text-slate-muted hover:bg-ink-line/40 hover:text-paper"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
          disabled={page === totalPages}
          className="focus-ring rounded px-3 py-2 text-slate-muted transition-colors hover:text-paper disabled:opacity-40"
        >
          Next →
        </button>
      </nav>
    </main>
  );
}
