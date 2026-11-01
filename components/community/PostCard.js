"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/time";
import { avatarUrl } from "@/lib/avatar";

const COMMENT_POLL_MS = 5000; // how often an open comment section checks for new comments

export async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
}
export const postJSON = (url, body) =>
  api(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function Avatar({ name, image, size = "h-8 w-8" }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl(image, 64)} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-indigo/30 text-xs font-medium`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function Comments({ postId, onCount }) {
  const [comments, setComments] = useState(null); // null = loading
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Load now, then poll so comments from other users appear without a refresh
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api(`/api/posts/${postId}/comments`);
        if (!active) return;
        setComments(data.comments);
        onCount(data.comments.length);
      } catch {
        if (active) setComments((c) => c ?? []);
      }
    }
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, COMMENT_POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [postId, onCount]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    setSending(true);
    try {
      const { comment } = await postJSON(`/api/posts/${postId}/comments`, { text });
      setComments((list) => {
        const next = list ?? [];
        const merged = next.some((c) => c.id === comment.id) ? next : [...next, comment];
        onCount(merged.length);
        return merged;
      });
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-5 space-y-4 border-t border-ink-line pt-5">
      {comments === null && <p className="text-sm text-slate-muted">Loading comments…</p>}
      {comments?.length === 0 && <p className="text-sm text-slate-muted">No comments yet. Be the first.</p>}
      {comments?.map((c) => (
        <div key={c.id} className="flex gap-3">
          <Link href={`/u/${c.username}`} aria-label={`${c.author}'s profile`} className="focus-ring h-fit rounded-full">
            <Avatar name={c.author} image={c.authorImage} size="h-6 w-6" />
          </Link>
          <div>
            <p className="text-xs">
              <Link href={`/u/${c.username}`} className="focus-ring rounded font-medium hover:text-indigo">{c.author}</Link>
              <span className="ml-2 font-mono text-slate-muted">{timeAgo(c.createdAt)}</span>
            </p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-muted">{c.text}</p>
          </div>
        </div>
      ))}

      {error && <p role="alert" className="text-sm text-signal-red">{error}</p>}

      <form onSubmit={submit} className="flex gap-3 pt-1">
        <label htmlFor={`c-${postId}`} className="sr-only">Write a comment</label>
        <input
          id={`c-${postId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Write a comment…"
          className="field focus-ring"
        />
        <button type="submit" disabled={!text.trim() || sending} className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
          {sending ? "…" : "Post"}
        </button>
      </form>
    </div>
  );
}

export function PostCard({ post, onLike, onCount, onDelete, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const setCount = useCallback((n) => onCount(post.id, n), [onCount, post.id]);

  return (
    <article className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link href={`/u/${post.username}`} className="focus-ring flex min-w-0 items-center gap-3 rounded-lg" aria-label={`${post.author}'s profile`}>
          <Avatar name={post.author} image={post.authorImage} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium hover:text-indigo">{post.author}</p>
            <p className="font-mono text-xs text-slate-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        <span className="rounded-full border border-ink-line px-3 py-1 font-mono text-xs text-slate-muted">{post.tag}</span>
      </div>

      <h2 className="mb-2 font-medium"><Link href={`/community/${post.id}`} className="focus-ring rounded hover:text-indigo">{post.title}</Link></h2>
      <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-slate-muted">{post.body}</p>

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
          <span aria-hidden="true">💬</span> {post.comments} {post.comments === 1 ? "comment" : "comments"}
        </button>
        {post.mine && (
          <button type="button" onClick={() => onDelete(post.id)} className="focus-ring ml-auto rounded text-signal-red/80 transition-colors hover:text-signal-red">
            Delete
          </button>
        )}
      </div>

      {open && <Comments postId={post.id} onCount={setCount} />}
    </article>
  );
}

