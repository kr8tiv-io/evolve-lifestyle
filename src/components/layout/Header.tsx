"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EvolveLogo from "@/components/ui/EvolveLogo";
import Magnetic from "@/components/ui/Magnetic";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Story" },
  { href: "/journal", label: "Journal" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-evolve",
          scrolled
            ? "border-b border-white/10 bg-void/70 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-black/55 via-black/20 to-transparent backdrop-blur-[2px]"
        )}
      >
        <div className="frame flex h-[84px] items-center justify-between">
          <Magnetic strength={0.25}>
            <Link href="/" className="flex items-center" aria-label="EVOLVE home">
              <EvolveLogo variant="white" className="h-4 w-auto sm:h-5" />
            </Link>
          </Magnetic>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((item) => (
              <Magnetic key={item.href} strength={0.2}>
                <Link
                  href={item.href}
                  className="group relative font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright/90 transition-colors hover:text-silver-bright [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-neon shadow-[0_0_10px_rgba(0,255,65,0.7)] transition-all duration-500 ease-evolve group-hover:w-full" />
                </Link>
              </Magnetic>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Magnetic strength={0.25}>
              <button
                onClick={openCart}
                className="group relative flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright"
                aria-label="Open cart"
              >
                <span className="hidden sm:inline">Cart</span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-neon/40 bg-neon/10 px-1.5 text-[0.65rem] text-neon">
                  {count}
                </span>
              </button>
            </Magnetic>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col gap-[5px] md:hidden [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.6))]"
              aria-label="Open menu"
            >
              <span className="h-0.5 w-6 bg-silver-bright" />
              <span className="h-0.5 w-6 bg-silver-bright" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-void md:hidden"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.87, 0, 0.13, 1] }}
          >
            <div className="frame flex h-[84px] items-center justify-between">
              <EvolveLogo variant="white" className="h-5" />
              <button
                onClick={() => setMenuOpen(false)}
                className="font-mono text-[0.72rem] uppercase tracking-tracked text-neon"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="frame flex flex-1 flex-col justify-center gap-2">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-6xl font-medium uppercase tracking-tightest text-silver-bright"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="frame pb-10 font-mono text-[0.65rem] uppercase tracking-tracked text-silver-dim">
              Prairies to Peaks — Edmonton, AB
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
