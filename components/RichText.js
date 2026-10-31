// Renders **bold**, `inline code`, "- " lists, paragraphs and ``` code blocks. Plain React elements only (no raw HTML).

function inline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={`${keyPrefix}${i}`} className="font-semibold text-paper">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={`${keyPrefix}${i}`} className="rounded bg-ink px-1.5 py-0.5 font-mono text-[0.85em] text-paper">{part.slice(1, -1)}</code>;
    return part;
  });
}

function TextBlock({ text, id }) {
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, pi) => {
      const lines = para.split("\n");
      const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
      if (isList) {
        return (
          <ul key={`${id}-${pi}`} className="list-disc space-y-1 pl-5">
            {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${id}-${pi}-${li}-`)}</li>)}
          </ul>
        );
      }
      return <p key={`${id}-${pi}`} className="whitespace-pre-line">{inline(para, `${id}-${pi}-`)}</p>;
    });
}

export default function RichText({ text, className = "" }) {
  // split() with a capture group alternates: text, code, text, code …
  const parts = String(text ?? "").split(/```[\w-]*\n?([\s\S]*?)```/g);
  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-xl border border-ink-line bg-ink p-4 font-mono text-sm leading-relaxed text-paper/90">{part.trim()}</pre>
        ) : (
          <TextBlock key={i} text={part} id={i} />
        )
      )}
    </div>
  );
}
