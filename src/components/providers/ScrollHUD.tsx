"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Scroll instrument. A neon progress rail across the top, plus a live
 * slash-number section index in the corner — the site feels measured and
 * deliberate. Section names come from [data-section] markers in the page.
 */
export default function ScrollHUD() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const [sections, setSections] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]")
    );
    setSections(els.map((e) => e.dataset.section || ""));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* progress rail */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left bg-neon"
        style={{ scaleX, boxShadow: "0 0 12px rgba(0,255,65,0.6)" }}
        aria-hidden
      />

      {/* section index */}
      {sections.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 left-5 z-[110] hidden items-center gap-3 font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim sm:left-8 md:flex lg:left-12">
          <span className="tnum text-neon">
            / {String(active + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-8 bg-white/20" />
          <span className="text-silver">{sections[active]}</span>
          <span className="text-silver-dim/50">
            ({String(sections.length).padStart(2, "0")})
          </span>
        </div>
      )}
    </>
  );
}
