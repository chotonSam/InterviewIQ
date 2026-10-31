"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NextUp({ nextUp }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startNext() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextUp.startPayload, difficulty: nextUp.level }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start.");
      router.push(`/interview/${data.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  let eyebrow, title, body, action;

  if (nextUp.type === "resume") {
    const pct = nextUp.total ? Math.round((nextUp.done / nextUp.total) * 100) : 0;
    eyebrow = "Continue where you left off";
    title = nextUp.title;
    body = (
      <div className="mt-3 max-w-sm">
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-line"><div className="h-full rounded-full bg-signal-amber" style={{ width: `${pct}%` }} /></div>
        <p className="mt-2 font-mono text-xs text-slate-muted">{nextUp.done} of {nextUp.total} answered</p>
      </div>
    );
    action = <Link href={`/interview/${nextUp.id}`} className="btn-primary px-6 py-3 text-sm">Resume <span aria-hidden="true">→</span></Link>;
  } else if (nextUp.type === "next") {
    eyebrow = "Your next step";
    title = `${nextUp.level} · ${nextUp.topic}`;
    body = <p className="mt-2 text-sm text-slate-muted">{nextUp.level === "Easy" ? "Start with the fundamentals." : "You unlocked this level — keep the momentum going."}</p>;
    action = (
      <button type="button" onClick={startNext} disabled={busy} className="btn-primary px-6 py-3 text-sm disabled:opacity-60">
        {busy ? "Preparing questions…" : `Start ${nextUp.level}`} {!busy && <span aria-hidden="true">→</span>}
      </button>
    );
  } else if (nextUp.type === "chat") {
    eyebrow = "Field cleared";
    title = "You finished every level on your last field";
    body = <p className="mt-2 text-sm text-slate-muted">Try another field, or keep sharp in the practice chat.</p>;
    action = <Link href="/interview" className="btn-primary px-6 py-3 text-sm">Choose a field <span aria-hidden="true">→</span></Link>;
  } else {
    eyebrow = "Get started";
    title = "Take your first mock interview";
    body = <p className="mt-2 text-sm text-slate-muted">10 short questions, scored by AI. Takes about 5 minutes.</p>;
    action = <Link href="/interview" className="btn-primary px-6 py-3 text-sm">Start <span aria-hidden="true">→</span></Link>;
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-indigo/40 bg-gradient-to-r from-indigo/15 via-indigo/5 to-transparent p-6">
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-green">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{title}</h2>
        {body}
        {error && <p role="alert" className="mt-3 text-sm text-signal-red">{error}</p>}
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        {action}
        <Link href="/chat" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">Or practice in the chat →</Link>
      </div>
    </section>
  );
}
