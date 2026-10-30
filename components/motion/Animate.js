"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Reusable entrance animation.
 *   variant="up"      fade + slide up (the element itself)
 *   variant="left"    fade + slide in from the right
 *   variant="stagger" animates every descendant marked with data-reveal-item, one after another
 *   scroll            true = plays when scrolled into view, false = plays immediately on load
 * Users with "reduce motion" turned on see everything instantly (no animation).
 */
export default function Animate({
  as: Tag = "div",
  variant = "up",
  scroll = true,
  delay = 0,
  stagger = 0.1,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const targets = variant === "stagger" ? ref.current.querySelectorAll("[data-reveal-item]") : ref.current;
      const from = variant === "left" ? { opacity: 0, x: 40 } : { opacity: 0, y: 24 };

      gsap.fromTo(targets, from, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay,
        stagger: variant === "stagger" ? stagger : 0,
        clearProps: "transform",
        scrollTrigger: scroll ? { trigger: ref.current, start: "top 88%", once: true } : undefined,
      });
    }, ref);

    return () => ctx.revert();
  }, [variant, scroll, delay, stagger]);

  return (
    <Tag ref={ref} className={`${variant === "stagger" ? "" : "reveal"} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
