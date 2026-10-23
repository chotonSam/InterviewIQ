import Link from "next/link";

export default function Logo({ href = "/", className = "" }) {
  return (
    <Link href={href} className={`focus-ring flex items-center gap-2 rounded ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo">
        <span className="h-2 w-2 rounded-full bg-signal-green" />
      </span>
      <span className="text-lg font-semibold tracking-tight">InterviewIQ</span>
    </Link>
  );
}
