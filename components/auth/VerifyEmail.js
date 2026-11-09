"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Opened from the link in the email. Confirms the token once, then shows the result.
export default function VerifyEmail({ token }) {
  const [state, setState] = useState(token ? "working" : "missing"); // working | ok | error | missing
  const [message, setMessage] = useState("");
  const started = useRef(false); // React dev mode runs effects twice — the token must only be used once

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) return setState("ok");
        setMessage(data.error ?? "We couldn't verify your email.");
        setState("error");
      } catch {
        setMessage("Network problem. Please check your connection and try again.");
        setState("error");
      }
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-ink-line bg-ink-soft/60 p-8 text-center">
      {state === "working" && (
        <>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-muted">One moment</p>
          <h1 className="mt-3 font-display text-3xl" role="status">Verifying your email…</h1>
        </>
      )}

      {state === "ok" && (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal-green/15 text-2xl text-signal-green" aria-hidden="true">✓</div>
          <h1 className="font-display text-3xl">Email verified</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-muted">Thank you! You can now post, comment and share resources.</p>
          <Link href="/dashboard" className="btn-primary mt-6 px-6 py-3 text-sm">Go to my dashboard <span aria-hidden="true">→</span></Link>
        </>
      )}

      {(state === "error" || state === "missing") && (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal-red/15 text-2xl text-signal-red" aria-hidden="true">!</div>
          <h1 className="font-display text-3xl">Couldn&apos;t verify</h1>
          <p role="alert" className="mt-3 text-sm leading-relaxed text-slate-muted">
            {state === "missing" ? "This page needs the link from your verification email." : message}
          </p>
          <Link href="/dashboard" className="btn-primary mt-6 px-6 py-3 text-sm">Go to my dashboard</Link>
        </>
      )}
    </div>
  );
}
