"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/Icons";

// Temporary fake "taken" list. Backend step: replace with
//   fetch(`/api/users/check-username?u=${username}`)
const TAKEN = ["admin", "ayesha", "test", "interviewiq"];

function useUsernameCheck(username) {
  const [status, setStatus] = useState("idle"); // idle | checking | available | taken | invalid

  useEffect(() => {
    if (!username) return setStatus("idle");
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) return setStatus("invalid");

    setStatus("checking");
    const t = setTimeout(() => {
      setStatus(TAKEN.includes(username.toLowerCase()) ? "taken" : "available");
    }, 500); // debounce
    return () => clearTimeout(t);
  }, [username]);

  return status;
}

function LoginForm({ onSwitch }) {
  return (
    <div>
      <h1 className="mb-2 font-display text-4xl">Welcome back</h1>
      <p className="mb-8 text-sm text-slate-muted">Log in to pick up where you left off.</p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email</label>
          <input id="login-email" type="email" placeholder="you@example.com" className="field focus-ring" required />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
            <a href="#" className="focus-ring rounded text-xs text-indigo transition-colors hover:text-paper">Forgot password?</a>
          </div>
          <input id="login-password" type="password" placeholder="••••••••" className="field focus-ring" required />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-muted">
          <input type="checkbox" className="focus-ring rounded border-ink-line bg-ink-soft" />
          Keep me logged in
        </label>
        <button type="submit" className="btn-primary w-full py-3.5">Log in</button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-muted">
        New to InterviewIQ?{" "}
        <button type="button" onClick={onSwitch} className="text-indigo transition-colors hover:text-paper">
          Create a free account
        </button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const status = useUsernameCheck(username);

  const message = {
    idle: null,
    checking: <p className="mt-1.5 font-mono text-xs text-slate-muted">Checking availability…</p>,
    available: <p className="mt-1.5 font-mono text-xs text-signal-green">✓ {username} is available</p>,
    taken: <p className="mt-1.5 font-mono text-xs text-signal-red">✕ {username} is already taken</p>,
    invalid: <p className="mt-1.5 font-mono text-xs text-signal-amber">3–20 characters: letters, numbers, underscore</p>,
  }[status];

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl">Create your account</h1>
      <p className="mb-8 text-sm text-slate-muted">Set up your profile and start practicing in minutes.</p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-sm font-medium">Full name</label>
          <input id="reg-name" type="text" placeholder="Ayesha Rahman" className="field focus-ring" required />
        </div>

        <div>
          <label htmlFor="reg-username" className="mb-2 block text-sm font-medium">Username</label>
          <div className="relative">
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ayesha_r"
              className="field focus-ring pr-10"
              required
              autoComplete="off"
            />
            {status === "available" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-signal-green" title="Username available">
                <CheckIcon />
              </span>
            )}
          </div>
          {message}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="reg-email" type="email" placeholder="you@example.com" className="field focus-ring" required />
          </div>
          <div>
            <label htmlFor="reg-phone" className="mb-2 block text-sm font-medium">Phone</label>
            <input id="reg-phone" type="tel" placeholder="+880 1XXX XXXXXX" className="field focus-ring" />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium">Password</label>
          <input id="reg-password" type="password" placeholder="At least 8 characters" className="field focus-ring" required minLength={8} />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-muted">
          <input type="checkbox" className="focus-ring mt-0.5 rounded border-ink-line bg-ink-soft" required />
          I agree to the Terms of Service and Privacy Policy
        </label>

        <button type="submit" className="btn-primary w-full py-3.5">Create account</button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-muted">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-indigo transition-colors hover:text-paper">Log in</button>
      </p>
    </div>
  );
}

export default function AuthTabs() {
  const [tab, setTab] = useState("login");

  const tabBtn = (id, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`focus-ring relative pb-4 font-medium transition-colors ${tab === id ? "text-paper" : "text-slate-muted hover:text-paper"}`}
    >
      {label}
      <span className={`absolute -bottom-px left-0 right-0 h-0.5 bg-indigo transition-opacity ${tab === id ? "opacity-100" : "opacity-0"}`} />
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      <div role="tablist" className="mb-10 flex items-center gap-8 border-b border-ink-line">
        {tabBtn("login", "Log in")}
        {tabBtn("register", "Create account")}
      </div>
      {tab === "login" ? (
        <LoginForm onSwitch={() => setTab("register")} />
      ) : (
        <RegisterForm onSwitch={() => setTab("login")} />
      )}
    </div>
  );
}
