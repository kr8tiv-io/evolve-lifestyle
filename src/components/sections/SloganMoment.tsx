"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";

/**
 * Full-bleed cinematic slogan break. Parallax landscape behind a single
 * oversized line, directionally graded with a neon floor glow.
 */
export default function SloganMoment({
  slogan = "The world goes soft.",
  emphasis = "We go outside.",
  note = "Cold and free beats warm and bored.",
  image = "/images/photo-1486870591958-9b9d0d1dda99.jpg",
  tone = ["#0c2c33", "#00ff41"] as [string, string],
}: {
  slogan?: string;
  emphasis?: string;
  note?: string;
  image?: string;
  tone?: [string, string];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["-16%", "16%"]);
  const y = useSpring(yRaw, { stiffness: 80, damping: 30, mass: 0.4 });

  return (
    <section
      ref={ref}
      data-section="Slogan"
      className="relative flex h-[92vh] items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-125">
        <ProductImage src={image} alt="" tone={tone} className="h-full w-full" priority />
      </motion.div>

      {/* directional cinematic grade — dark from the left + floor, clear top-right */}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,5,5,0.9)_0%,rgba(5,5,5,0.5)_42%,rgba(5,5,5,0.2)_72%,rgba(5,5,5,0.55)_100%)]" />
      {/* top + bottom void feathers so the section dissolves into its neighbours */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,transparent_22%,transparent_74%,#050505_100%)]" />
      {/* neon floor glow */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(60%_100%_at_50%_120%,rgba(0,255,65,0.16),transparent_70%)]" />
      <div className="vignette absolute inset-0" />

      <div className="relative z-10 px-6 text-center">
        <h2 className="text-[clamp(2.5rem,8vw,7.5rem)] font-medium uppercase leading-[0.88] tracking-tightest text-silver-bright">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {slogan}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="block font-bold text-neon text-glow-neon"
          >
            {emphasis}
          </motion.span>
        </h2>
        <p className="mt-7 font-mono text-[0.72rem] uppercase tracking-tracked-lg text-silver">
          {note}
        </p>
      </div>
    </section>
  );
}
