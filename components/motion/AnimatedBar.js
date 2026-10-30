"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// A progress bar fill that grows from the left
export default function AnimatedBar({ percent, className = "", delay = 0 }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = 1;
      return;
    }
    gsap.set(el, { opacity: 1 });
    const tween = gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.9, delay, ease: "power3.out" });
    return () => tween.kill();
  }, [delay]);

  return <div ref={ref} className={`reveal h-full origin-left rounded-full ${className}`} style={{ width: `${percent}%` }} />;
}
