"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Magnetic from "@/components/ui/Magnetic";
import ForestAudio from "@/components/ui/ForestAudio";
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
      className="hero-shell relative w-full overflow-hidden bg-void"
    >
      {/* forest-fog footage — the exact treatment from evolveecoblasting.com */}
      <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-[1]">
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
        {/* gentle, even grade — only enough to seat the headline, no dark wall */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,5,5,0.42)_0%,rgba(5,7,6,0.16)_44%,rgba(5,5,5,0.06)_72%,rgba(5,5,5,0.2)_100%)]" />
        {/* dissolve into the next section — kept low so the aurora reaches the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-void via-void/35 to-transparent" />
      </motion.div>

      {/* mouse-reactive aurora + motes — a "cool element", sits BEHIND the lines */}
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0 z-[2]">
        <Hero3D />
      </motion.div>

      {/* contrast tint — ABOVE the borealis (z-2), BELOW the line texture (z-4),
          so the lines stay crisp and the green/motion show straight through. A
          soft even dark wash, a touch stronger right behind the headline + logo
          and fading at the edges, just enough to lift legibility on BOTH
          breakpoints without dimming the aurora. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(125% 100% at 50% 47%, rgba(0,0,0,0.19) 0%, rgba(0,0,0,0.13) 60%, rgba(0,0,0,0.11) 100%)",
        }}
      />

      {/* fine dark scanlines — the exact .sd-hero::after treatment, ABOVE the
          effects so everything reads through them; only logo + text sit on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)",
        }}
      />
      {/* faint film grain locked to the hero, matching the original's texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Content — two columns, mirroring the blasting site. z-10: ON TOP of lines */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full items-start pt-[calc(var(--header-h)+2.75rem)] pb-6 sm:items-center sm:pt-[var(--header-h)] sm:pb-12 lg:pb-10"
      >
        <div className="frame grid w-full items-center gap-5 sm:gap-12 lg:grid-cols-2 lg:gap-10 2xl:gap-16">
          {/* LEFT — headline block, pulled toward centre to balance the logo */}
          <div className="relative order-2 text-center lg:order-1 lg:pl-[7%] lg:text-left xl:pl-[10%]">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="eyebrow-rule mb-4 justify-center text-silver-bright sm:mb-7 lg:justify-start"
            >
              Western-Canadian Outdoor Lifestyle
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="glow-headline font-medium uppercase text-silver-bright"
              style={{
                // min lowered for mobile so the title fits in 2 lines (≥743px still
                // uses the 5.6vw value, so desktop is unchanged)
                fontSize: "clamp(2rem, 5.6vw, 5.9rem)",
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
              className="hero-subtitle mx-auto mt-3 max-w-xl font-normal uppercase text-silver-bright text-[0.8rem] leading-[1.45] tracking-[0.05em] sm:mt-6 sm:text-[1.05rem] sm:leading-[1.6] sm:tracking-[0.16em] lg:mx-0"
            >
              Apparel earned outside — built for the bush, made for the long haul.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 1 }}
              className="mt-4 flex items-center justify-center gap-4 sm:mt-6 lg:mt-9 lg:justify-start"
            >
              <Magnetic strength={0.3}>
                <Link href="/shop" className="btn-solid">
                  Shop the Range
                  <span aria-hidden>→</span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link href="/about" className="btn-ghost">
                  Our story
                </Link>
              </Magnetic>
            </motion.div>
          </div>

          {/* RIGHT — the trademark lockup, centred in its column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 flex flex-col items-center justify-center gap-2 sm:gap-3 lg:order-2 lg:gap-3"
          >
            <Link
              href="/"
              aria-label="EVOLVE home"
              data-cursor="magnetic"
              className="lockup relative block w-[clamp(116px,38vw,600px)]"
            >
              {/* the exact reference lockup shape, filled with the alloy chrome
                  gradient so it matches the silver/white headline */}
              <div
                role="img"
                aria-label="EVOLVE"
                className="w-full"
                style={{
                  aspectRatio: "1600 / 1357",
                  WebkitMaskImage: "url(/brand/evolve-lockup-xl.png)",
                  maskImage: "url(/brand/evolve-lockup-xl.png)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  background:
                    "linear-gradient(155deg, #ffffff 0%, #e8ebee 38%, #c9ced4 52%, #aeb4ba 60%, #f1f3f5 100%)",
                }}
              />
            </Link>

            {/* forest-ambience player — sits just under the logo on mobile + desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.9 }}
            >
              <ForestAudio />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue — desktop only; on mobile the hero is content-dense and it
          just crowded the buttons, so it's hidden there */}
      <motion.button
        style={{ opacity }}
        onClick={jumpDown}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 sm:flex"
      >
        <span className="font-mono text-[0.58rem] uppercase tracking-tracked-lg text-silver-dim">
          Scroll
        </span>
        <span className="relative block h-9 w-px overflow-hidden bg-white/15">
          <motion.span
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 block h-4 bg-gradient-to-b from-transparent via-neon to-transparent"
          />
        </span>
      </motion.button>
    </section>
  );
}
