import InterviewSetup from "@/components/interview/InterviewSetup";
import { ensureCategories } from "@/lib/categories";
import { getProgressSummary } from "@/lib/progress";
import { getSessionUserId } from "@/lib/session";

export const metadata = { title: "New Mock Interview — InterviewIQ" };

export default async function NewInterviewPage() {
  const userId = await getSessionUserId();
  const [categories, progress] = await Promise.all([ensureCategories(), getProgressSummary(userId)]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">Set up your session</p>
            <h1 className="mt-1 font-display text-2xl leading-none">New mock interview</h1>
          </div>
        </div>
      </header>
      <InterviewSetup categories={categories} progress={progress} />
    </>
  );
}
