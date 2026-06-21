import type { ReactNode } from "react";
import ProductImage from "@/components/ui/ProductImage";

/** Parse inline **bold** and [label](url) within a line of markdown. */
function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      nodes.push(
        <strong key={key++} className="font-medium text-silver-bright">
          {m[2]}
        </strong>
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-soft underline decoration-neon/40 underline-offset-2 transition-colors hover:text-neon"
        >
          {m[4]}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

/**
 * Minimal markdown renderer for journal articles: ## subheads, paragraphs with
 * inline links + bold, and `![alt](#photo: ...)` figures (pulled in order from
 * `images`). Deliberately small — no code blocks or tables needed.
 */
export default function Markdown({
  body,
  images = [],
  tone = ["#0d3b1f", "#4ade80"],
}: {
  body: string;
  images?: string[];
  tone?: [string, string];
}) {
  const blocks = body.split(/\n\n+/);
  let photoIdx = 0;
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        const photo = block.match(/^!\[([^\]]*)\]\(#photo:[^)]*\)$/);
        if (photo) {
          const src = images[photoIdx++] ?? images[0];
          if (!src) return null;
          return (
            <figure key={i} className="my-10 sm:my-12">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2px]">
                <ProductImage src={src} alt={photo[1]} tone={tone} className="h-full w-full" />
              </div>
              <figcaption className="mt-3 font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim">
                {photo[1]}
              </figcaption>
            </figure>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="!mt-12 text-2xl font-medium uppercase leading-tight tracking-tight text-silver-bright sm:text-[1.7rem]"
            >
              <Inline text={block.slice(3)} />
            </h2>
          );
        }
        return (
          <p key={i} className="text-base leading-relaxed text-silver-dim sm:text-[1.05rem]">
            <Inline text={block} />
          </p>
        );
      })}
    </div>
  );
}
