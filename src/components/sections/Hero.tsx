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
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.14]);

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
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,5,5,0.86)_0%,rgba(5,7,6,0.55)_45%,rgba(5,5,5,0.32)_78%,rgba(5,5,5,0.7)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-void to-transparent" />
      </motion.div>

      {/* fine line texture over the footage (matches the original) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.7] mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* mouse-reactive aurora, concentrated behind the logo */}
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0 z-[3]">
        <Hero3D />
      </motion.div>

      {/* Content — two columns, mirroring the blasting site */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full items-center"
      >
        <div className="frame grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* LEFT — headline block */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="eyebrow-rule mb-7 justify-center text-silver-bright lg:justify-start"
            >
              Western-Canadian Outdoor Lifestyle
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="glow-headline font-medium uppercase text-silver-bright"
              style={{
                fontSize: "clamp(2.6rem, 5.6vw, 5.9rem)",
                lineHeight: 0.94,
                letterSpacing: "-0.02em",
              }}
            >
              Prairies to peaks,
              <br />
              boreal to coast.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mx-auto mt-6 max-w-xl font-light uppercase text-silver/85 lg:mx-0"
              style={{
                fontSize: "1.05rem",
                letterSpacing: "0.16em",
                lineHeight: 1.6,
                textShadow: "0 2px 18px rgba(5,5,5,0.7)",
              }}
            >
              Apparel earned outside — built for the bush, made for the long haul.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 1 }}
              className="mt-9 flex items-center justify-center gap-4 lg:justify-start"
            >
              <Magnetic strength={0.3}>
                <Link href="/shop" className="btn-solid">
                  Shop the range
                  <span aria-hidden>↓</span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link href="/about" className="btn-ghost">
                  Our story
                </Link>
              </Magnetic>
            </motion.div>
          </div>

          {/* RIGHT — the trademark lockup, aurora behind it */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 flex items-center justify-center lg:order-2 lg:justify-end"
          >
            {/* aurora bloom behind the mark (the pseudo-element glow) */}
            <div
              aria-hidden
              className="pointer-events-none absolute aspect-square w-[105%] max-w-[640px] rounded-full bg-[radial-gradient(circle,rgba(0,255,65,0.2),transparent_60%)] blur-2xl"
            />
            <Link
              href="/"
              aria-label="EVOLVE home"
              data-cursor="magnetic"
              className="lockup relative block w-[min(540px,82vw)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/evolve-lockup-xl.png"
                alt="EVOLVE"
                width={1600}
                height={1357}
                className="w-full select-none"
                draggable={false}
              />
            </Link>
          </motion.div>
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
