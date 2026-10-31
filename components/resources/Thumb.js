"use client";

import { useState } from "react";

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

// Tries each image source in order; when all fail it shows a clean placeholder instead of a broken image.
export default function Thumb({ resource, className = "" }) {
  const { type, youtubeId, thumbnail, url } = resource;
  const sources = [
    thumbnail,
    type === "video" && youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "",
    type === "video" && youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : "",
  ].filter(Boolean);

  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo/25 to-ink-line/60 text-slate-muted ${className}`}>
        <span className="text-3xl" aria-hidden="true">{type === "video" ? "▶" : "📄"}</span>
        {type === "article" && <span className="font-mono text-xs">{hostOf(url)}</span>}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setAttempt((a) => a + 1)}
      className={`object-cover ${className}`}
    />
  );
}
