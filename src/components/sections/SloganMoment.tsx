"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";

/**
 * Full-bleed cinematic slogan break. Parallax landscape behind a single
 * oversized line, with a quiet supporting note.
 */
export default function SloganMoment({
  slogan = "The world goes soft.",
  emphasis = "We go outside.",
  note = "Cold and free beats warm and bored.",
  image = "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1900&q=80",
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
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      ref={ref}
      className="relative flex h-[90vh] items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-125">
        <ProductImage
          src={image}
          alt=""
          tone={tone}
          className="h-full w-full"
        />
      </motion.div>
      <div className="absolute inset-0 bg-void/60" />
      <div className="vignette absolute inset-0" />

      <div className="relative z-10 px-6 text-center">
        <h2 className="text-[clamp(2.5rem,8vw,7rem)] font-medium uppercase leading-[0.9] tracking-tightest text-silver-bright">
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
            className="block text-neon"
          >
            {emphasis}
          </motion.span>
        </h2>
        <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-tracked-lg text-silver">
          {note}
        </p>
      </div>
    </section>
  );
}
