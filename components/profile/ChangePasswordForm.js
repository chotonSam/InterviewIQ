"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordField from "@/components/auth/PasswordField";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (next !== again) return setError("The new passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not change the password.");
      setCurrent(""); setNext(""); setAgain("");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
      <PasswordField id="pw-current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField id="pw-new" label="New password" value={next} onChange={setNext} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" />
        <PasswordField id="pw-again" label="Confirm new password" value={again} onChange={setAgain} autoComplete="new-password" minLength={8} placeholder="Type it again" />
      </div>
      <p className="text-xs text-slate-muted">At least 8 characters. Changing it signs you out on your other devices. Forgot the current one? <Link href="/forgot-password" className="text-indigo hover:text-paper">Reset it by email</Link>.</p>

      {done && <p role="status" className="rounded-lg border border-signal-green/40 bg-signal-green/10 px-4 py-3 text-sm text-signal-green">Password updated. Your other devices were signed out.</p>}
      {error && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={busy || !current || !next || !again} className="btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Saving…" : "Change password"}</button>
      </div>
    </form>
  );
}
