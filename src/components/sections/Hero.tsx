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
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);

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
      className="relative h-[100svh] w-full overflow-hidden bg-void"
    >
      {/* forest-fog footage — the exact treatment from evolveecoblasting.com */}
      <motion.div style={{ scale: videoScale }} className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/video/hero-forest-poster.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/video/hero-forest.webm" type="video/webm" />
        </video>
        {/* cinematic grade so the chrome + aurora read */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.72),rgba(5,8,7,0.35)_42%,rgba(5,5,5,0.94))]" />
        <div className="absolute inset-0 bg-void/25 mix-blend-multiply" />
      </motion.div>

      {/* fine line texture over the footage (matches the original) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* top-centre green borealis glow, like the original's radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(70%_50%_at_50%_-8%,rgba(0,255,65,0.16),transparent_58%)]"
      />

      {/* mouse-reactive aurora + motes */}
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0 z-[3]">
        <Hero3D />
      </motion.div>

      {/* corner anchors */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
        <div className="frame flex h-full items-start justify-between pt-[110px]">
          <span className="font-mono text-[0.56rem] uppercase leading-relaxed tracking-tracked text-silver-dim/75">
            Est. Alberta
            <br />
            N53° · Boreal Void
          </span>
          <span className="text-right font-mono text-[0.56rem] uppercase leading-relaxed tracking-tracked text-silver-dim/75">
            Drop 001
            <br />
            Prairies → Coast
          </span>
        </div>
        <span className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[0.54rem] uppercase tracking-tracked-lg text-silver-dim/55 [transform-origin:right]">
          Prairies — Peaks — Boreal — Coast
        </span>
      </div>

      {/* Centerpiece — restrained, proportional emblem lockup */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.1 }}
          className="eyebrow mb-8"
        >
          Western-Canadian Outdoor Lifestyle
        </motion.p>

        {/* emblem + wordmark = one confident lockup */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <img
            src="/brand/evolve-emblem-chrome.png"
            alt="EVOLVE — trees and summit emblem"
            width={2668}
            height={1105}
            className="w-[min(420px,62vw)] select-none drop-shadow-[0_18px_50px_rgba(0,255,65,0.18)]"
            draggable={false}
          />
          <img
            src="/brand/evolve-wordmark-chrome.png"
            alt="EVOLVE"
            width={3144}
            height={501}
            className="mt-5 w-[min(300px,54vw)] select-none"
            draggable={false}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 1 }}
          className="mt-7 max-w-md text-base leading-relaxed text-silver"
        >
          Prairies to peaks, boreal to coast —{" "}
          <span className="lime-underline text-silver-bright">apparel earned outside.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-8 flex gap-3"
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
