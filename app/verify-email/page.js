import Logo from "@/components/Logo";
import VerifyEmail from "@/components/auth/VerifyEmail";

export const metadata = { title: "Verify your email — InterviewIQ", robots: { index: false } };

export default function VerifyEmailPage({ searchParams }) {
  const token = typeof searchParams?.token === "string" ? searchParams.token : "";
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-line/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-10"><Logo /></div>
      </header>
      <main className="px-6 py-16 lg:py-24">
        <VerifyEmail token={token} />
      </main>
    </div>
  );
}
