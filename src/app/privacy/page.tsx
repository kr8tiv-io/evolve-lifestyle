import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How EVOLVE collects, uses, and protects your information. We only collect what we need to fulfil your order and never sell your data.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "01 · What we collect",
    body: [
      "When you place an order we collect what's needed to fulfil it: your name, shipping and billing address, email, and order details. Payment is processed by our payment provider — we never see or store your full card number.",
      "If you sign up for updates, we keep your email address so we can let you know about drops and news. You can unsubscribe any time.",
    ],
  },
  {
    h: "02 · How we use it",
    body: [
      "We use your information to produce and ship your order, to send order and shipping updates, to handle any defect or support request, and — if you've opted in — to share occasional brand news. That's it.",
    ],
  },
  {
    h: "03 · Who we share it with",
    body: [
      "We share only what's necessary with the partners who make this work: our print-and-fulfilment partner (to produce and ship your order), our payment processor, and our email provider if you've subscribed. We do not sell your personal information to anyone, ever.",
    ],
  },
  {
    h: "04 · Cookies & analytics",
    body: [
      "We may use basic cookies and privacy-respecting analytics to understand how the site is used and to keep your cart working. You can control cookies through your browser settings.",
    ],
  },
  {
    h: "05 · Your rights & security",
    body: [
      "You can ask us what information we hold about you, request a correction, or ask us to delete it — just reach out. We take reasonable steps to protect your data, and we only keep it as long as we need to.",
    ],
  },
  {
    h: "06 · Contact",
    body: [
      "Questions about your privacy or your data? Get in touch and a real person from EVOLVE will help.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="pt-[var(--header-h)]">
      <section className="frame-read py-[12vh]">
        <p className="eyebrow mb-5">Your Data</p>
        <h1 className="text-display-sm font-bold uppercase tracking-tightest text-silver-bright">
          Privacy Policy
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver-dim">
          We collect only what we need to get your order to you, and we never
          sell your information. Straight up.
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
          <Link href="/terms" className="link-underline font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright">
            Terms &amp; Returns →
          </Link>
        </div>
      </section>
    </div>
  );
}
