"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/ui/ProductCard";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/utils";
import { COLLECTION_LABELS, type Product } from "@/lib/products";
import { useCart } from "@/store/cart";

export default function ProductView({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const colors = useMemo(() => {
    const seen = new Map<string, string>();
    product.variants.forEach((v) => {
      if (!seen.has(v.color)) seen.set(v.color, v.swatch);
    });
    return Array.from(seen.entries()).map(([color, swatch]) => ({ color, swatch }));
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(colors[0]?.color ?? "");
  const [size, setSize] = useState<string>(product.sizes[0] ?? "OS");
  const [added, setAdded] = useState(false);

  const add = useCart((s) => s.add);

  const variant = product.variants.find(
    (v) => v.color === color && v.size === size
  );
  const inStock = variant?.inStock ?? true;

  const handleAdd = () => {
    if (!inStock) return;
    add({
      id: `${product.slug}-${color}-${size}`.toLowerCase().replace(/\s+/g, "-"),
      slug: product.slug,
      name: product.name,
      variantId: variant?.id ?? "",
      size,
      color,
      swatch: colors.find((c) => c.color === color)?.swatch ?? "#000",
      price: product.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pt-[var(--header-h)]">
      {/* breadcrumb */}
      <div className="frame py-6">
        <nav className="font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim">
          <Link href="/shop" className="hover:text-neon">
            Shop
          </Link>{" "}
          / <span className="text-silver">{product.name}</span>
        </nav>
      </div>

      <div className="frame grid gap-10 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <ProductImage
              src={product.images[activeImg]}
              alt={product.name}
              tone={product.tone}
              label={product.subtitle}
              className="h-full w-full"
              priority
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full border border-neon/40 bg-void/70 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-tracked text-neon backdrop-blur">
                {product.badge}
              </span>
            )}
          </motion.div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative aspect-square w-20 overflow-hidden border transition-colors ${
                  activeImg === i ? "border-neon" : "border-white/10 hover:border-white/30"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <ProductImage src={img} alt="" tone={product.tone} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
            {COLLECTION_LABELS[product.collection]} — {product.subtitle}
          </p>
          <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-medium uppercase leading-[0.95] tracking-tightest text-silver-bright">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-neon-soft">{product.tagline}</p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-2xl text-silver-bright">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="font-mono text-sm text-silver-dim line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            <span className="font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim">
              CAD · GST at checkout
            </span>
          </div>

          <p className="mt-6 max-w-md text-base leading-relaxed text-silver-dim">
            {product.description}
          </p>

          {/* Color */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-silver">
                Colour
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-silver-bright">
                {color}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setColor(c.color)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    color === c.color ? "border-neon scale-110" : "border-white/20 hover:border-white/50"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                  aria-label={c.color}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-silver">
                Size
              </span>
              <button className="font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim underline-offset-4 hover:text-neon hover:underline">
                Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const v = product.variants.find((vt) => vt.color === color && vt.size === s);
                const disabled = v ? !v.inStock : false;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    disabled={disabled}
                    className={`min-w-12 border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-tracked transition-all ${
                      size === s
                        ? "border-neon bg-neon text-black"
                        : disabled
                        ? "cursor-not-allowed border-white/5 text-silver-dim/40 line-through"
                        : "border-white/15 text-silver-bright hover:border-white/40"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-9">
            <Magnetic strength={0.15} className="block w-full">
              <button
                onClick={handleAdd}
                disabled={!inStock}
                className={`w-full rounded-full px-8 py-4 font-mono text-[0.72rem] uppercase tracking-tracked transition-all duration-500 ease-evolve ${
                  !inStock
                    ? "cursor-not-allowed bg-void-700 text-silver-dim"
                    : added
                    ? "bg-neon-soft text-black"
                    : "bg-neon text-black hover:bg-neon-soft"
                }`}
              >
                {!inStock ? "Sold out — back soon" : added ? "Added to your kit ✓" : "Add to kit"}
              </button>
            </Magnetic>
            <p className="mt-3 text-center font-mono text-[0.58rem] uppercase tracking-tracked text-silver-dim">
              Drop-ship ready · ships across Canada & North America
            </p>
          </div>

          {/* Details */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
              The Make
            </span>
            <ul className="mt-4 space-y-2">
              {product.details.map((d, i) => (
                <li key={i} className="flex gap-3 text-sm text-silver-dim">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-neon" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="frame border-t border-white/10 py-20">
          <Reveal>
            <p className="eyebrow mb-8">More from the range</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
