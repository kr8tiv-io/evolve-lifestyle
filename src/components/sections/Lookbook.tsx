"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";
import { RevealWords } from "@/components/ui/Reveal";

const SHOTS: { src: string; tone: [string, string]; caption: string }[] = [
  { src: "/images/photo-1454496522488-7a8e488e8606.jpg", tone: ["#13233a", "#4ade80"], caption: "Peaks / 02" },
  { src: "/images/photo-1441974231531-c6227db76b6e.jpg", tone: ["#0d3b1f", "#00ff41"], caption: "Boreal / 04" },
  { src: "/images/photo-1500534623283-312aade485b7.jpg", tone: ["#3a2f12", "#39ff14"], caption: "Prairies / 01" },
  { src: "/images/photo-1465056836041-7f43ac27dcb5.jpg", tone: ["#0c2c33", "#00ff41"], caption: "Coast / 03" },
  { src: "/images/photo-1483728642387-6c3bdd6c93e5.jpg", tone: ["#13233a", "#4ade80"], caption: "Peaks / 05" },
];

/** Horizontal scroll-driven lookbook strip. */
export default function Lookbook() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section ref={ref} data-section="Lookbook" className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="frame mb-12 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-4">The Lookbook</p>
            <RevealWords
              text="Earned outside."
              className="block text-display-sm font-medium uppercase tracking-tightest text-silver-bright"
            />
          </div>
          <span className="hidden font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim md:block">
            Scroll →
          </span>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-5 sm:pl-8 lg:pl-12">
          {SHOTS.map((shot, i) => (
            <figure
              key={i}
              className={`relative shrink-0 overflow-hidden ${
                i % 2 === 0 ? "h-[60vh] w-[78vw] sm:w-[44vw]" : "h-[52vh] w-[70vw] self-end sm:w-[36vw]"
              }`}
            >
              <ProductImage src={shot.src} alt={shot.caption} tone={shot.tone} className="h-full w-full" />
              <figcaption className="absolute bottom-4 left-4 font-mono text-[0.62rem] uppercase tracking-tracked text-silver-bright">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
