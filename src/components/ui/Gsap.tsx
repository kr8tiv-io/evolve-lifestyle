"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * GSAP word-split reveal driven by ScrollTrigger — words rise from a clipped
 * baseline as the element enters. Pairs with the Framer reveals for variety.
 */
export function SplitReveal({
  text,
  className,
  stagger = 0.045,
  start = "top 86%",
}: {
  text: string;
  className?: string;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const words = el.querySelectorAll("[data-w]");
    const ctx = gsap.context(() => {
      gsap.from(words, {
        yPercent: 120,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start },
      });
    }, el);
    return () => ctx.revert();
  }, [stagger, start]);

  const words = text.split(" ");
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-w className="inline-block">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Scrub parallax — translates its content against scroll. `speed` is the
 * fraction of its own height it drifts across the viewport pass.
 */
export function Parallax({
  children,
  speed = 0.18,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: speed * 100 },
        {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
