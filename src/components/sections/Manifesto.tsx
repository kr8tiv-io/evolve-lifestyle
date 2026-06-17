"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const LINE =
  "Some things should never change. The cold. The quiet. The work that asks everything of you and gives it back twice. We don't tame the wild — we belong to it.";

/**
 * Word-by-word scroll-scrub manifesto. Words light from silver-dim to
 * silver-bright as you scroll through the section. The signature
 * agency move.
 */
export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });
  const words = LINE.split(" ");

  return (
    <section ref={ref} className="frame py-[18vh]">
      <p className="eyebrow mb-10">The Manifesto</p>
      <p className="max-w-5xl text-[clamp(1.8rem,5vw,4rem)] font-medium leading-[1.08] tracking-tightest">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return <Word key={i} word={word} range={[start, end]} progress={scrollYProgress} />;
        })}
      </p>
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
  const opacity = useTransform(progress, range, [0.18, 1]);
  const isAccent = ["wild", "belong"].includes(word.replace(/[.,]/g, ""));
  return (
    <span className="relative mr-[0.25em] inline-block">
      <span className="absolute opacity-15">{word}</span>
      <motion.span style={{ opacity }} className={isAccent ? "text-neon" : "text-silver-bright"}>
        {word}
      </motion.span>
    </span>
  );
}
