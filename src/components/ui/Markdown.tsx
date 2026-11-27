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
          {...(m[5].startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
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
 * Collapse blank lines inside a `:::box ... :::` fence so the paragraph
 * splitter below keeps the card as one block. Bodies with no info box are
 * returned unchanged, which keeps existing articles byte-for-byte.
 */
function mergeInfoBoxes(body: string): string {
  if (!body.includes(":::box")) return body;
  const lines = body.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^:::box(?:[ \t]|$)/.test(lines[i])) {
      out.push(lines[i]);
      continue;
    }
    let end = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^:::[ \t]*$/.test(lines[j])) {
        end = j;
        break;
      }
    }
    if (end === -1) {
      out.push(lines[i]);
      continue;
    }
    const compact = [
      lines[i],
      ...lines.slice(i + 1, end).filter((line) => line.trim() !== ""),
      lines[end],
    ];
    out.push(compact.join("\n"));
    i = end;
  }
  return out.join("\n");
}

/**
 * Minimal markdown renderer for journal articles: ## subheads, paragraphs with
 * inline links + bold, pipe tables, "> " pull-outs, :::box info cards, and
 * `![alt](#photo: ...)` figures (pulled in order from `images`). Deliberately
 * small, with no extra dependencies.
 */
export default function Markdown({
  body,
  images = [],
  tone = ["#0d3b1f", "#4ade80"],
  hideCaptions = false,
}: {
  body: string;
  images?: string[];
  tone?: [string, string];
  hideCaptions?: boolean;
}) {
  const blocks = mergeInfoBoxes(body).split(/\n\n+/);
  let photoIdx = 0;
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        const photo = block.match(/^!\[([^\]]*)\]\(#photo:([^)]*)\)$/);
        if (photo) {
          const src = images[photoIdx++] ?? images[0];
          if (!src) return null;
          // optional photo credit: `![alt](#photo: Credit label | https://source)`
          const credit = photo[2].match(/^\s*(.+?)\s*\|\s*(https?:\/\/\S+)\s*$/);
          return (
            <figure key={i} className="my-10 sm:my-12">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2px]">
                <ProductImage src={src} alt={photo[1]} tone={tone} className="h-full w-full" />
              </div>
              {credit ? (
                <figcaption className="mt-3 font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim">
                  {!hideCaptions && `${photo[1]} · `}Photo:{" "}
                  <a href={credit[2]} target="_blank" rel="noopener noreferrer" className="underline decoration-neon/40 underline-offset-2 hover:text-neon">
                    {credit[1]}
                  </a>
                </figcaption>
              ) : (
                !hideCaptions && (
                  <figcaption className="mt-3 font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim">
                    {photo[1]}
                  </figcaption>
                )
              )}
            </figure>
          );
        }
        const lines = block.split("\n");
        if (lines.length > 1 && lines.every((l) => l.trim().startsWith("|"))) {
          const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
          const head = cells(lines[0]);
          const rows = lines.slice(2).map(cells);
          return (
            <div key={i} className="!my-10 overflow-x-auto rounded-[2px] border border-white/10">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm text-silver-dim">
                <thead>
                  <tr>
                    {head.map((h, j) => (
                      <th key={j} scope="col" className="border-b border-white/10 bg-white/5 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">
                        <Inline text={h} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, j) => (
                    <tr key={j} className="border-b border-white/5 last:border-0">
                      {r.map((c, k) => (
                        <td key={k} className="px-3 py-2 align-top">
                          <Inline text={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-base leading-relaxed text-silver-dim sm:text-[1.05rem]">
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.slice(2)} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="!mt-8 text-lg font-medium uppercase leading-tight tracking-tight text-silver-bright sm:text-xl"
            >
              <Inline text={block.slice(4)} />
            </h3>
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
        const boxTitle = lines[0].match(/^:::box[ \t]+(.+?)[ \t]*$/);
        if (boxTitle && lines[lines.length - 1].trim() === ":::") {
          const items = lines.slice(1, -1).filter((line) => line.startsWith("- "));
          return (
            <aside
              key={i}
              aria-label={boxTitle[1]}
              className="rounded-[2px] border border-white/10 bg-white/5 px-5 py-5 sm:px-6 sm:py-6"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">
                {boxTitle[1]}
              </p>
              {items.length > 0 && (
                <ul className="mt-4 list-none space-y-2 text-base leading-relaxed text-silver-dim sm:text-[1.05rem]">
                  {items.map((line, j) => (
                    <li key={j}>
                      <Inline text={line.slice(2)} />
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          );
        }
        if (lines.every((line) => line.startsWith("> "))) {
          return (
            <blockquote
              key={i}
              className="!my-10 border-l-[3px] border-neon pl-5 text-[1.25rem] leading-snug text-silver-bright sm:!my-12 sm:pl-6 sm:text-[1.5rem]"
            >
              {lines.map((line, j) => (
                <p key={j} className={j > 0 ? "mt-3" : undefined}>
                  <Inline text={line.slice(2)} />
                </p>
              ))}
            </blockquote>
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
