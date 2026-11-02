import { pageOpenGraph } from "@/lib/seo";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts } from "@/lib/products";

const DESC =
  "Heavyweight hoodies, tees, flannels, caps and more — built for the bush, made for the long haul.";

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
    <Suspense fallback={<div className="h-screen bg-void" />}>
      <ShopClient />
    </Suspense>
    </>
  );
}
