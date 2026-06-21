"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { RevealWords } from "@/components/ui/Reveal";
import {
  CATEGORY_LABELS,
  COLLECTION_LABELS,
  getProducts,
  type Category,
  type Collection,
} from "@/lib/products";
import { cn } from "@/lib/utils";

const CATEGORIES: (Category | "all")[] = [
  "all",
  "outerwear",
  "tops",
  "headwear",
  "accessories",
];
const COLLECTIONS: (Collection | "all")[] = [
  "all",
  "prairies",
  "peaks",
  "boreal",
  "coast",
];

export default function ShopClient() {
  const params = useSearchParams();
  const initialCat = (params.get("category") as Category) || "all";
  const [category, setCategory] = useState<Category | "all">(initialCat);
  const [collection, setCollection] = useState<Collection | "all">("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const products = useMemo(() => {
    let list = getProducts().filter((p) => {
      const okCat = category === "all" || p.category === category;
      const okCol = collection === "all" || p.collection === collection;
      return okCat && okCol;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, collection, sort]);

  return (
    <div className="pt-[var(--header-h)]">
      {/* Header band */}
      <section className="frame pb-12 pt-20">
        <p className="eyebrow mb-5">The Range</p>
        <RevealWords
          text="Shop everything."
          className="block text-display font-medium uppercase tracking-tightest text-silver-bright"
        />
        <p className="mt-6 max-w-md text-base text-silver-dim">
          Made to order — each piece embroidered or printed once you place it,
          then shipped across Canada and North America.
        </p>
      </section>

      {/* Filters */}
      <section className="sticky top-[var(--header-h)] z-30 border-y border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="frame flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={c === "all" ? "All" : CATEGORY_LABELS[c]}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {COLLECTIONS.map((c) => (
              <FilterChip
                key={c}
                active={collection === c}
                onClick={() => setCollection(c)}
                label={c === "all" ? "All Land" : COLLECTION_LABELS[c]}
                accent
              />
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="ml-2 cursor-pointer rounded-full border border-white/15 bg-transparent px-4 py-2 font-mono text-[0.65rem] uppercase tracking-tracked text-silver-bright outline-none"
            >
              <option className="bg-void" value="featured">Featured</option>
              <option className="bg-void" value="low">Price ↑</option>
              <option className="bg-void" value="high">Price ↓</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="frame py-16">
        <p className="mb-10 font-mono text-[0.65rem] uppercase tracking-tracked text-silver-dim">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        {products.length === 0 ? (
          <p className="py-24 text-center text-silver-dim">
            Nothing in this corner of the country yet.
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-tracked transition-all duration-300",
        active
          ? accent
            ? "border-neon bg-neon text-black"
            : "border-silver-bright bg-silver-bright text-black"
          : "border-white/15 text-silver-dim hover:border-white/40 hover:text-silver-bright"
      )}
    >
      {label}
    </button>
  );
}
