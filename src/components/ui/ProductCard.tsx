"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import { COLLECTION_LABELS, SCENES, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <motion.div
      className="reveal-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/shop/${product.slug}`}
        data-cursor="magnetic"
        className="group block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border border-white/[0.06] transition-all duration-500 ease-evolve group-hover:border-neon/30 group-hover:shadow-[0_24px_60px_-24px_rgba(0,255,65,0.35)]">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            tone={product.tone}
            label={product.subtitle}
            fit="contain"
            scene={SCENES[product.collection]}
            className="h-full w-full"
            imgClassName="group-hover:scale-[1.05] transition-transform duration-[1200ms]"
            priority
          />
          {/* hover second image crossfade */}
          {product.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-evolve group-hover:opacity-100">
              <ProductImage
                src={product.images[1]}
                alt={`${product.name} alternate`}
                tone={product.tone}
                fit="contain"
                className="h-full w-full"
              />
            </div>
          )}

          {/* bottom scrim for legibility of the hover meta */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void/70 to-transparent" />

          {product.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full border border-neon/40 bg-void/70 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-tracked text-neon backdrop-blur">
              {product.badge}
            </span>
          )}

          {/* in-image meta on hover */}
          <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between">
            <span className="translate-y-3 font-mono text-[0.56rem] uppercase tracking-tracked text-silver-bright/90 opacity-0 transition-all duration-500 ease-evolve group-hover:translate-y-0 group-hover:opacity-100">
              {product.subtitle}
            </span>
            <span className="flex h-9 w-9 translate-y-3 items-center justify-center rounded-full bg-neon text-black opacity-0 transition-all duration-500 ease-evolve group-hover:translate-y-0 group-hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft">
              {COLLECTION_LABELS[product.collection]}
            </p>
            <h3 className="mt-1.5 text-base font-medium uppercase leading-tight tracking-tight text-silver-bright transition-colors duration-300 group-hover:text-neon">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="tnum text-base text-silver-bright">{formatPrice(product.price)}</p>
            {product.compareAt && (
              <p className="tnum font-mono text-[0.6rem] text-silver-dim line-through">
                {formatPrice(product.compareAt)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
