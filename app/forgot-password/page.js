import Link from "next/link";
import Logo from "@/components/Logo";
import ForgotPassword from "@/components/auth/ForgotPassword";

export const metadata = { title: "Forgot password — InterviewIQ", robots: { index: false } };

export default function Page() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-line/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Logo />
          <Link href="/auth" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">← Back to log in</Link>
        </div>
      </header>
      <main className="px-6 py-12 lg:py-20">
        <ForgotPassword />
      </main>
    </div>
  );
}
