import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import PageTransition from "@/components/providers/PageTransition";
import Preloader from "@/components/providers/Preloader";
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
        <Preloader />
        <SmoothScroll>
          <Header />
          <CartDrawer />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
