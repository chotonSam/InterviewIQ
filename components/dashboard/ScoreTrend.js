export default function ScoreTrend({ scores }) {
  const n = scores.length;

  if (n < 2) {
    return (
      <div className="flex flex-col rounded-2xl border border-ink-line bg-ink-soft/40 p-6 lg:col-span-2">
        <h2 className="mb-8 font-medium">Score trend</h2>
        <p className="m-auto max-w-xs text-center text-sm text-slate-muted">
          Complete at least 2 interviews to see how your scores change over time.
        </p>
      </div>
    );
  }

  const pts = scores.map((s, i) => [10 + (i * 460) / (n - 1), 150 - s * 1.4]);
  const last = pts[n - 1];
  const delta = scores[n - 1] - scores[0];

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6 lg:col-span-2">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-medium">Score trend</h2>
        <span className={`font-mono text-xs ${delta >= 0 ? "text-signal-green" : "text-signal-amber"}`}>
          {delta >= 0 ? "+" : ""}{delta} pts over last {n} interviews
        </span>
      </div>

      <svg viewBox="0 0 480 160" className="h-40 w-full" preserveAspectRatio="none" role="img"
        aria-label={`Line chart of your last ${n} interview scores: ${scores.join(", ")}`}>
        {[10, 80, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#2A2E40" strokeWidth="1" />
        ))}
        <polyline fill="none" stroke="#5B5FEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          points={pts.map((p) => p.join(",")).join(" ")} />
        {pts.slice(0, -1).map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="4" fill="#5B5FEF" />
        ))}
        <circle cx={last[0]} cy={last[1]} r="5" fill="#34D399" />
      </svg>

      <div className="mt-2 flex justify-between font-mono text-xs text-slate-muted">
        <span>{n} sessions ago</span>
        <span>Most recent</span>
      </div>
    </div>
  );
}
