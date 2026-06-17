"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Magnetic from "@/components/ui/Magnetic";
import { getLenis } from "@/components/providers/SmoothScroll";

const Hero3D = dynamic(() => import("@/components/three/Hero3D"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-void" />,
});

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const word = "EVOLVE".split("");

  const jumpDown = () => {
    const lenis = getLenis();
    const target = window.innerHeight * 0.98;
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      data-section="Hero"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      <motion.div style={{ scale }} className="absolute inset-0">
        <Hero3D />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void" />

      {/* corner anchors */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
        <div className="frame flex h-full flex-col justify-between py-[120px]">
          <div className="flex justify-end">
            <span className="font-mono text-[0.6rem] uppercase leading-relaxed tracking-tracked text-silver-dim">
              Est. Alberta<br />N53° · Boreal Void
            </span>
          </div>
        </div>
        <span className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[0.58rem] uppercase tracking-tracked-lg text-silver-dim/70 [transform-origin:right]">
          Prairies — Peaks — Boreal — Coast
        </span>
      </div>

      {/* Overlay copy */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full flex-col justify-end pb-[12vh]"
      >
        <div className="frame">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="eyebrow mb-6"
          >
            Western-Canadian Outdoor Lifestyle
          </motion.p>

          <h1 className="flex select-none text-display-lg font-bold leading-[0.82] text-silver-bright [font-feature-settings:'cpsp'_1]">
            {word.map((letter, i) => (
              <span key={i} className="overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.07,
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="mt-8 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="max-w-md text-lg leading-relaxed text-silver"
            >
              Prairies to peaks, boreal to coast. Apparel for the people who
              built this country in its coldest seasons —{" "}
              <span className="lime-underline text-silver-bright">
                and never came inside.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 1 }}
              className="flex gap-3"
            >
              <Magnetic strength={0.3}>
                <Link href="/shop" className="btn-neon">
                  Shop the range
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link href="/about" className="btn-ghost">
                  Our story
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.button
        style={{ opacity }}
        onClick={jumpDown}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.6rem] uppercase tracking-tracked-lg text-silver-dim">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="block h-8 w-px bg-gradient-to-b from-neon to-transparent"
        />
      </motion.button>
    </section>
  );
}
