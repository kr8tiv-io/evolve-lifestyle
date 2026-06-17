"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Parallax } from "@/components/ui/Gsap";
import ProductImage from "@/components/ui/ProductImage";

const LINE =
  "Some things should never change. The cold. The quiet. The work that asks everything of you and gives it back twice. We don't tame the wild — we belong to it.";

/**
 * Word-by-word scroll-scrub manifesto. Words light and de-blur from dim to
 * bright as you scroll through. Accent words tilt to italic and emit neon.
 */
export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.2"],
  });
  const words = LINE.split(" ");

  return (
    <section
      ref={ref}
      data-section="Manifesto"
      className="glow-aurora relative overflow-hidden py-[var(--section-y)]"
    >
      {/* faint boreal plate behind the words — parallaxed, blends into void */}
      <Parallax speed={0.22} className="pointer-events-none absolute inset-0 -z-0 opacity-[0.16]">
        <div className="absolute inset-0 scale-125">
          <ProductImage
            src="/images/photo-1483728642387-6c3bdd6c93e5.jpg"
            alt=""
            tone={["#13233a", "#4ade80"]}
            className="h-full w-full"
          />
        </div>
      </Parallax>
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[linear-gradient(180deg,#050505,transparent_30%,transparent_70%,#050505)]" />
      <span className="ghost-folio absolute -top-6 right-4 hidden md:block">00</span>
      <div className="frame-read relative">
        <p className="eyebrow mb-10">The Manifesto</p>
        <p className="max-w-5xl text-[clamp(1.9rem,5.2vw,4.2rem)] font-medium leading-[1.06] tracking-tightest">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1.5 / words.length;
            return (
              <Word
                key={i}
                word={word}
                range={[start, Math.min(1, end)]}
                progress={scrollYProgress}
              />
            );
          })}
        </p>
      </div>
    </section>
  );
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  const blur = useTransform(progress, range, ["blur(6px)", "blur(0px)"]);
  const y = useTransform(progress, range, [8, 0]);
  const isAccent = ["wild", "belong"].includes(word.replace(/[.,]/g, ""));
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span
        style={{ opacity, filter: blur, y }}
        className={
          isAccent
            ? "text-glow-neon font-light italic text-neon"
            : "text-silver-bright"
        }
      >
        {word}
      </motion.span>
    </span>
  );
}
