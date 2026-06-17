"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import ProductImage from "@/components/ui/ProductImage";

interface Pillar {
  no: string;
  title: string;
  lead: string;
  body: string;
  image: string;
  tone: [string, string];
}

const PILLARS: Pillar[] = [
  {
    no: "01",
    title: "Descended from Survivors",
    lead: "The hardest people built the coldest country.",
    body: "Before the highways and the heated cabs, there were people who crossed this land on foot, wintered where the temperature forgets mercy, and woke up the next morning to do it again. That blood is still here. EVOLVE is a quiet salute to them — to grit that doesn't brag, to pride earned in weather that would send most people indoors.",
    image:
      "/images/photo-1518837695005-2083093ee35b.jpg",
    tone: ["#0d3b1f", "#00ff41"],
  },
  {
    no: "02",
    title: "One of the Largest Lands on Earth",
    lead: "This is the backyard. All of it.",
    body: "Prairies that run flat to the curve of the planet. Mountains that don't care about your schedule. Boreal forest, then a coast that takes the weather first. The wildlife was here before us — bears, caribou, elk, trout — and getting outside isn't a hobby here, it's an identity. Some things should never change. This is one of them.",
    image:
      "/images/photo-1464822759023-fed622ff2c3b.jpg",
    tone: ["#13233a", "#4ade80"],
  },
  {
    no: "03",
    title: "Work Hard, Play Hard",
    lead: "Strip it back. Build it stronger.",
    body: "EVOLVE started in the trades — abrasive blasting, restoring what the years wore down to something better than new. The lifestyle is the same instinct pointed outward: blue-collar grit and big-country freedom. Polite until the work gets hard. We restore what the week wore down, and then we go earn the weekend.",
    image:
      "/images/photo-1551632811-561732d1e306.jpg",
    tone: ["#3a1c14", "#39ff14"],
  },
];

export default function BrandPillars() {
  return (
    <section className="py-[10vh]">
      <div className="frame mb-20">
        <p className="eyebrow mb-5">What We're Made Of</p>
        <RevealWords
          text="Three stories. One country."
          className="block text-display-sm font-medium uppercase tracking-tightest text-silver-bright"
        />
      </div>
      <div className="flex flex-col gap-2">
        {PILLARS.map((pillar, i) => (
          <PillarPanel key={pillar.no} pillar={pillar} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function PillarPanel({ pillar, flip }: { pillar: Pillar; flip: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <div
      ref={ref}
      className={`frame grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16 ${
        flip ? "md:[direction:rtl]" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden [direction:ltr] md:aspect-[5/6]">
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          <ProductImage
            src={pillar.image}
            alt={pillar.title}
            tone={pillar.tone}
            label={pillar.lead}
            className="h-full w-full"
          />
        </motion.div>
        <span className="absolute left-5 top-5 font-mono text-[0.7rem] uppercase tracking-tracked text-neon">
          / {pillar.no}
        </span>
      </div>

      <motion.div style={{ y }} className="[direction:ltr]">
        <p className="font-mono text-[0.7rem] uppercase tracking-tracked text-neon-soft">
          Chapter {pillar.no}
        </p>
        <h3 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-medium uppercase leading-[0.95] tracking-tightest text-silver-bright">
          {pillar.title}
        </h3>
        <p className="mt-5 text-xl text-neon-soft">{pillar.lead}</p>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-silver-dim">
            {pillar.body}
          </p>
        </Reveal>
      </motion.div>
    </div>
  );
}
