import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getArticles } from "@/lib/journal";
import Markdown from "@/components/ui/Markdown";
import ProductImage from "@/components/ui/ProductImage";

const SITE = "https://evolveapparel.shop";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.dek,
    alternates: { canonical: `/journal/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.dek,
      url: `${SITE}/journal/${a.slug}`,
      type: "article",
      images: [{ url: a.hero, width: 1600, height: 1000, alt: a.title }],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.dek, images: [a.hero] },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const more = getArticles().filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.dek,
    image: `${SITE}${article.hero}`,
    articleSection: article.category,
    mainEntityOfPage: `${SITE}/journal/${article.slug}`,
    author: { "@type": "Organization", name: "EVOLVE" },
    publisher: { "@type": "Organization", name: "EVOLVE Apparel" },
  };

  return (
    <article className="pt-[var(--header-h)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <header className="relative h-[56vh] min-h-[380px] w-full overflow-hidden">
        <ProductImage src={article.hero} alt={article.title} tone={article.tone} className="h-full w-full" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/10" />
        <div className="vignette absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="frame-read pb-9">
            <Link
              href="/journal"
              className="link-underline font-mono text-[0.62rem] uppercase tracking-tracked text-neon-soft"
            >
              ← The Journal
            </Link>
            <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-tracked text-neon-soft">
              {article.category} · {article.readMinutes} min read
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-medium uppercase leading-[1.03] tracking-tightest text-silver-bright sm:text-5xl">
              {article.title}
            </h1>
          </div>
        </div>
      </header>

      {/* body */}
      <div className="frame-read py-14">
        <p className="mb-12 max-w-2xl border-l-2 border-neon/50 pl-5 text-lg italic leading-relaxed text-silver/90 sm:text-xl">
          {article.dek}
        </p>
        <div className="max-w-2xl">
          <Markdown body={article.body} images={article.inlineImages} tone={article.tone} />
        </div>

        {/* soft sell */}
        <div className="mt-16 max-w-2xl overflow-hidden rounded-[3px] border border-white/10 bg-void/40 p-7">
          <p className="font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">Before you head out</p>
          <p className="mt-3 text-base leading-relaxed text-silver-dim">
            Need gear for the trip — something built for the bush and made for the long haul? Have a
            look at what we make.
          </p>
          <Link href="/shop" data-cursor="magnetic" className="btn-solid mt-5">
            Shop EVOLVE <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* more from the journal */}
      {more.length > 0 && (
        <section className="frame border-t border-white/10 py-16">
          <p className="eyebrow mb-8">More from the journal</p>
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((a) => (
              <Link key={a.slug} href={`/journal/${a.slug}`} className="group block">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[2px]">
                  <ProductImage src={a.hero} alt={a.title} tone={a.tone} className="h-full w-full" imgClassName="group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/50 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-tracked text-neon-soft backdrop-blur">
                    {a.category}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium uppercase leading-tight tracking-tight text-silver-bright transition-colors group-hover:text-neon">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
