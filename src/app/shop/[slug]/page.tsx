import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/products";
import ProductView from "./ProductView";

const SITE = "https://evolveapparel.shop";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: "Not found" };
  const url = `${SITE}/shop/${product.slug}/`;
  const img = product.images?.[0]
    ? (product.images[0].startsWith("http") ? product.images[0] : SITE + product.images[0])
    : `${SITE}/video/hero-forest-poster.jpg`;
  const desc = (product.description || product.tagline || product.subtitle || "").slice(0, 160);
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} — EVOLVE Apparel`,
      description: desc,
      url,
      type: "website",
      siteName: "EVOLVE Apparel",
      locale: "en_CA",
      images: [{ url: img, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — EVOLVE Apparel`,
      description: desc,
      images: [img],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const url = `${SITE}/shop/${product.slug}/`;
  const img = product.images?.[0]
    ? (product.images[0].startsWith("http") ? product.images[0] : SITE + product.images[0])
    : `${SITE}/video/hero-forest-poster.jpg`;
  const inStock = product.variants?.some((v) => v.inStock) ?? true;
  const priceCad = (product.price / 100).toFixed(2);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.tagline,
    image: (product.images || []).map((i) => (i.startsWith("http") ? i : SITE + i)),
    sku: product.variants?.[0]?.sku || product.slug,
    brand: { "@type": "Brand", name: "EVOLVE Apparel" },
    category: product.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "CAD",
      price: priceCad,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "EVOLVE Apparel" },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: SITE + "/shop/" },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };

  const related = getProducts()
    .filter((p) => p.slug !== product.slug && p.collection === product.collection)
    .slice(0, 4);
  const fallbackRelated = getProducts()
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductView
        product={product}
        related={related.length >= 2 ? related : fallbackRelated}
      />
    </>
  );
}
