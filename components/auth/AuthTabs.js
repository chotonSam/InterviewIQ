"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/Icons";

// Live username check: debounced request to /api/users/check-username
function useUsernameCheck(username) {
  const [status, setStatus] = useState("idle"); // idle | checking | available | taken | invalid | error

  useEffect(() => {
    if (!username) return setStatus("idle");
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) return setStatus("invalid");

    setStatus("checking");
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?u=${encodeURIComponent(username)}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) return setStatus("error");
        setStatus(data.available ? "available" : "taken");
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error");
      }
    }, 450); // debounce

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [username]);

  return status;
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
      {message}
    </p>
  );
}

function LoginForm({ onSwitch }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const { ok, data } = await postJSON("/api/auth/login", { email: f.get("email"), password: f.get("password") });
    if (!ok) {
      setError(data.error ?? "Could not log in.");
      return setLoading(false);
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl">Welcome back</h1>
      <p className="mb-8 text-sm text-slate-muted">Log in to pick up where you left off.</p>

      <form className="space-y-5" onSubmit={onSubmit}>
        <ErrorBox message={error} />
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email</label>
          <input id="login-email" name="email" type="email" placeholder="you@example.com" className="field focus-ring" required />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Password</label>
          <input id="login-password" name="password" type="password" placeholder="••••••••" className="field focus-ring" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
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
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const status = useUsernameCheck(username);

  const message = {
    idle: null,
    checking: <p className="mt-1.5 font-mono text-xs text-slate-muted">Checking availability…</p>,
    available: <p className="mt-1.5 font-mono text-xs text-signal-green">✓ {username} is available</p>,
    taken: <p className="mt-1.5 font-mono text-xs text-signal-red">✕ {username} is already taken</p>,
    invalid: <p className="mt-1.5 font-mono text-xs text-signal-amber">3–20 characters: letters, numbers, underscore</p>,
    error: <p className="mt-1.5 font-mono text-xs text-signal-amber">Could not check right now</p>,
  }[status];

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "taken") return setError("Please choose a different username.");
    setError("");
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const { ok, data } = await postJSON("/api/auth/register", {
      name: f.get("name"),
      username,
      email: f.get("email"),
      phone: f.get("phone"),
      password: f.get("password"),
    });
    if (!ok) {
      setError(data.error ?? "Could not create your account.");
      return setLoading(false);
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl">Create your account</h1>
      <p className="mb-8 text-sm text-slate-muted">Set up your profile and start practicing in minutes.</p>

      <form className="space-y-5" onSubmit={onSubmit}>
        <ErrorBox message={error} />
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-sm font-medium">Full name</label>
          <input id="reg-name" name="name" type="text" placeholder="Ayesha Rahman" className="field focus-ring" required />
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
            <input id="reg-email" name="email" type="email" placeholder="you@example.com" className="field focus-ring" required />
          </div>
          <div>
            <label htmlFor="reg-phone" className="mb-2 block text-sm font-medium">Phone</label>
            <input id="reg-phone" name="phone" type="tel" placeholder="+880 1XXX XXXXXX" className="field focus-ring" />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium">Password</label>
          <input id="reg-password" name="password" type="password" placeholder="At least 8 characters" className="field focus-ring" required minLength={8} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {loading ? "Creating account…" : "Create account"}
        </button>
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
      {tab === "login" ? <LoginForm onSwitch={() => setTab("register")} /> : <RegisterForm onSwitch={() => setTab("login")} />}
    </div>
  );
}
