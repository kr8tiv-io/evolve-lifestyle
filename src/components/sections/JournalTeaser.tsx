import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { getArticles } from "@/lib/journal";

// Keep the landing page uncluttered: feature three pieces and send everyone
// else to the full /journal index via the "Find more great articles" button.
const FEATURED = ["best-views-canada", "vancouver-island-places", "off-grid-cabin-canada"];

export default function JournalTeaser() {
  const all = getArticles();
  const picks = FEATURED.map((slug) => all.find((a) => a.slug === slug)).filter(
    (a): a is (typeof all)[number] => Boolean(a)
  );
  const articles = (picks.length === 3 ? picks : all).slice(0, 3);

  return (
    <section className="frame border-t border-white/10 py-24 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-5">The Journal</p>
          <h2 className="max-w-xl text-3xl font-medium uppercase leading-[1.05] tracking-tightest text-silver-bright sm:text-5xl">
            Field notes from the country
          </h2>
          <p className="mt-5 max-w-md text-base text-silver-dim">
            Where to hike, ride, climb, and disappear for a while — deeply researched
            dispatches on getting outside in Canada and beyond.
          </p>
        </div>
        <Link
          href="/journal"
          className="group hidden shrink-0 items-center gap-2 font-mono text-[0.7rem] uppercase tracking-tracked text-neon-soft transition-colors hover:text-neon sm:inline-flex"
        >
          View all
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-3">
        {articles.map((article, i) => (
          <Reveal key={article.slug} delay={(i % 3) * 0.08}>
            <Link href={`/journal/${article.slug}`} className="group block">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[2px]">
                <ProductImage
                  src={article.hero}
                  alt={article.title}
                  tone={article.tone}
                  className="h-full w-full"
                  imgClassName="group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/50 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft backdrop-blur">
                  {article.category}
                </span>
              </div>
              <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft">
                {article.category} · {article.readMinutes} min read
              </p>
              <h3 className="mt-2 text-xl font-medium uppercase leading-tight tracking-tight text-silver-bright transition-colors duration-300 group-hover:text-neon">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-silver-dim">{article.dek}</p>
              <span className="mt-3 inline-block font-mono text-[0.62rem] uppercase tracking-tracked text-silver">
                Read →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Link href="/journal" data-cursor="magnetic" className="btn-solid">
          Find more great articles <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
