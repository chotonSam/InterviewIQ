import Logo from "@/components/Logo";

export default function SiteFooter() {
  return (
    <footer id="resources" className="border-t border-ink-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center lg:px-10">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="ml-2 text-sm text-slate-muted">— University Web Technology Project</span>
        </div>
        <div className="flex gap-8 font-mono text-sm text-slate-muted">
          <a href="#how-it-works" className="focus-ring rounded transition-colors hover:text-paper">How it works</a>
          <a href="#features" className="focus-ring rounded transition-colors hover:text-paper">Features</a>
          <a href="#community" className="focus-ring rounded transition-colors hover:text-paper">Community</a>
        </div>
      </div>
    </footer>
  );
}
