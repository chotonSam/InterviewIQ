import Animate from "@/components/motion/Animate";
import { CheckCircleIcon, ChartIcon, ChatIcon, BookIcon } from "@/components/Icons";

const features = [
  { Icon: CheckCircleIcon, title: "AI evaluation", body: "Score, strengths, weaknesses, and a suggested better answer for every response." },
  { Icon: ChartIcon, title: "Progress dashboard", body: "Track past interviews, scores, and feedback so you can see yourself improve." },
  { Icon: ChatIcon, title: "Community", body: "Share your experience, ask questions, and comment on other candidates' posts." },
  { Icon: BookIcon, title: "Learning resources", body: "Curated videos and articles to fill the gaps your feedback points to." },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-green">What&apos;s inside</p>
        <h2 className="mb-16 max-w-lg font-display text-4xl">Everything around the interview, too.</h2>

        <Animate variant="stagger" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
