"use client";

import { useState } from "react";

/**
 * Blog / newsletter capture. Stores first name, last name, email + a consent flag.
 *
 * Storage for now: posts to FormSubmit (https://formsubmit.co) — no account, no
 * payment, no backend. Every signup is delivered to LIST_INBOX, where it's held
 * until we move the list to Mailchimp. The endpoint is the single constant below,
 * so swapping to a Google Sheet / Apps Script / Mailchimp later is a one-line change.
 *
 * Note: the first real submission triggers a one-time FormSubmit activation email to
 * LIST_INBOX — click the "Activate" button in it once and every later signup flows
 * straight through.
 */
const LIST_INBOX = "todd@evolveecoblasting.com";
const ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(LIST_INBOX)}`;

type Status = "idle" | "submitting" | "done" | "error";

export default function EmailSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState(""); // honeypot — bots fill it, humans never see it
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    consent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (trap) return; // bot
    if (!valid || status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          consent: "Yes — opted in to the EVOLVE outdoors newsletter (biweekly)",
          _subject: "New EVOLVE outdoors list signup",
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      // success === "true" once the list is active; before the owner clicks the
      // one-time activation link FormSubmit returns success:"false" with an
      // activation message — the signup is still received, so treat it as done.
      const received =
        res.ok &&
        (data.success === "true" || data.success === true || /activ/i.test(data.message || ""));
      if (received) {
        setStatus("done");
      } else {
        setStatus("error");
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again in a moment.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-[3px] border border-neon/30 bg-black/50 p-8 text-center sm:p-10">
        <p className="font-mono text-[0.62rem] uppercase tracking-tracked text-neon">You&rsquo;re in</p>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-silver-bright">
          Thanks, {firstName.trim()}. We&rsquo;ll send the good stuff — the best places to get outside
          in Canada — about twice a month. Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[3px] border border-white/10 bg-black/50 p-8 sm:p-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-tracked text-neon-soft">The EVOLVE outdoors list</p>
      <h3 className="mt-3 max-w-lg text-2xl font-medium uppercase leading-tight tracking-tight text-silver-bright sm:text-3xl">
        The best places to get outside in Canada — in your inbox.
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-silver-dim">
        Trail notes, ski intel, cabins worth the drive, and parks worth the detour. About twice a
        month. We won&rsquo;t flood your inbox, and you can leave anytime.
      </p>

      <form onSubmit={onSubmit} className="mt-7 max-w-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[0.56rem] uppercase tracking-tracked text-silver-dim">First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
              className="mt-1.5 w-full rounded-[2px] border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-silver-bright outline-none transition-colors placeholder:text-silver-dim/60 focus:border-neon/60"
              placeholder="Jordan"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[0.56rem] uppercase tracking-tracked text-silver-dim">Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
              className="mt-1.5 w-full rounded-[2px] border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-silver-bright outline-none transition-colors placeholder:text-silver-dim/60 focus:border-neon/60"
              placeholder="Rivers"
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="font-mono text-[0.56rem] uppercase tracking-tracked text-silver-dim">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-1.5 w-full rounded-[2px] border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-silver-bright outline-none transition-colors placeholder:text-silver-dim/60 focus:border-neon/60"
            placeholder="you@example.com"
          />
        </label>

        {/* honeypot — visually hidden, off the a11y tree */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-neon"
          />
          <span className="text-xs leading-relaxed text-silver-dim">
            Yes, send me the EVOLVE outdoors newsletter — about twice a month. I can unsubscribe
            anytime, and my details won&rsquo;t be sold or shared.
          </span>
        </label>

        {status === "error" && (
          <p className="mt-4 text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          data-cursor="magnetic"
          disabled={!valid || status === "submitting"}
          className="btn-solid mt-6 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "submitting" ? "Signing you up…" : "Subscribe"}
          <span aria-hidden>→</span>
        </button>
      </form>
    </div>
  );
}
