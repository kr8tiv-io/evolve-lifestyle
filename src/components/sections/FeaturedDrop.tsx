"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SplitReveal } from "@/components/ui/Gsap";
import ProductCard from "@/components/ui/ProductCard";
import { getFeatured } from "@/lib/products";

export default function FeaturedDrop() {
  const featured = getFeatured();

  return (
    <section
      data-section="The Drop"
      className="glow-aurora frame py-[var(--section-y)]"
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-5">The First Drop</p>
          <SplitReveal
            text="Built for the bush."
            className="text-display-sm font-bold uppercase tracking-tightest text-silver-bright"
          />
          <br />
          <SplitReveal
            text="Made for the long haul."
            className="text-display-sm font-light italic tracking-tight text-silver/70"
          />
        </div>
        <Reveal delay={0.2}>
          <Link
            href="/shop"
            data-cursor="magnetic"
            className="link-underline group inline-flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright"
          >
            View all
            <span className="transition-transform duration-500 ease-evolve group-hover:translate-x-2">
              →
            </span>
          </Link>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
        {featured.map((product, i) => (
          <ProductCard key={product.slug} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
