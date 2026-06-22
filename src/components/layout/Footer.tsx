"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import EvolveLogo from "@/components/ui/EvolveLogo";
import { RevealWords } from "@/components/ui/Reveal";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const markY = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);
  const markOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 0.9]);

  return (
    <footer
      ref={ref}
      data-section="Footer"
      className="relative overflow-hidden border-t border-white/10 pt-24"
    >
      <div className="frame">
        <RevealWords
          text="Proud of where we came from."
          className="block text-display-sm font-bold uppercase tracking-tightest text-silver-bright"
        />
        <RevealWords
          text="Hungry for where we're headed."
          className="mt-1 block text-display-sm font-light italic tracking-tight text-silver/70"
          delay={0.1}
        />

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-white/10 pt-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <EvolveLogo className="h-6" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-dim">
              Western-Canadian outdoor lifestyle. Built for the bush, made for
              the long haul. Earned outside.
            </p>
            <div className="mt-6">
              <h4 className="font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">
                Follow
              </h4>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://www.facebook.com/EvolveApparel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="EVOLVE Apparel on Facebook"
                  data-cursor="magnetic"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-silver-dim transition-colors hover:border-neon hover:text-neon"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "All Products", href: "/shop" },
              { label: "Outerwear", href: "/shop?category=outerwear" },
              { label: "Tops", href: "/shop?category=tops" },
              { label: "Headwear", href: "/shop?category=headwear" },
            ]}
          />
          <FooterCol
            title="Brand"
            links={[
              { label: "Our Story", href: "/about" },
              { label: "Journal", href: "/journal" },
              { label: "Descended from Survivors", href: "/about" },
            ]}
          />
          <div>
            <h4 className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
              The Service Company
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-silver-dim">
              EVOLVE began in the trades — abrasive blasting and substrate
              restoration across Alberta.
            </p>
            <a
              href="https://www.evolveecoblasting.com"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnetic"
              className="link-underline mt-4 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-tracked text-silver-bright transition-colors hover:text-neon"
            >
              evolveecoblasting.com
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 md:flex-row md:items-center">
          <p className="font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> EVOLVE —
            Serving Edmonton & Greater Alberta
          </p>
          <div className="flex gap-6 font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim">
            <Link href="/terms" className="link-underline hover:text-neon">Terms &amp; Returns</Link>
            <Link href="/privacy" className="link-underline hover:text-neon">Privacy</Link>
            <a href="https://www.evolveecoblasting.com" target="_blank" rel="noopener" className="link-underline hover:text-neon">Evolve Eco Blasting</a>
          </div>
        </div>
      </div>

      {/* Giant scroll-reactive wordmark payoff — bleeds off the bottom edge */}
      <motion.div
        style={{ y: markY, opacity: markOpacity }}
        className="pointer-events-none mt-6 flex justify-center"
        aria-hidden
      >
        <EvolveLogo
          variant="white"
          className="h-auto w-[112%] max-w-none translate-y-[18%] opacity-90"
        />
      </motion.div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
        {title}
      </h4>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="link-underline text-sm text-silver-dim transition-colors hover:text-silver-bright"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
