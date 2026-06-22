import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import PageTransition from "@/components/providers/PageTransition";
import Preloader from "@/components/providers/Preloader";
import CustomCursor from "@/components/providers/CustomCursor";
import ScrollHUD from "@/components/providers/ScrollHUD";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CartHydrator from "@/components/cart/CartHydrator";

export const metadata: Metadata = {
  metadataBase: new URL("https://evolveapparel.shop"),
  title: {
    default: "EVOLVE Apparel — Prairies to Peaks | Western-Canadian Outdoor Lifestyle",
    template: "%s — EVOLVE Apparel",
  },
  description:
    "EVOLVE — Western-Canadian outdoor lifestyle apparel. Embroidered hoodies, tees and caps, made to order and shipped across Canada. The apparel arm of Evolve Eco Blasting.",
  applicationName: "EVOLVE Apparel",
  keywords: [
    "EVOLVE apparel",
    "Canadian outdoor apparel",
    "Western Canada lifestyle brand",
    "embroidered hoodies Canada",
    "Alberta apparel brand",
    "hunting fishing apparel",
    "made in Canada outdoor clothing",
    "Evolve Eco Blasting",
  ],
  alternates: { canonical: "/" },
  authors: [{ name: "EVOLVE" }],
  creator: "EVOLVE",
  openGraph: {
    title: "EVOLVE Apparel — Prairies to Peaks",
    description:
      "Western-Canadian outdoor lifestyle apparel. Made to order, shipped across Canada & North America. Earned outside.",
    url: "https://evolveapparel.shop",
    siteName: "EVOLVE Apparel",
    type: "website",
    locale: "en_CA",
    images: [{ url: "/video/hero-forest-poster.jpg", width: 1280, height: 720, alt: "EVOLVE — Western-Canadian outdoor lifestyle apparel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EVOLVE Apparel — Prairies to Peaks",
    description: "Western-Canadian outdoor lifestyle apparel. Earned outside.",
    images: ["/video/hero-forest-poster.jpg"],
  },
  robots: { index: true, follow: true },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EVOLVE Apparel",
    alternateName: "EVOLVE",
    url: "https://evolveapparel.shop",
    logo: "https://evolveapparel.shop/brand/evolve-lockup-white.png",
    description:
      "Western-Canadian outdoor lifestyle apparel. The apparel arm of Evolve Eco Blasting.",
    areaServed: "CA",
    // associate the apparel brand with the parent service company for SEO
    parentOrganization: {
      "@type": "Organization",
      name: "Evolve Eco Blasting",
      url: "https://www.evolveecoblasting.com",
    },
    sameAs: ["https://www.evolveecoblasting.com"],
  };
  return (
    <html lang="en-CA">
      <body className="grain vignette antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-neon focus:px-5 focus:py-2 focus:font-mono focus:text-[0.7rem] focus:uppercase focus:tracking-tracked focus:text-black"
        >
          Skip to content
        </a>
        <Preloader />
        <CustomCursor />
        <ScrollHUD />
        <SmoothScroll>
          <Header />
          <CartHydrator />
          <CartDrawer />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
