import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { getArticles } from "@/lib/journal";

export const metadata = {
  title: "Journal",
  description:
    "Getting outside in Western Canada and beyond — where to ski and ride, the best hikes in Alberta and BC, boutique cabins to escape to, and Canada's best parks.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const articles = getArticles();

  return (
    <div className="pt-[var(--header-h)]">
      <section className="frame pb-12 pt-20">
        <p className="eyebrow mb-5">The Journal</p>
        <RevealWords
          text="Field notes."
          className="block text-display font-medium uppercase tracking-tightest text-silver-bright"
        />
        <p className="mt-6 max-w-lg text-base text-silver-dim">
          Dispatches on getting outside in Western Canada and beyond — where to ride, what to hike,
          and the kind of places worth driving a long way for.
        </p>
      </section>

      <section className="frame grid gap-x-6 gap-y-12 pb-28 md:grid-cols-2">
        {articles.map((article, i) => (
          <Reveal key={article.slug} delay={(i % 2) * 0.08} className={i === 0 ? "md:col-span-2" : ""}>
            <Link href={`/journal/${article.slug}`} className="group block">
              <div
                className={`relative overflow-hidden rounded-[2px] ${
                  i === 0 ? "aspect-[16/8]" : "aspect-[16/11]"
                }`}
              >
                <ProductImage
                  src={article.hero}
                  alt={article.title}
                  tone={article.tone}
                  className="h-full w-full"
                  imgClassName="group-hover:scale-105"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/50 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft backdrop-blur">
                  {article.category}
                </span>
              </div>
              <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-tracked text-neon-soft">
                {article.category} · {article.readMinutes} min read
              </p>
              <h2 className="mt-2 text-2xl font-medium uppercase leading-tight tracking-tight text-silver-bright transition-colors duration-300 group-hover:text-neon">
                {article.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-silver-dim">{article.dek}</p>
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
