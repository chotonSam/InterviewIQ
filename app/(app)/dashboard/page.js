import Link from "next/link";
import StatCards from "@/components/dashboard/StatCards";
import ScoreTrend from "@/components/dashboard/ScoreTrend";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import RecentInterviews from "@/components/dashboard/RecentInterviews";
import RecommendedResources from "@/components/dashboard/RecommendedResources";
import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard";

export const metadata = { title: "Dashboard — InterviewIQ" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.id);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">{today}</p>
            <h1 className="mt-1 font-display text-2xl leading-none">Welcome back, {user.name.split(" ")[0]}</h1>
          </div>
          <Link href="/interview" className="btn-primary px-5 py-2.5 text-sm">
            Start a mock interview <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <main className="space-y-10 px-6 py-10 lg:px-10">
        <StatCards stats={data.stats} />
        <section className="grid gap-6 lg:grid-cols-3">
          <ScoreTrend scores={data.trend} />
          <CategoryBreakdown items={data.categoryScores} />
        </section>
        <RecentInterviews items={data.recent} />
        <RecommendedResources />
      </main>
    </>
  );
}
