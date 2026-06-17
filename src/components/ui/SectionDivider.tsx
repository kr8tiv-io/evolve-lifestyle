"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * A hairline that resolves into a faint neon mountain-ridge — the boreal
 * motif used as connective tissue between sections. Draws itself on scroll.
 */
export default function SectionDivider({ label }: { label?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <div ref={ref} className="frame py-2">
      <div className="flex items-center gap-6">
        {label && (
          <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim">
            {label}
          </span>
        )}
        <svg
          viewBox="0 0 1200 24"
          className="h-5 w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M0 23 L240 23 L300 9 L360 23 L520 23 L600 4 L680 23 L900 23 L960 12 L1020 23 L1200 23"
            fill="none"
            stroke="url(#ridge)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(74,222,128,0)" />
              <stop offset="50%" stopColor="rgba(0,255,65,0.7)" />
              <stop offset="100%" stopColor="rgba(74,222,128,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
