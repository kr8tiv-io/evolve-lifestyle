import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getArticles } from "@/lib/journal";

export const dynamic = "force-static";

const BASE = "https://evolveapparel.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/shop/", priority: 0.9 },
    { path: "/about/", priority: 0.7 },
    { path: "/journal/", priority: 0.6 },
    { path: "/terms/", priority: 0.4 },
    { path: "/privacy/", priority: 0.4 },
  ];

  const products = getProducts().map((p) => ({
    url: `${BASE}/shop/${p.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const articles = getArticles().map((a) => ({
    url: `${BASE}/journal/${a.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((r) => ({
      url: BASE + r.path,
      changeFrequency: "weekly" as const,
      priority: r.priority,
    })),
    ...products,
    ...articles,
  ];
}
