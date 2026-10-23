// Dashed-underline highlight used for AI annotations on a user's answer
export default function Annot({ tone = "green", children }) {
  const color = tone === "green" ? "text-signal-green" : "text-signal-amber";
  return <span className={`annot-underline ${color}`}>{children}</span>;
}
