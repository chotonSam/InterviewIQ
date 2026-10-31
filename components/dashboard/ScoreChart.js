"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Chart geometry (SVG units — the SVG scales to fit the card)
const W = 640, H = 260;
const PAD = { l: 44, r: 20, t: 20, b: 34 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const BOTTOM = PAD.t + PLOT_H;

const xAt = (i, n) => PAD.l + (i * PLOT_W) / (n - 1);
const yAt = (score) => PAD.t + PLOT_H * (1 - score / 100);
const clampY = (y) => Math.max(PAD.t, Math.min(BOTTOM, y));

// Smooth curve through the points (Catmull-Rom → Bézier), kept inside the plot area
function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clampY(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clampY(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const shortDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const toneClass = (s) => (s >= 80 ? "text-signal-green" : s >= 60 ? "text-signal-amber" : "text-signal-red");

export default function ScoreChart({ trend }) {
  const n = trend.length;
  const [active, setActive] = useState(null);
  const groupRef = useRef(null);

  const model = useMemo(() => {
    if (n < 2) return null;
    const pts = trend.map((t, i) => [xAt(i, n), yAt(t.score)]);
    const line = smoothPath(pts);
    const area = `${line} L${pts[n - 1][0]},${BOTTOM} L${pts[0][0]},${BOTTOM} Z`;
    const scores = trend.map((t) => t.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / n);
    const step = Math.ceil(n / 5);
    const labelIdx = trend.map((_, i) => i).filter((i) => i % step === 0 || i === n - 1);
    return { pts, line, area, avg, best: Math.max(...scores), latest: scores[n - 1], delta: scores[n - 1] - scores[0], labelIdx };
  }, [trend, n]);

  // Entrance animation: the line draws itself, the fill fades in, the dots pop
  useIsoLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      g.style.opacity = 1;
      return;
    }
    const ctx = gsap.context(() => {
      const line = g.querySelector("[data-line]");
      const len = line.getTotalLength();
      gsap.set(g, { opacity: 1 });
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(g.querySelector("[data-area]"), { opacity: 0 });
      gsap.set(g.querySelectorAll("[data-dot]"), { opacity: 0 });
      gsap.timeline({ delay: 0.15 })
        .to(line, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" })
        .to(g.querySelector("[data-area]"), { opacity: 1, duration: 0.7 }, "-=0.7")
        .to(g.querySelectorAll("[data-dot]"), { opacity: 1, duration: 0.3, stagger: 0.05 }, "-=0.5");
    }, g);
    return () => ctx.revert();
  }, [model]);

  if (!model) {
    return (
      <div className="flex flex-col rounded-2xl border border-ink-line bg-ink-soft/40 p-6 lg:col-span-2">
        <h2 className="mb-8 font-medium">Score trend</h2>
        <p className="m-auto max-w-xs text-center text-sm text-slate-muted">
          Complete at least 2 interviews to see how your scores change over time.
        </p>
      </div>
    );
  }

  const a = active !== null ? trend[active] : null;
  const ax = active !== null ? model.pts[active][0] : 0;
  const ay = active !== null ? model.pts[active][1] : 0;
  const tipShift = ax / W < 0.14 ? "-12%" : ax / W > 0.86 ? "-88%" : "-50%";

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6 lg:col-span-2">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">Score trend</h2>
          <p className="mt-1 font-mono text-xs text-slate-muted">Your last {n} completed interviews</p>
        </div>
        <dl className="flex items-center gap-6 font-mono text-xs">
          <div><dt className="text-slate-muted">Latest</dt><dd className={`mt-0.5 text-lg ${toneClass(model.latest)}`}>{model.latest}</dd></div>
          <div><dt className="text-slate-muted">Best</dt><dd className="mt-0.5 text-lg text-paper">{model.best}</dd></div>
          <div><dt className="text-slate-muted">Average</dt><dd className="mt-0.5 text-lg text-paper">{model.avg}</dd></div>
          <div>
            <dt className="text-slate-muted">Change</dt>
            <dd className={`mt-0.5 text-lg ${model.delta >= 0 ? "text-signal-green" : "text-signal-amber"}`}>{model.delta >= 0 ? "▲" : "▼"} {Math.abs(model.delta)}</dd>
          </div>
        </dl>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
          aria-label={`Line chart of your last ${n} interview scores: ${trend.map((t) => t.score).join(", ")}`}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B5FEF" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#5B5FEF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* scale */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={PAD.l} y1={yAt(v)} x2={W - PAD.r} y2={yAt(v)} stroke="#2A2E40" strokeWidth="1" />
              <text x={PAD.l - 10} y={yAt(v) + 4} textAnchor="end" fontSize="11" fill="#9297AC" fontFamily="var(--font-mono), monospace">{v}</text>
            </g>
          ))}
          {model.labelIdx.map((i) => (
            <text key={i} x={model.pts[i][0]} y={H - 10} textAnchor="middle" fontSize="11" fill="#9297AC" fontFamily="var(--font-mono), monospace">{shortDate(trend[i].date)}</text>
          ))}

          {/* average reference line */}
          <line x1={PAD.l} y1={yAt(model.avg)} x2={W - PAD.r} y2={yAt(model.avg)} stroke="#FBBF24" strokeWidth="1" strokeDasharray="4 5" opacity="0.55" />
          <text x={W - PAD.r} y={yAt(model.avg) - 6} textAnchor="end" fontSize="10" fill="#FBBF24" opacity="0.8" fontFamily="var(--font-mono), monospace">avg {model.avg}</text>

          <g ref={groupRef} className="reveal">
            <path data-area d={model.area} fill="url(#scoreFill)" />
            <path data-line d={model.line} fill="none" stroke="#5B5FEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {active !== null && <line x1={ax} y1={PAD.t} x2={ax} y2={BOTTOM} stroke="#5B5FEF" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />}

            {model.pts.map(([x, y], i) => {
              const isLast = i === n - 1;
              const isActive = active === i;
              return (
                <g key={i}>
                  {isLast && <circle data-dot cx={x} cy={y} r="11" fill="#34D399" opacity="0.18" />}
                  <circle data-dot cx={x} cy={y} r={isActive ? 6 : isLast ? 5.5 : 4}
                    fill={isLast ? "#34D399" : "#14161F"} stroke={isLast ? "#34D399" : "#5B5FEF"} strokeWidth="2.5" />
                  <circle cx={x} cy={y} r="16" fill="transparent" tabIndex={0} style={{ cursor: "pointer", outline: "none" }}
                    aria-label={`${trend[i].label}: ${trend[i].score} out of 100 on ${shortDate(trend[i].date)}`}
                    onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)} onBlur={() => setActive(null)} />
                </g>
              );
            })}
          </g>
        </svg>

        {a && (
          <div role="status" className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-ink-line bg-ink px-3 py-2 text-xs shadow-xl"
            style={{ left: `${(ax / W) * 100}%`, top: `${(ay / H) * 100}%`, transform: `translate(${tipShift}, calc(-100% - 14px))` }}>
            <p className={`font-display text-xl leading-none ${toneClass(a.score)}`}>{a.score}<span className="font-body text-xs text-slate-muted">/100</span></p>
            <p className="mt-1.5 text-paper">{a.label}</p>
            <p className="font-mono text-slate-muted">{shortDate(a.date)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
