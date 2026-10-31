"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RichText from "@/components/RichText";

const CHIPS = [
  { label: "💡 Hint", text: "Give me a hint" },
  { label: "🔍 Explain", text: "Explain this more simply" },
  { label: "⏭ Skip", text: "I don't know, show me the answer" },
  { label: "⬆ Harder", text: "Make the questions harder" },
  { label: "⬇ Easier", text: "Make the questions easier" },
];

const VERDICT = {
  correct: { label: "Correct ✓", cls: "bg-signal-green/15 text-signal-green" },
  partial: { label: "Partly right", cls: "bg-signal-amber/15 text-signal-amber" },
  incorrect: { label: "Not quite", cls: "bg-signal-red/15 text-signal-red" },
};

function Bubble({ m }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-indigo px-4 py-3 text-sm leading-relaxed text-white">{m.text}</p>
      </div>
    );
  }

  if (m.kind === "question") {
    return (
      <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-indigo/40 bg-ink-soft/60 p-5">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-indigo">Question</p>
        <p className="font-display text-xl leading-snug">{m.text}</p>
        {m.code && <pre className="mt-4 overflow-x-auto rounded-xl border border-ink-line bg-ink p-4 font-mono text-sm leading-relaxed text-paper/90">{m.code}</pre>}
      </div>
    );
  }

  if (m.kind === "feedback") {
    const v = VERDICT[m.verdict] ?? VERDICT.partial;
    return (
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-ink-line bg-ink-soft/40 p-5">
        <span className={`rounded px-2 py-0.5 font-mono text-xs ${v.cls}`}>{v.label}</span>
        <RichText text={m.text} className="mt-3 text-sm" />
        {m.ideal && (
          <div className="mt-3 border-t border-ink-line pt-3 text-sm text-slate-muted">
            <p className="mb-1 font-mono text-xs">IDEAL ANSWER</p>
            <RichText text={m.ideal} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-ink-soft/60 px-5 py-4 text-sm text-paper/90">
      <RichText text={m.text} />
    </div>
  );
}

export default function ChatRoom({ session }) {
  const [messages, setMessages] = useState(session.messages);
  const [level, setLevel] = useState(session.level);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(raw) {
    const text = raw.trim();
    if (!text || sending) return;
    setError("");
    setSending(true);

    const tempId = `tmp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", kind: "text", text }]); // show it instantly
    setInput("");

    try {
      const res = await fetch(`/api/chat/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "The coach could not reply.");
      setMessages((m) => [...m.filter((x) => x.id !== tempId), ...data.messages]);
      setLevel(data.level);
    } catch (err) {
      setMessages((m) => m.filter((x) => x.id !== tempId)); // undo, and give the text back
      setInput(text);
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="shrink-0 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-10">
          <div className="min-w-0">
            <p className="font-mono text-xs text-slate-muted">Practice chat · {level}</p>
            <h1 className="mt-1 truncate font-display text-2xl leading-none">{session.topic}</h1>
          </div>
          <Link href="/chat" className="focus-ring shrink-0 rounded text-sm text-slate-muted transition-colors hover:text-paper">All chats</Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m) => <Bubble key={m.id} m={m} />)}
          {sending && (
            <p className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-ink-soft/60 px-4 py-3 font-mono text-xs text-slate-muted" role="status">
              <span className="rec-dot h-1.5 w-1.5 rounded-full bg-indigo" /> Coach is thinking…
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="shrink-0 border-t border-ink-line bg-ink px-6 py-4 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button key={c.label} type="button" disabled={sending} onClick={() => send(c.text)}
                className="focus-ring rounded-full border border-ink-line px-3 py-1 text-xs text-slate-muted transition-colors hover:border-indigo/60 hover:text-paper disabled:opacity-50">
                {c.label}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mb-3 text-sm text-signal-red">{error}</p>}

          <div className="flex items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">Your message</label>
            <textarea id="chat-input" rows={Math.min(8, Math.max(2, input.split("\n").length))} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
              maxLength={2000} placeholder="Answer the question, or ask anything — write as much as you need…" className="field focus-ring resize-none" />
            <button type="button" onClick={() => send(input)} disabled={sending || !input.trim()}
              className="btn-primary h-12 shrink-0 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              Send
            </button>
          </div>
          <p className="mt-2 font-mono text-xs text-slate-muted">Enter to send · Shift+Enter for a new line</p>
        </div>
      </footer>
    </div>
  );
}
