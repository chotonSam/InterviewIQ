"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Counts a number up from 0 (used for the AI score)
export default function CountUp({ value, duration = 1.1 }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const state = { n: 0 };
    ref.current.textContent = "0";
    const tween = gsap.to(state, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = String(Math.round(state.n));
      },
    });
    return () => tween.kill();
  }, [value, duration]);

  return <span ref={ref}>{value}</span>;
}
