import Link from "next/link";
import BrandPillars from "@/components/sections/BrandPillars";
import SloganMoment from "@/components/sections/SloganMoment";
import Marquee from "@/components/ui/Marquee";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import ProductImage from "@/components/ui/ProductImage";
import { SLOGANS } from "@/lib/slogans";

export const metadata = {
  title: "Our Story",
  description:
    "Descended from survivors. One of the largest lands on Earth. Work hard, play hard. The story behind EVOLVE.",
};

export default function AboutPage() {
  return (
    <div className="pt-[var(--header-h)]">
      {/* Intro */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <ProductImage
            src="/images/photo-1506744038136-46273834b3fb.jpg"
            alt="Boreal landscape"
            tone={["#0d3b1f", "#00ff41"]}
            className="h-full w-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
        </div>
        <div className="frame relative z-10 pb-16">
          <p className="eyebrow mb-6">Est. in the trades · Alberta</p>
          <h1 className="max-w-5xl text-display font-bold uppercase leading-[0.85] tracking-tightest text-silver-bright [font-feature-settings:'cpsp'_1]">
            <RevealWords text="We don't tame the wild." />
            <br />
            <span className="text-neon text-glow-neon">
              <RevealWords text="We belong to it." delay={0.1} />
            </span>
          </h1>
        </div>
      </section>

      {/* Lead paragraph */}
      <section className="frame py-[14vh]">
        <div className="grid gap-10 md:grid-cols-[0.4fr_0.6fr] md:gap-16">
          <Reveal>
            <p className="font-mono text-[0.7rem] uppercase leading-relaxed tracking-tracked text-neon-soft">
              EVOLVE began with abrasive blasting — stripping surfaces back to
              bare and building them stronger than new. The lifestyle brand is
              that same instinct, pointed at the country we get to call home.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium leading-[1.15] tracking-tight text-silver-bright">
              This is apparel for people who measure a good life in cold
              mornings, long drives, and country with no signal. Polite until
              the work gets hard. Proud of where we came from, hungry for where
              we're headed.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="border-y border-white/10 py-5">
        <Marquee
          items={["DESCENDED FROM SURVIVORS", "EARNED OUTSIDE", "CANADIAN-BUILT. WEATHER-TESTED.", "BUILT FOR THE BUSH"]}
          className="text-base font-medium uppercase tracking-[0.2em] text-silver-bright/70"
        />
      </div>

      {/* The 3 pillars */}
      <BrandPillars />

      <SloganMoment
        slogan="Hardest jobs. Coldest mornings."
        emphasis="Proudest people."
        note="Tougher than the winters that made us."
        image="/images/photo-1483728642387-6c3bdd6c93e5.jpg"
        tone={["#13233a", "#4ade80"]}
      />

      {/* Slogan wall */}
      <section className="frame py-[14vh]">
        <p className="eyebrow mb-10">What We Say</p>
        <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {SLOGANS.map((s, i) => (
            <Reveal key={i} delay={(i % 4) * 0.04}>
              <div className="flex items-baseline gap-4 border-b border-white/5 py-4">
                <span className="font-mono text-[0.6rem] tabular-nums text-neon/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-medium uppercase tracking-tight text-silver-bright">
                  {s}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA back to service company + shop */}
      <section className="frame pb-28">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/shop"
            className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden border border-white/10 p-8 transition-colors hover:border-neon/40"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
              The Range
            </span>
            <span className="text-3xl font-medium uppercase tracking-tightest text-silver-bright">
              Shop everything →
            </span>
          </Link>
          <a
            href="https://www.evolveecoblasting.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden border border-white/10 p-8 transition-colors hover:border-neon/40"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-tracked text-neon-soft">
              The Service Company
            </span>
            <span className="text-3xl font-medium uppercase tracking-tightest text-silver-bright">
              Evolve Eco Blasting →
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
