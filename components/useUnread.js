"use client";

import { useEffect, useState } from "react";

// Keeps the notification badge fresh: checks every 30s, and instantly when something marks notifications read.
export default function useUnread(initial) {
  const [count, setCount] = useState(initial);

  useEffect(() => setCount(initial), [initial]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (active) setCount(data.count);
        }
      } catch {
        /* offline — keep the old number */
      }
    }
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30000);
    window.addEventListener("iq:notifications", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("iq:notifications", load);
    };
  }, []);

  return count;
}
