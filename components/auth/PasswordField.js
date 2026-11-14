"use client";

import { useState } from "react";

// A password box with a "Show" button, so people can check what they typed
export default function PasswordField({ id, label, value, onChange, autoComplete, hint, placeholder = "••••••••", minLength, required = true }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
          placeholder={placeholder} minLength={minLength} maxLength={72} required={required} className="field focus-ring pr-16" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-mono text-xs text-slate-muted transition-colors hover:text-paper">
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-muted">{hint}</p>}
    </div>
  );
}
