import Animate from "@/components/motion/Animate";
import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="border-t border-ink-line">
      <Animate className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <h2 className="mx-auto mb-8 max-w-2xl font-display text-4xl sm:text-5xl">
          Your next interview doesn&apos;t have to be the first time you&apos;ve answered these questions.
        </h2>
        <Link href="/auth" className="btn-primary px-7 py-4">
          Start your first mock interview <span aria-hidden="true">→</span>
        </Link>
      </Animate>
    </section>
  );
}
