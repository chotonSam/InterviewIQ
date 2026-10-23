import { trendPoints } from "@/lib/data";

export default function ScoreTrend() {
  const points = trendPoints.map((p) => p.join(",")).join(" ");
  const last = trendPoints[trendPoints.length - 1];

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6 lg:col-span-2">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-medium">Score trend</h2>
        <span className="font-mono text-xs text-signal-green">+22% over last 8 interviews</span>
      </div>

      <svg
        viewBox="0 0 480 160"
        className="h-40 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart showing interview scores trending upward from 58 to 88 over eight sessions"
      >
        {[10, 80, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#2A2E40" strokeWidth="1" />
        ))}
        <polyline fill="none" stroke="#5B5FEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {trendPoints.slice(0, -1).map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="4" fill="#5B5FEF" />
        ))}
        <circle cx={last[0]} cy={last[1]} r="5" fill="#34D399" />
      </svg>

      <div className="mt-2 flex justify-between font-mono text-xs text-slate-muted">
        <span>8 sessions ago</span>
        <span>Most recent</span>
      </div>
    </div>
  );
}
