"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductImage from "@/components/ui/ProductImage";

interface Plate {
  src: string;
  tone: [string, string];
  kicker: string;
  line: string;
}

const PLATES: Plate[] = [
  {
    src: "/images/photo-1418489098061-ce87b5dc3aee.jpg",
    tone: ["#0d3b1f", "#00ff41"],
    kicker: "The Cold",
    line: "Born of the coldest country on Earth.",
  },
  {
    src: "/images/photo-1464822759023-fed622ff2c3b.jpg",
    tone: ["#13233a", "#4ade80"],
    kicker: "The Wild",
    line: "Bears, caribou, and the rest of us.",
  },
  {
    src: "/images/photo-1500534623283-312aade485b7.jpg",
    tone: ["#3a2f12", "#39ff14"],
    kicker: "The Distance",
    line: "Where the signal dies, we come alive.",
  },
  {
    src: "/images/photo-1501785888041-af3ef285b470.jpg",
    tone: ["#0c2c33", "#00ff41"],
    kicker: "The Calling",
    line: "Some things should never change. Get outside.",
  },
];

/**
 * Pinned, scrubbed cross-fade gallery. The section pins while you scroll
 * through a sequence of boreal plates, each captioned — a GSAP ScrollTrigger
 * centerpiece. Falls back to a simple stacked scroll under reduced-motion.
 */
export default function PinnedGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>(".pg-plate");
      const caps = gsap.utils.toArray<HTMLElement>(".pg-cap");
      const idx = pin.querySelector<HTMLElement>(".pg-index");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=" + PLATES.length * 90 + "%",
          scrub: 0.6,
          pin: pin,
          anticipatePin: 1,
        },
      });

      plates.forEach((plate, i) => {
        if (i === 0) return;
        tl.fromTo(
          plate,
          { opacity: 0, scale: 1.16 },
          { opacity: 1, scale: 1, ease: "power1.inOut", duration: 1 },
          i
        );
        tl.fromTo(
          caps[i],
          { opacity: 0, yPercent: 40 },
          { opacity: 1, yPercent: 0, ease: "power2.out", duration: 0.6 },
          i + 0.1
        );
        tl.to(caps[i - 1], { opacity: 0, yPercent: -30, duration: 0.5 }, i);
        if (idx)
          tl.to(idx, { innerText: i + 1, snap: { innerText: 1 }, duration: 0.4 }, i - 0.5);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="The Wild"
      className="relative"
      style={{ height: `${(PLATES.length + 1) * 100}vh` }}
    >
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        {/* stacked plates */}
        {PLATES.map((p, i) => (
          <div
            key={i}
            className="pg-plate absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <ProductImage src={p.src} alt={p.kicker} tone={p.tone} className="h-full w-full" priority />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,rgba(5,5,5,0.35)_22%,rgba(5,5,5,0.3)_60%,#050505_100%)]" />
          </div>
        ))}

        {/* captions stacked, cross-faded by the timeline */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="relative h-[42vh] w-full max-w-5xl">
            {PLATES.map((p, i) => (
              <div
                key={i}
                className="pg-cap absolute inset-0 flex flex-col items-center justify-center"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <span className="eyebrow mb-5">{p.kicker}</span>
                <h2 className="text-[clamp(2.2rem,6vw,5.5rem)] font-medium uppercase leading-[0.92] tracking-tightest text-silver-bright">
                  {p.line}
                </h2>
              </div>
            ))}
          </div>
        </div>

        {/* pinned index */}
        <div className="absolute bottom-8 right-6 z-10 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim sm:right-12">
          <span className="tnum text-neon">
            / 0<span className="pg-index">1</span>
          </span>
          <span className="h-px w-8 bg-white/20" />
          <span className="tnum">0{PLATES.length}</span>
        </div>
      </div>
    </section>
  );
}
