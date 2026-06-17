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

export const metadata: Metadata = {
  title: {
    default: "EVOLVE — Prairies to Peaks | Western-Canadian Outdoor Lifestyle",
    template: "%s — EVOLVE",
  },
  description:
    "Western-Canadian outdoor lifestyle apparel. Descended from survivors, built for the bush, made for the long haul. Prairies to peaks, boreal to coast.",
  keywords: [
    "EVOLVE",
    "Canadian outdoor apparel",
    "Western Canada lifestyle brand",
    "hunting fishing apparel",
    "Alberta outdoor brand",
  ],
  openGraph: {
    title: "EVOLVE — Prairies to Peaks",
    description:
      "Western-Canadian outdoor lifestyle apparel. Earned outside.",
    type: "website",
    locale: "en_CA",
  },
  metadataBase: new URL("https://evolve-lifestyle.local"),
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
  return (
    <html lang="en-CA">
      <body className="grain vignette antialiased">
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
