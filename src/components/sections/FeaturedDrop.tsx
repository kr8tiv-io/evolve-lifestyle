"use client";

import Link from "next/link";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import { getFeatured } from "@/lib/products";

export default function FeaturedDrop() {
  const featured = getFeatured();

  return (
    <section className="frame py-[12vh]">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-5">The First Drop</p>
          <RevealWords
            text="Built for the bush."
            className="block text-display-sm font-medium uppercase tracking-tightest text-silver-bright"
          />
          <RevealWords
            text="Made for the long haul."
            className="block text-display-sm font-medium uppercase tracking-tightest text-silver/40"
            delay={0.08}
          />
        </div>
        <Reveal delay={0.2}>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright"
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
