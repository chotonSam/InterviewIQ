"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, sanitizeTopic, isValidTopic } from "@/lib/topics";

const SUGGESTIONS = ["JavaScript", "React", "Python", "SQL", "Node.js", "Data Structures", "HR Interview", "Digital Marketing"];

export default function ChatStart() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clean = sanitizeTopic(topic);
  const canStart = isValidTopic(clean) && !loading;

  async function start(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: clean, level }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start the chat.");
      router.push(`/chat/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={start} className="space-y-6 rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
      <div>
        <label htmlFor="chat-topic" className="mb-2 block text-sm font-medium">What do you want to practice?</label>
        <input id="chat-topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={60}
          placeholder="Any topic — e.g. JavaScript closures, SQL joins, Nursing…" className="field focus-ring" />
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setTopic(s)}
              className="focus-ring rounded-full border border-ink-line px-3 py-1 font-mono text-xs text-slate-muted transition-colors hover:border-indigo/60 hover:text-paper">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Starting level <span className="font-normal text-slate-muted">(you can ask the coach to go harder or easier anytime)</span></p>
        <div className="inline-flex items-center gap-1 rounded-full border border-ink-line bg-ink p-1 text-sm">
          {LEVELS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}
              className={`focus-ring rounded-full px-4 py-1.5 transition-colors ${level === l ? "bg-indigo text-white" : "text-slate-muted hover:text-paper"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={!canStart} className="btn-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Starting…" : "Start practice chat"} {!loading && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </form>
  );
}
