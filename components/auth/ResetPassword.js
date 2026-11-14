"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordField from "@/components/auth/PasswordField";

// Opened from the link in the reset email
export default function ResetPassword({ token }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const card = "mx-auto w-full max-w-md rounded-3xl border border-ink-line bg-ink-soft/60 p-8";

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (pw !== pw2) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not reset the password.");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="font-display text-3xl">Link needed</h1>
        <p role="alert" className="mt-3 text-sm leading-relaxed text-slate-muted">This page needs the link from your reset email.</p>
        <Link href="/forgot-password" className="btn-primary mt-6 px-6 py-3 text-sm">Get a reset email</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${card} text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal-green/15 text-2xl text-signal-green" aria-hidden="true">✓</div>
        <h1 className="font-display text-3xl">Password updated</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-muted">You can log in with your new password now. Any other device that was logged in has been signed out.</p>
        <Link href="/auth" className="btn-primary mt-6 px-6 py-3 text-sm">Go to log in <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-5`}>
      <div>
        <h1 className="font-display text-3xl">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-muted">Pick something you don&apos;t use anywhere else.</p>
      </div>
      <PasswordField id="link-new" label="New password" value={pw} onChange={setPw} autoComplete="new-password" minLength={8} hint="At least 8 characters." placeholder="At least 8 characters" />
      <PasswordField id="link-new2" label="Confirm new password" value={pw2} onChange={setPw2} autoComplete="new-password" minLength={8} placeholder="Type it again" />
      {error && (
        <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
          {error} {/(expired|isn.t valid|already used)/.test(error) && <Link href="/forgot-password" className="underline">Get a new email</Link>}
        </p>
      )}
      <button type="submit" disabled={busy || !pw || !pw2} className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Saving…" : "Save new password"}</button>
    </form>
  );
}
