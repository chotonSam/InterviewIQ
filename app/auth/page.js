import Link from "next/link";
import Logo from "@/components/Logo";
import AuthTabs from "@/components/auth/AuthTabs";
import AuthSidePanel from "@/components/auth/AuthSidePanel";

export const metadata = {
  title: "Log in or create an account — InterviewIQ",
};

export default function AuthPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-line/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Logo />
          <Link href="/" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-start gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <AuthTabs />
        <AuthSidePanel />
      </main>
    </div>
  );
}
