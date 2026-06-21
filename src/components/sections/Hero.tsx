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
        className="relative z-10 flex h-full items-center pt-[var(--header-h)] pb-10"
      >
        <div className="frame grid w-full items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-10 2xl:gap-16">
          {/* LEFT — headline block, pulled toward centre to balance the logo */}
          <div className="relative order-2 text-center lg:order-1 lg:pl-[7%] lg:text-left xl:pl-[10%]">
            {/* mobile-only legibility scrim — soft dark blur behind the text so the
                splash letters read against the bright aurora (desktop: none) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-4 -z-10 rounded-3xl bg-void/35 backdrop-blur-[3px] [mask-image:radial-gradient(120%_120%_at_50%_50%,#000_55%,transparent_100%)] lg:hidden"
            />
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

          {/* RIGHT — the trademark lockup, centred in its column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 flex items-center justify-center lg:order-2"
          >
            <Link
              href="/"
              aria-label="EVOLVE home"
              data-cursor="magnetic"
              className="lockup relative block w-[clamp(260px,38vw,600px)]"
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
