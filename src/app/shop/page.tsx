import { pageOpenGraph } from "@/lib/seo";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts } from "@/lib/products";
import Link from "next/link";

const DESC =
  "Heavyweight hoodies, tees, flannels, caps and more. Made to order and shipped across Canada and North America. Built for the bush, made for the long haul.";

export const metadata = {
  title: "Shop the Range",
  description: DESC,
  alternates: { canonical: "/shop" },
  openGraph: pageOpenGraph("Shop the Range", DESC, "/shop/"),
};

export default function ShopPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://evolveapparel.shop/shop/#webpage",
    url: "https://evolveapparel.shop/shop/",
    name: "Shop EVOLVE Apparel",
    isPartOf: { "@id": "https://evolveapparel.shop/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: getProducts().map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://evolveapparel.shop/shop/${p.slug}/`,
        name: p.name,
      })),
    },
  };
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    <div className="pt-[var(--header-h)]">
      <section className="frame pb-12 pt-20">
        <p className="eyebrow mb-5">The Range</p>
        <h1 className="block text-display font-medium uppercase tracking-tightest text-silver-bright">
          Shop everything.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-silver-dim">
          Heavyweight hoodies, tees, caps, and a few things for the trail.
          Every piece is embroidered or printed to order, in sizes S through 2XL
          unless the page says otherwise, then shipped across Canada and North
          America. Prices are in CAD, with GST calculated at checkout. All sales
          are final, except manufacturing defects, which we remake or exchange
          if you reach us within 14 days of delivery.{" "}
          <Link href="/terms" className="link-underline text-silver-bright hover:text-neon">
            Terms and Returns
          </Link>
          {" "}has the full policy.
        </p>
      </section>
      <Suspense fallback={<div className="min-h-[50vh] bg-void" />}>
        <ShopClient />
      </Suspense>
    </div>
    </>
  );
}
