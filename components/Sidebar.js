"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { avatarUrl } from "@/lib/avatar";

export const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview", label: "Mock interview" },
  { href: "/chat", label: "Practice chat" },
  { href: "/history", label: "Interview history" },
  { href: "/community", label: "Community" },
  { href: "/resources", label: "Learning resources" },
  { href: "/notifications", label: "Notifications", badge: true },
  { href: "/profile", label: "Profile" },
];

export default function Sidebar({ user, unread }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start border-r border-ink-line bg-ink-soft/40 lg:flex">
      <Logo className="h-16 shrink-0 border-b border-ink-line px-6" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 text-sm" aria-label="Main">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              <span className="flex-1">{item.label}</span>
              {item.badge && unread > 0 && (
                <span className="rounded-full bg-signal-red px-2 py-0.5 font-mono text-[11px] font-medium leading-none text-white" aria-label={`${unread} unread`}>
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-ink-line px-4 py-5">
        <Link href="/profile" className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-ink-line/40">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl(user.image, 64)} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo/30 text-xs font-medium">{user.name.slice(0, 1).toUpperCase()}</div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate font-mono text-xs text-slate-muted">{user.username}</p>
          </div>
        </Link>
        <button type="button" onClick={logout}
          className="focus-ring mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-muted transition-colors hover:bg-ink-line/40 hover:text-paper">
          Log out
        </button>
      </div>
    </aside>
  );
}
