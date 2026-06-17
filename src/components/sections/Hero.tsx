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

// Misty boreal forest plate. Swap for a real footage loop later by dropping a
// <video> in place of this image layer — the compositing above it is unchanged.
const FOREST = "/images/photo-1441974231531-c6227db76b6e.jpg";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const plateScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.28]);

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
      {/* forest plate — slow Ken Burns drift through the scene */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ scale: plateScale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x: [0, -22, 0] }}
        transition={{
          opacity: { duration: 1.6 },
          x: { duration: 40, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FOREST})` }}
        />
        {/* grade the plate dark + cool so the aurora and chrome read */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.7),rgba(5,8,7,0.4)_40%,rgba(5,5,5,0.92))]" />
        <div className="absolute inset-0 bg-void/30 mix-blend-multiply" />
      </motion.div>

      {/* 3D fog + aurora + motes canvas */}
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0">
        <Hero3D />
      </motion.div>

      {/* corner anchors */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
        <div className="frame flex h-full items-start justify-between pt-[110px]">
          <span className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-tracked text-silver-dim/80">
            Est. Alberta
            <br />
            N53° · Boreal Void
          </span>
          <span className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-tracked text-silver-dim/80 text-right">
            Drop 001
            <br />
            Prairies → Coast
          </span>
        </div>
        <span className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[0.56rem] uppercase tracking-tracked-lg text-silver-dim/60 [transform-origin:right]">
          Prairies — Peaks — Boreal — Coast
        </span>
      </div>

      {/* Centerpiece — the trademark emblem */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="eyebrow mb-7"
        >
          Western-Canadian Outdoor Lifestyle
        </motion.p>

        <motion.img
          src="/brand/evolve-emblem-chrome.png"
          alt="EVOLVE — trees and summit emblem"
          width={2668}
          height={1105}
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
            filter: { duration: 1.3 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.3 },
          }}
          className="w-[min(880px,86vw)] select-none drop-shadow-[0_24px_70px_rgba(0,255,65,0.22)]"
          draggable={false}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="-mt-2 flex flex-col items-center"
        >
          <h1 className="text-[clamp(1.6rem,4.4vw,3.2rem)] font-bold uppercase tracking-[0.22em] text-silver-bright [font-feature-settings:'cpsp'_1]">
            EVOLVE
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-silver">
            Prairies to peaks, boreal to coast —{" "}
            <span className="lime-underline text-silver-bright">
              apparel earned outside.
            </span>
          </p>

          <div className="mt-8 flex gap-3">
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
          </div>
        </motion.div>
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
