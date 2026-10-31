import Animate from "@/components/motion/Animate";
import { CheckCircleIcon, ChartIcon, ChatIcon, LockIcon, UsersIcon, GlobeIcon } from "@/components/Icons";

const features = [
  { Icon: CheckCircleIcon, title: "Scored on every answer", body: "A score, what you did well, what to fix, and the ideal answer — for each question." },
  { Icon: LockIcon, title: "Levels that unlock", body: "Easy → Medium → Hard, tracked per field. Finish one level to open the next." },
  { Icon: ChatIcon, title: "Practice chat", body: "Talk to an AI coach: ask for a hint, a full explanation, or harder questions. No scores, no pressure." },
  { Icon: GlobeIcon, title: "Any field", body: "Not just software. Type any field — marketing, nursing, accounting — and get questions for it." },
  { Icon: ChartIcon, title: "Progress dashboard", body: "Your score trend, strongest fields, practice streak, and what to do next." },
  { Icon: UsersIcon, title: "Community & resources", body: "Share experiences, comment, and learn from rated videos and articles." },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">What&apos;s inside</p>
        <h2 className="mb-16 max-w-lg font-display text-4xl">Everything around the interview, too.</h2>

        <Animate variant="stagger" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, body }) => (
            <div key={title} data-reveal-item className="rounded-2xl border border-ink-line p-6 transition-colors hover:border-indigo/60">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo/15 text-indigo">
                <Icon />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-muted">{body}</p>
            </div>
          ))}
        </Animate>
      </div>
    </section>
  );
}
