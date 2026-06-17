"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import { COLLECTION_LABELS, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            tone={product.tone}
            label={product.subtitle}
            className="h-full w-full"
            imgClassName="group-hover:scale-[1.06]"
          />
          {/* hover second image */}
          {product.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-evolve group-hover:opacity-100">
              <ProductImage
                src={product.images[1]}
                alt={`${product.name} alternate`}
                tone={product.tone}
                className="h-full w-full"
              />
            </div>
          )}
          {product.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full border border-neon/40 bg-void/70 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-tracked text-neon backdrop-blur">
              {product.badge}
            </span>
          )}
          <div className="absolute inset-x-3 bottom-3 z-10 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-500 ease-evolve group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-full bg-neon px-4 py-2 font-mono text-[0.6rem] uppercase tracking-tracked text-black">
              View →
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">
              {COLLECTION_LABELS[product.collection]}
            </p>
            <h3 className="mt-1 text-base font-medium uppercase tracking-tight text-silver-bright">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-base text-silver-bright">{formatPrice(product.price)}</p>
            {product.compareAt && (
              <p className="font-mono text-[0.62rem] text-silver-dim line-through">
                {formatPrice(product.compareAt)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
