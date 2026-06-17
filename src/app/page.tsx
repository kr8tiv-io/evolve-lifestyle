import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import FeaturedDrop from "@/components/sections/FeaturedDrop";
import BrandPillars from "@/components/sections/BrandPillars";
import SloganMoment from "@/components/sections/SloganMoment";
import Lookbook from "@/components/sections/Lookbook";
import Marquee from "@/components/ui/Marquee";
import { MARQUEE_LINES } from "@/lib/slogans";

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="border-y border-white/10 py-6">
        <Marquee
          items={MARQUEE_LINES}
          className="text-lg font-medium uppercase tracking-[0.18em] text-silver-bright/80"
        />
      </div>

      <Manifesto />

      <FeaturedDrop />

      <SloganMoment />

      <BrandPillars />

      <Lookbook />

      <SloganMoment
        slogan="Strip it back."
        emphasis="Build it stronger."
        note="From the trades to the trails — the same instinct, pointed outward."
        image="https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=1900&q=80"
        tone={["#3a1c14", "#39ff14"]}
      />
    </>
  );
}
