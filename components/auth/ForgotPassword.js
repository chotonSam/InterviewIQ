"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordField from "@/components/auth/PasswordField";

async function post(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | code | done
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [dev, setDev] = useState(null); // development only: no mail server configured yet

  async function sendEmail(e) {
    e?.preventDefault();
    setError("");
    setNote("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/forgot-password", { email });
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not send the email.");
    setDev(data.devCode ? { code: data.devCode, link: data.devLink } : null);
    if (step === "code") setNote("Sent again — if there is an account for that email, a new code is on its way.");
    setStep("code");
  }

  async function reset(e) {
    e.preventDefault();
    setError("");
    if (pw !== pw2) return setError("The two passwords don't match.");
    setBusy(true);
    const { ok, data } = await post("/api/auth/reset-password", { email, code, password: pw });
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not reset the password.");
    setStep("done");
  }

  const card = "mx-auto w-full max-w-md rounded-3xl border border-ink-line bg-ink-soft/60 p-8";

  if (step === "done") {
    return (
      <div className={`${card} text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal-green/15 text-2xl text-signal-green" aria-hidden="true">✓</div>
        <h1 className="font-display text-3xl">Password updated</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-muted">You can log in with your new password now. Any other device that was logged in has been signed out.</p>
        <Link href="/auth" className="btn-primary mt-6 px-6 py-3 text-sm">Go to log in <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={reset} className={`${card} space-y-5`}>
        <div>
          <h1 className="font-display text-3xl">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-muted">
            If there is an account for <span className="break-all text-paper">{email}</span>, we sent it a 6-digit code and a link. Enter the code below and choose a new password. (Check spam too.)
          </p>
        </div>

        {dev && (
          <p className="rounded-lg border border-signal-amber/40 bg-signal-amber/10 px-4 py-3 text-xs leading-relaxed text-slate-muted">
            Development mode — email isn&apos;t set up yet. Your code: <span className="rounded bg-ink px-2 py-0.5 font-mono text-sm tracking-[0.3em] text-paper">{dev.code}</span>
          </p>
        )}

        <div>
          <label htmlFor="reset-code" className="mb-2 block text-sm font-medium">6-digit code</label>
          <input id="reset-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric"
            autoComplete="one-time-code" maxLength={6} placeholder="123456" required
            className="field focus-ring text-center font-mono text-lg tracking-[0.4em] placeholder:tracking-normal" />
        </div>
        <PasswordField id="reset-new" label="New password" value={pw} onChange={setPw} autoComplete="new-password" minLength={8} hint="At least 8 characters." placeholder="At least 8 characters" />
        <PasswordField id="reset-new2" label="Confirm new password" value={pw2} onChange={setPw2} autoComplete="new-password" minLength={8} placeholder="Type it again" />

        {note && <p role="status" className="text-sm text-signal-green">{note}</p>}
        {error && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>}

        <button type="submit" disabled={busy || code.length !== 6 || !pw || !pw2} className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Resetting…" : "Reset password"}
        </button>

        <p className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-muted">
          <button type="button" onClick={sendEmail} disabled={busy} className="focus-ring rounded text-indigo transition-colors hover:text-paper disabled:opacity-60">Send the email again</button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); setNote(""); }} className="focus-ring rounded transition-colors hover:text-paper">Use a different email</button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={sendEmail} className={`${card} space-y-5`}>
      <div>
        <h1 className="font-display text-3xl">Forgot your password?</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-muted">Enter the email you registered with. We&apos;ll send you a 6-digit code and a link to choose a new password.</p>
      </div>
      <div>
        <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className="field focus-ring" />
      </div>
      {error && <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{error}</p>}
      <button type="submit" disabled={busy || !email.trim()} className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Sending…" : "Send reset email"}</button>
      <p className="text-center text-sm text-slate-muted">
        Remembered it? <Link href="/auth" className="text-indigo transition-colors hover:text-paper">Back to log in</Link>
      </p>
    </form>
  );
}
