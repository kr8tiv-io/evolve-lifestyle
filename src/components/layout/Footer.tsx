"use client";

import Link from "next/link";
import EvolveLogo from "@/components/ui/EvolveLogo";
import Marquee from "@/components/ui/Marquee";
import { RevealWords } from "@/components/ui/Reveal";
import { MARQUEE_LINES } from "@/lib/slogans";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-void pt-20">
      <div className="frame">
        <RevealWords
          text="Proud of where we came from."
          className="block text-display-sm font-medium uppercase tracking-tightest text-silver-bright"
        />
        <RevealWords
          text="Hungry for where we're headed."
          className="mt-1 block text-display-sm font-medium uppercase tracking-tightest text-silver/40"
          delay={0.1}
        />

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-white/10 pt-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <EvolveLogo className="h-6" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-dim">
              Western-Canadian outdoor lifestyle. Built for the bush, made for
              the long haul. Earned outside.
            </p>
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
              className="mt-4 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-tracked text-silver-bright transition-colors hover:text-neon"
            >
              evolveecoblasting.com
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 md:flex-row md:items-center">
          <p className="font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim">
            © {new Date().getFullYear()} EVOLVE — Serving Edmonton & Greater
            Alberta
          </p>
          <div className="flex gap-6 font-mono text-[0.62rem] uppercase tracking-tracked text-silver-dim">
            <Link href="/about" className="hover:text-neon">
              Shipping
            </Link>
            <Link href="/about" className="hover:text-neon">
              Returns
            </Link>
            <Link href="/about" className="hover:text-neon">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <Marquee
          items={MARQUEE_LINES}
          speed="slow"
          className="font-medium uppercase tracking-[0.2em] text-silver/10"
        />
      </div>
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
              className="text-sm text-silver-dim transition-colors hover:text-silver-bright"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
