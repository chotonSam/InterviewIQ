const reasons = [
  "Every mock interview and score is kept in your history.",
  "Post and comment in the community under your own profile.",
  "Get resource recommendations based on your weak spots.",
];

export default function AuthSidePanel() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -inset-6 rounded-full bg-indigo/10 blur-3xl" />
      <div className="relative rounded-2xl border border-ink-line bg-ink-soft p-8">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">Why create an account</p>
        <h2 className="mb-6 font-display text-3xl leading-tight">Your practice, saved and scored over time.</h2>

        <ul className="space-y-5">
          {reasons.map((r, i) => (
            <li key={r} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo/15 font-mono text-sm text-indigo">{i + 1}</span>
              <p className="pt-1.5 text-sm leading-relaxed text-slate-muted">{r}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between border-t border-ink-line pt-6 font-mono text-sm">
          <span className="text-slate-muted">Score improvement, avg.</span>
          <span className="text-signal-green">+22%</span>
        </div>
      </div>
    </div>
  );
}
