import ResourcesBoard from "@/components/resources/ResourcesBoard";

export const metadata = { title: "Learning Resources — InterviewIQ" };

export default function ResourcesPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">Videos and articles to close your gaps</p>
            <h1 className="mt-1 font-display text-2xl leading-none">Learning resources</h1>
          </div>
        </div>
      </header>
      <ResourcesBoard />
    </>
  );
}
