import Link from "next/link";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import { avatarUrl } from "@/lib/avatar";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#community", label: "Community" },
];

export default function SiteHeader({ user }) {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-line/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm text-slate-muted md:flex" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="focus-ring rounded transition-colors hover:text-paper">{l.label}</a>
          ))}
        </nav>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">Dashboard</Link>
            <Link href="/profile" className="focus-ring flex items-center gap-2 rounded-full border border-ink-line py-1 pl-1 pr-3 text-sm transition-colors hover:border-indigo/60" aria-label="My profile">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl(user.image, 64)} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo/30 text-xs font-medium">{user.name.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="hidden max-w-[8rem] truncate sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth" className="focus-ring rounded px-2 py-2 text-sm text-slate-muted transition-colors hover:text-paper">Log in</Link>
            <Link href="/auth" className="focus-ring rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white">Start free</Link>
          </div>
        )}
      </div>
    </header>
  );
}
