"use client";

// Topic filter: "All topics", the built-in topics, then the busiest topics people typed themselves.
// The rest go in a "More topics" menu. The selected topic always keeps its chip, even when it has no results.
export default function TopicChips({ presets, counts, selected, onSelect, maxCustom = 8, label = "Filter by topic" }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const custom = Object.keys(counts)
    .filter((t) => !presets.includes(t))
    .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const shown = custom.slice(0, maxCustom);
  if (selected && !presets.includes(selected) && !shown.includes(selected)) shown.push(selected);
  const more = custom.filter((t) => !shown.includes(t));

  const chip = (active) =>
    `focus-ring shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
      active ? "border-indigo bg-indigo text-white" : "border-ink-line text-slate-muted hover:border-indigo/60 hover:text-paper"}`;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label={label}>
      <button type="button" aria-pressed={selected === ""} onClick={() => onSelect("")} className={chip(selected === "")}>
        All topics <span className="ml-1 font-mono text-xs opacity-70">{total}</span>
      </button>
      {[...presets, ...shown].map((t) => (
        <button key={t} type="button" aria-pressed={selected === t} onClick={() => onSelect(selected === t ? "" : t)}
          className={`${chip(selected === t)} ${selected !== t && !(counts[t] > 0) ? "opacity-50" : ""}`}>
          {t} <span className="ml-1 font-mono text-xs opacity-70">{counts[t] ?? 0}</span>
        </button>
      ))}
      {more.length > 0 && (
        <select aria-label="More topics" value="" onChange={(e) => e.target.value && onSelect(e.target.value)}
          className="focus-ring shrink-0 rounded-full border border-ink-line bg-transparent px-3 py-1.5 text-sm text-slate-muted hover:border-indigo/60">
          <option value="">More topics ({more.length})…</option>
          {more.map((t) => <option key={t} value={t}>{t} ({counts[t]})</option>)}
        </select>
      )}
    </div>
  );
}
