"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview", label: "Mock interview" },
  { href: "#", label: "Interview history" },
  { href: "#", label: "Community" },
  { href: "#", label: "Learning resources" },
  { href: "#", label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-line bg-ink-soft/40 lg:flex">
      <Logo className="h-16 border-b border-ink-line px-6" />

      <nav className="flex-1 space-y-1 px-4 py-6 text-sm">
        {nav.map((item) => {
          const active = item.href !== "#" && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                active ? "bg-indigo/15 font-medium text-paper" : "text-slate-muted hover:bg-ink-line/40 hover:text-paper"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-indigo transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-line px-4 py-5">
        <a href="#" className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-line/40">
          <div className="h-8 w-8 shrink-0 rounded-full bg-indigo/30" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Ayesha Rahman</p>
            <p className="truncate font-mono text-xs text-slate-muted">ayesha_r</p>
          </div>
        </a>
      </div>
    </aside>
  );
}
