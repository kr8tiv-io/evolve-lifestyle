import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/products";
import ProductView from "./ProductView";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = getProducts()
    .filter((p) => p.slug !== product.slug && p.collection === product.collection)
    .slice(0, 4);
  const fallbackRelated = getProducts()
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <ProductView
      product={product}
      related={related.length >= 2 ? related : fallbackRelated}
    />
  );
}
