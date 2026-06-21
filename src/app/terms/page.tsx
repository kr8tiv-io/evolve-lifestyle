import Link from "next/link";

export const metadata = {
  title: "Terms & Returns",
  description:
    "EVOLVE terms of sale. All sales are final; we exchange or remake any item with a manufacturing defect. Made-to-order apparel, shipped across Canada and North America.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "01 · Made to order",
    body: [
      "Every EVOLVE piece is produced to order — embroidered or printed once you place it — and shipped across Canada and North America. Because each item is made for you specifically, please double-check your size and colour before checking out.",
    ],
  },
  {
    h: "02 · All sales are final",
    body: [
      "At this stage we are a small shop, building ourselves up. To keep that possible, all sales are final — we don't currently offer returns, refunds, or size or colour exchanges for change of mind.",
      "This isn't because we don't want to look after you. It's simply where we're at as a young brand, and we'd rather be upfront about it than over-promise. Thanks for understanding and for backing us early.",
    ],
  },
  {
    h: "03 · Defects — we've got you",
    body: [
      "If your product arrives with a genuine manufacturing defect, or it doesn't come out the way it should, we will absolutely make it right. Reach out within 14 days of delivery with your order number and a couple of photos of the issue.",
      "We'll exchange or remake the item and get you the proper product. Send the defective piece back to us and we'll handle the rest — that part's on us.",
    ],
  },
  {
    h: "04 · Shipping",
    body: [
      "Made-to-order items take a few business days to produce before they ship. Delivery times vary by destination across Canada and North America. Any duties or taxes are calculated at checkout where applicable.",
    ],
  },
  {
    h: "05 · Contact",
    body: [
      "Questions about an order or a defect? Get in touch and a real person from EVOLVE will help. We're a small crew and we read everything.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="pt-[var(--header-h)]">
      <section className="frame-read py-[12vh]">
        <p className="eyebrow mb-5">The Fine Print</p>
        <h1 className="text-display-sm font-bold uppercase tracking-tightest text-silver-bright">
          Terms &amp; Returns
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver-dim">
          Plain and honest, the way we like it. All sales are final while we
          grow — but if anything arrives defective, we make it right.
        </p>

        <div className="mt-14 space-y-12 border-t border-white/10 pt-12">
          {SECTIONS.map((s) => (
            <div key={s.h} className="grid gap-4 md:grid-cols-[0.3fr_0.7fr] md:gap-10">
              <h2 className="font-mono text-[0.72rem] uppercase tracking-tracked text-neon-soft">
                {s.h}
              </h2>
              <div className="space-y-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-base leading-relaxed text-silver">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <Link href="/privacy" className="link-underline font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright">
            Privacy Policy →
          </Link>
        </div>
      </section>
    </div>
  );
}
