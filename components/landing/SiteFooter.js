import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteFooter({ user }) {
  return (
    <footer className="border-t border-ink-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <Logo />
          <span className="ml-2 text-sm text-slate-muted">— University Web Technology Project</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-slate-muted">
          <a href="#how-it-works" className="focus-ring rounded transition-colors hover:text-paper">How it works</a>
          <a href="#features" className="focus-ring rounded transition-colors hover:text-paper">Features</a>
          <a href="#community" className="focus-ring rounded transition-colors hover:text-paper">Community</a>
          <Link href={user ? "/dashboard" : "/auth"} className="focus-ring rounded transition-colors hover:text-paper">{user ? "Dashboard" : "Log in"}</Link>
        </nav>
      </div>
    </footer>
  );
}
