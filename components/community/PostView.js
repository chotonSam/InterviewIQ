"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PostCard, api } from "@/components/community/PostCard";

// One post on its own page (opened from a notification, or by clicking a post title)
export default function PostView({ initial }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [error, setError] = useState("");

  async function like() {
    setPost((p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }));
    try {
      const { liked, likes } = await api(`/api/posts/${post.id}/like`, { method: "POST" });
      setPost((p) => ({ ...p, liked, likes }));
    } catch {
      router.refresh();
    }
  }

  async function remove() {
    if (!window.confirm("Delete this post? Its comments and likes will be removed too.")) return;
    try {
      await api(`/api/posts/${post.id}`, { method: "DELETE" });
      router.push("/community");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const setCount = useCallback((_id, n) => setPost((p) => (p.comments === n ? p : { ...p, comments: n })), []);

  return (
    <>
      {error && <p role="alert" className="mb-4 text-sm text-signal-red">{error}</p>}
      <PostCard post={post} onLike={like} onCount={setCount} onDelete={remove} defaultOpen />
    </>
  );
}
