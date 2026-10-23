import Link from "next/link";
import Logo from "@/components/Logo";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#community", label: "Community" },
  { href: "#resources", label: "Resources" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-line/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-slate-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="focus-ring rounded transition-colors hover:text-paper">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="focus-ring hidden rounded px-2 py-2 text-sm text-slate-muted transition-colors hover:text-paper sm:inline-block">
            Log in
          </Link>
          <Link href="/auth" className="focus-ring rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
