"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Wraps an SVG line chart: the line draws itself, then the dots fade in
export default function ChartAnimator({ children }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const g = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      g.style.opacity = 1;
      return;
    }

    const ctx = gsap.context(() => {
      const line = g.querySelector("polyline");
      const dots = g.querySelectorAll("circle");
      const length = line.getTotalLength();

      gsap.set(g, { opacity: 1 });
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(dots, { opacity: 0 });

      gsap.timeline({ delay: 0.2 })
        .to(line, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .to(dots, { opacity: 1, duration: 0.3, stagger: 0.06 }, "-=0.4");
    }, g);

    return () => ctx.revert();
  }, []);

  return <g ref={ref} className="reveal">{children}</g>;
}
