import Link from "next/link";
import Animate from "@/components/motion/Animate";

export default function CtaBand({ user }) {
  return (
    <section className="border-t border-ink-line">
      <Animate className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <h2 className="mx-auto mb-8 max-w-2xl font-display text-4xl sm:text-5xl">
          {user
            ? "Your next level is waiting."
            : "Your next interview doesn't have to be the first time you've answered these questions."}
        </h2>
        <Link href={user ? "/interview" : "/auth"} className="btn-primary px-7 py-4">
          {user ? "Continue practicing" : "Start your first mock interview"} <span aria-hidden="true">→</span>
        </Link>
      </Animate>
    </section>
  );
}
