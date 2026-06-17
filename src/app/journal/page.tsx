import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

export const metadata = {
  title: "Journal",
  description:
    "Field notes from prairies to peaks — stories, drops, and dispatches from the EVOLVE world.",
};

interface Entry {
  title: string;
  category: string;
  excerpt: string;
  image: string;
  tone: [string, string];
  size: "lg" | "sm";
}

const ENTRIES: Entry[] = [
  {
    title: "The First Cold Snap",
    category: "Field Notes",
    excerpt:
      "Why the 480 GSM Survivors Hoodie was built to be the last layer you ever question.",
    image: "/images/photo-1418489098061-ce87b5dc3aee.jpg",
    tone: ["#0d3b1f", "#00ff41"],
    size: "lg",
  },
  {
    title: "Prairies to Peaks, in a Day",
    category: "Dispatch",
    excerpt: "Flat country to the front range before the coffee went cold.",
    image: "/images/photo-1469474968028-56623f02e42e.jpg",
    tone: ["#3a2f12", "#39ff14"],
    size: "sm",
  },
  {
    title: "Bears, Caribou, and the Rest of Us",
    category: "The Wild",
    excerpt: "Sharing the backyard with the locals who were here first.",
    image: "/images/photo-1525382455947-f319bc05fb35.jpg",
    tone: ["#13233a", "#4ade80"],
    size: "sm",
  },
  {
    title: "Strip It Back, Build It Stronger",
    category: "Heritage",
    excerpt:
      "From the blasting bay to the brand — the philosophy that started it all.",
    image: "/images/photo-1551632811-561732d1e306.jpg",
    tone: ["#3a1c14", "#39ff14"],
    size: "lg",
  },
];

export default function JournalPage() {
  return (
    <div className="pt-[var(--header-h)]">
      <section className="frame pb-12 pt-20">
        <p className="eyebrow mb-5">The Journal</p>
        <RevealWords
          text="Field notes."
          className="block text-display font-medium uppercase tracking-tightest text-silver-bright"
        />
        <p className="mt-6 max-w-md text-base text-silver-dim">
          Stories, drops, and dispatches from prairies to coast. Placeholder
          editorial — structured so a CMS or MDX wires straight in.
        </p>
      </section>

      <section className="frame grid gap-6 pb-28 md:grid-cols-2">
        {ENTRIES.map((entry, i) => (
          <Reveal key={i} delay={(i % 2) * 0.08} className={entry.size === "lg" ? "md:col-span-1" : ""}>
            <Link href="/journal" className="group block">
              <div
                className={`relative overflow-hidden ${
                  entry.size === "lg" ? "aspect-[16/11]" : "aspect-[16/12]"
                }`}
              >
                <ProductImage
                  src={entry.image}
                  alt={entry.title}
                  tone={entry.tone}
                  className="h-full w-full"
                  imgClassName="group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/50 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft backdrop-blur">
                  {entry.category}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-medium uppercase tracking-tight text-silver-bright transition-colors group-hover:text-neon">
                {entry.title}
              </h2>
              <p className="mt-2 max-w-md text-sm text-silver-dim">{entry.excerpt}</p>
              <span className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-tracked text-silver">
                Read →
              </span>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
