"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { RevealWords } from "@/components/ui/Reveal";
import { getArticles } from "@/lib/journal";

/**
 * "From the journal" — a horizontal scroll-snap carousel of the latest articles.
 * Native overflow-x scrolling so ALL cards are reachable on every viewport (the
 * old scroll-driven pan under-travelled on mobile and hid half the strip). Mouse
 * drag-to-scroll adds a premium feel on desktop where there's no visible bar.
 */
export default function Lookbook() {
  const articles = getArticles();
  const trackRef = useRef<HTMLDivElement>(null);

  // drag-to-scroll (mouse only — touch uses native momentum scrolling)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove("cursor-grabbing");
    };
    // swallow the click that ends a drag so it doesn't navigate
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section data-section="Lookbook" className="relative overflow-hidden py-24 sm:py-32">
      <div className="frame mb-10 flex items-end justify-between">
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
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:cursor-grab sm:gap-6 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/journal/${a.slug}`}
            className="group relative block w-[82vw] shrink-0 snap-start overflow-hidden rounded-[3px] sm:w-[48vw] lg:w-[32vw] xl:w-[30vw]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
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
        <span aria-hidden className="block w-1 shrink-0 sm:w-3" />
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
