"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh(); // the header switches back to "Log in"
    setBusy(false);
  }

  return (
    <button type="button" onClick={logout} disabled={busy}
      className={`focus-ring rounded-full border border-ink-line px-4 py-2 text-sm text-slate-muted transition-colors hover:border-signal-red/60 hover:text-paper disabled:opacity-60 ${className}`}>
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}
