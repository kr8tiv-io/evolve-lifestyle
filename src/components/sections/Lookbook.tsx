"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductImage from "@/components/ui/ProductImage";
import { RevealWords } from "@/components/ui/Reveal";
import { getArticles } from "@/lib/journal";

/**
 * "From the journal" — the latest articles.
 * MOBILE/TABLET (<lg): a native horizontal scroll-snap carousel (swipe).
 * DESKTOP (>=lg): a GSAP-pinned section — it pins CENTRED in the viewport and the
 * card strip scrubs horizontally as you scroll, entering and exiting cleanly. Cards
 * are sized by viewport HEIGHT so they're always fully visible (no vertical cut) at
 * any width/aspect, including ultrawide.
 */
export default function Lookbook() {
  const articles = getArticles();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // DESKTOP — pin + horizontal scrub, vertically centred.
    mm.add("(min-width: 1024px)", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      track.removeAttribute("data-lenis-prevent");
      gsap.set(track, { x: 0 });

      const travel = () => Math.max(0, track.scrollWidth - track.clientWidth);

      // Cards all fit (ultrawide) → no scroll needed, just centre them.
      if (travel() <= 0) {
        track.style.justifyContent = "center";
        return () => {
          track.style.justifyContent = "";
        };
      }

      const tween = gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + travel(),
          scrub: 0.6,
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
        track.style.justifyContent = "";
      };
    });

    // MOBILE/TABLET — native swipe; let Lenis ignore the horizontal track.
    mm.add("(max-width: 1023px)", () => {
      track.setAttribute("data-lenis-prevent", "");
      return () => track.removeAttribute("data-lenis-prevent");
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="Lookbook"
      className="relative overflow-hidden py-24 lg:overflow-visible lg:py-0"
    >
      <div ref={pinRef} className="lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="frame mb-10 flex items-end justify-between lg:mb-8">
          <div>
            <p className="eyebrow mb-4">From the journal</p>
            <RevealWords
              text="Get outside."
              className="block text-display-sm font-medium uppercase tracking-tightest text-silver-bright"
            />
          </div>
          <Link
            href="/journal"
            className="hidden font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim transition-colors hover:text-neon md:inline-block"
          >
            All articles →
          </Link>
        </div>

        <div
          ref={trackRef}
          data-lenis-prevent
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:snap-none sm:gap-6 sm:scroll-px-8 sm:px-8 lg:gap-8 lg:overflow-x-visible lg:px-12 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/journal/${a.slug}`}
              className="group relative block w-[82vw] shrink-0 snap-start overflow-hidden rounded-[3px] sm:w-[48vw] lg:h-[64vh] lg:w-[48vh]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-auto lg:h-full">
                <ProductImage
                  src={a.hero}
                  alt={a.title}
                  tone={a.tone}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-[1.2s] ease-evolve group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/50 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-tracked text-neon-soft backdrop-blur">
                  {a.category}
                </span>
                <div className="pointer-events-none absolute inset-x-5 bottom-5">
                  <p className="font-mono text-[0.55rem] uppercase tracking-tracked text-neon-soft">
                    {a.readMinutes} min read
                  </p>
                  <h3 className="mt-2 line-clamp-3 text-xl font-medium uppercase leading-[1.12] tracking-tight text-silver-bright sm:text-[1.35rem]">
                    {a.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.82rem] leading-relaxed text-silver/75">{a.dek}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-tracked text-neon">
                    Read
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* trailing spacer so the last card clears the right edge */}
          <span aria-hidden className="block w-1 shrink-0 sm:w-3 lg:w-10" />
        </div>
      </div>

      <div className="frame mt-8 md:hidden">
        <Link
          href="/journal"
          className="inline-flex font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim transition-colors hover:text-neon"
        >
          All articles →
        </Link>
      </div>
    </section>
  );
}
