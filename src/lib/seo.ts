// Shared Open Graph defaults so per-page openGraph keeps the site image/locale.
export const SITE = "https://evolveapparel.shop";
export function pageOpenGraph(title: string, description: string, path: string) {
  return {
    title: `${title} — EVOLVE Apparel`,
    description,
    url: `${SITE}${path}`,
    siteName: "EVOLVE Apparel",
    type: "website" as const,
    locale: "en_CA",
    images: [{ url: "/video/hero-forest-poster.jpg", width: 1280, height: 720, alt: "EVOLVE — Western-Canadian outdoor lifestyle apparel" }],
  };
}
