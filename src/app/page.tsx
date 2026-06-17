import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import FeaturedDrop from "@/components/sections/FeaturedDrop";
import BrandPillars from "@/components/sections/BrandPillars";
import SloganMoment from "@/components/sections/SloganMoment";
import PinnedGallery from "@/components/sections/PinnedGallery";
import Lookbook from "@/components/sections/Lookbook";
import Marquee from "@/components/ui/Marquee";
import { MARQUEE_LINES } from "@/lib/slogans";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* slogan ribbon — blends out of the hero, no hard rule */}
      <div className="relative -mt-px py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_50%,rgba(0,255,65,0.06),transparent_72%)]" />
        <Marquee
          items={MARQUEE_LINES}
          className="text-lg font-medium uppercase tracking-[0.18em] text-silver-bright/80"
        />
      </div>

      <Manifesto />

      <FeaturedDrop />

      <SloganMoment />

      <BrandPillars />

      {/* GSAP-pinned cross-fade through the country */}
      <PinnedGallery />

      <Lookbook />

      <SloganMoment
        slogan="Strip it back."
        emphasis="Build it stronger."
        note="From the trades to the trails — the same instinct, pointed outward."
        image="/images/photo-1428908728789-d2de25dbd4e2.jpg"
        tone={["#3a1c14", "#39ff14"]}
      />
    </>
  );
}
