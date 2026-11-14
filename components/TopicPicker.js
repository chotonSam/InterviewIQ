"use client";

import { useEffect, useState } from "react";
import { MAX_TAG, closestTopic } from "@/lib/topics";

const OTHER = "__other__";

// A topic dropdown with an "Other…" choice that lets the person type their own topic.
// `value` is the final topic text ("" while "Other" is chosen but nothing is typed yet).
export default function TopicPicker({ id, value, onChange, presets, suggestions = [], label = "Topic" }) {
  const isPreset = (v) => presets.includes(v);
  const [other, setOther] = useState(() => value !== "" && !isPreset(value));
  const [custom, setCustom] = useState(() => (isPreset(value) ? "" : value));

  // when the form is reset to a built-in topic (after posting), close the typing box
  useEffect(() => {
    if (isPreset(value) && other) {
      setOther(false);
      setCustom("");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  function onSelect(e) {
    if (e.target.value === OTHER) {
      setOther(true);
      onChange(custom);
    } else {
      setOther(false);
      onChange(e.target.value);
    }
  }

  const listId = `${id}-suggestions`;
  const extra = suggestions.filter((s) => !isPreset(s));

  // a likely typo of a topic that already exists? offer the existing one
  const near = other ? closestTopic(custom, [...presets, ...extra]) : null;

  function useExisting(topic) {
    if (isPreset(topic)) {
      setOther(false); // it's a built-in topic: go back to the dropdown
      setCustom("");
    } else {
      setCustom(topic);
    }
    onChange(topic);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      <select id={id} value={other ? OTHER : value} onChange={onSelect} className="field focus-ring">
        {presets.map((t) => <option key={t} value={t}>{t}</option>)}
        <option value={OTHER}>Other… (type your own)</option>
      </select>

      {other && (
        <div className="mt-2">
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); onChange(e.target.value); }}
            maxLength={MAX_TAG}
            list={extra.length ? listId : undefined}
            placeholder="e.g. Data Science, Career change…"
            aria-label="Your own topic"
            autoFocus
            className="field focus-ring"
          />
          {near && (
            <p role="status" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-signal-amber/10 px-3 py-2 text-xs">
              <span>Did you mean <span className="font-medium text-signal-amber">{near}</span>?</span>
              <button type="button" onClick={() => useExisting(near)}
                className="focus-ring rounded-full border border-signal-amber/50 px-3 py-1 text-signal-amber transition-colors hover:bg-signal-amber/15">
                Use &ldquo;{near}&rdquo;
              </button>
              <span className="text-slate-muted">or keep what you typed.</span>
            </p>
          )}
          {extra.length > 0 && (
            <datalist id={listId}>{extra.map((s) => <option key={s} value={s} />)}</datalist>
          )}
          <p className="mt-1.5 font-mono text-xs text-slate-muted">
            {custom.trim() ? `${custom.length}/${MAX_TAG}` : "Type a topic (2–30 characters). Existing topics are suggested as you type."}
          </p>
        </div>
      )}
    </div>
  );
}
