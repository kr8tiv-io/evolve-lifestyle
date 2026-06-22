"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { startCheckout, buildOrderMailto, CHECKOUT_ENDPOINT, type ShippingAddress } from "@/lib/commerce";

const EMPTY_ADDR: ShippingAddress = { name: "", country: "CA", line1: "", line2: "", city: "", state: "", zip: "" };

export default function CartDrawer() {
  const { isOpen, close, lines, remove, setQty, subtotal, count } = useCart();
  const total = subtotal();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState("");
  const [step, setStep] = useState<"cart" | "address">("cart");
  const [addr, setAddr] = useState<ShippingAddress>(EMPTY_ADDR);

  const addrValid =
    addr.name.trim() &&
    addr.line1.trim() &&
    addr.city.trim() &&
    /^[A-Za-z]{2}$/.test(addr.state.trim()) &&
    addr.zip.trim();

  const set = (k: keyof ShippingAddress, v: string) => setAddr((a) => ({ ...a, [k]: v }));

  const handleCheckout = async (address?: ShippingAddress) => {
    if (checkingOut || lines.length === 0) return;
    setCheckingOut(true);
    setCheckoutErr("");
    const res = await startCheckout(lines, address);
    if (res.ok && res.url) {
      window.location.href = res.url; // → Stripe hosted checkout
      return;
    }
    if (res.fallback === "email") {
      window.location.href = buildOrderMailto(lines);
      setCheckingOut(false);
      return;
    }
    setCheckoutErr("Checkout is briefly unavailable — please try again or email us to order.");
    setCheckingOut(false);
  };

  // "Checkout": when Stripe is wired, collect the shipping address first (so the
  // Worker can compute exact shipping); otherwise fall back to the email order.
  const onCheckoutClick = () => {
    if (CHECKOUT_ENDPOINT) setStep("address");
    else handleCheckout();
  };

  const inputCls =
    "w-full rounded-[2px] border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-silver-bright outline-none transition-colors placeholder:text-silver-dim/60 focus:border-neon/60";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-md flex-col border-l border-white/10 bg-void-900"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
              <h2 className="font-mono text-[0.72rem] uppercase tracking-tracked text-silver-bright">
                Your Kit — {count()} {count() === 1 ? "item" : "items"}
              </h2>
              <button
                onClick={close}
                className="font-mono text-[0.72rem] uppercase tracking-tracked text-neon"
              >
                Close
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-2xl font-medium uppercase tracking-tightest text-silver-bright">
                  Nothing here yet
                </p>
                <p className="max-w-xs text-sm text-silver-dim">
                  Cold and free beats warm and bored. Go find something worth
                  earning outside.
                </p>
                <Link href="/shop" onClick={close} className="btn-neon mt-2">
                  Shop the range
                </Link>
              </div>
            ) : (
              <>
                {step === "address" ? (
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <button
                      onClick={() => setStep("cart")}
                      className="mb-4 font-mono text-[0.6rem] uppercase tracking-tracked text-silver-dim transition-colors hover:text-neon"
                    >
                      ← Back to cart
                    </button>
                    <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-tracked text-neon-soft">
                      Ship to
                    </p>
                    <div className="space-y-3">
                      <input value={addr.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" autoComplete="name" className={inputCls} />
                      <input value={addr.line1} onChange={(e) => set("line1", e.target.value)} placeholder="Address" autoComplete="address-line1" className={inputCls} />
                      <input value={addr.line2 || ""} onChange={(e) => set("line2", e.target.value)} placeholder="Apt, unit (optional)" autoComplete="address-line2" className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={addr.city} onChange={(e) => set("city", e.target.value)} placeholder="City" autoComplete="address-level2" className={inputCls} />
                        <input value={addr.state} onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))} placeholder="Prov/State (AB)" autoComplete="address-level1" className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={addr.zip} onChange={(e) => set("zip", e.target.value)} placeholder="Postal / ZIP" autoComplete="postal-code" className={inputCls} />
                        <select
                          value={addr.country}
                          onChange={(e) => setAddr((a) => ({ ...a, country: e.target.value as "CA" | "US" }))}
                          className={inputCls}
                        >
                          <option value="CA">Canada</option>
                          <option value="US">United States</option>
                        </select>
                      </div>
                    </div>
                    <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-tracked text-silver-dim/70">
                      Exact shipping is calculated from this address.
                    </p>
                  </div>
                ) : (
                <div className="flex-1 divide-y divide-white/5 overflow-y-auto px-6">
                  {lines.map((line) => (
                    <div key={line.id} className="flex gap-4 py-5">
                      <div
                        className="h-24 w-20 shrink-0 overflow-hidden bg-void-700"
                        style={{ backgroundImage: `url(${line.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium uppercase tracking-wide text-silver-bright">
                            {line.name}
                          </p>
                          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-silver-dim">
                            {line.color} · {line.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 font-mono text-sm text-silver">
                            <button
                              onClick={() => setQty(line.id, line.qty - 1)}
                              className="h-6 w-6 border border-white/15 text-silver-bright transition-colors hover:border-neon hover:text-neon"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-4 text-center tabular-nums">{line.qty}</span>
                            <button
                              onClick={() => setQty(line.id, line.qty + 1)}
                              className="h-6 w-6 border border-white/15 text-silver-bright transition-colors hover:border-neon hover:text-neon"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-silver-bright">
                              {formatPrice(line.price * line.qty)}
                            </span>
                            <button
                              onClick={() => remove(line.id)}
                              className="font-mono text-[0.6rem] uppercase tracking-wide text-silver-dim underline-offset-4 hover:text-neon hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                <div className="border-t border-white/10 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.72rem] uppercase tracking-tracked text-silver-dim">
                      Subtotal
                    </span>
                    <span className="text-2xl font-medium text-silver-bright">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wide text-silver-dim">
                    Shipping calculated next · 5% GST
                  </p>
                  {step === "address" ? (
                    <button
                      className="btn-neon mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => addrValid && handleCheckout(addr)}
                      disabled={checkingOut || !addrValid}
                    >
                      {checkingOut ? "Taking you to payment…" : "Continue to payment"}
                    </button>
                  ) : (
                    <button
                      className="btn-neon mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={onCheckoutClick}
                      disabled={checkingOut}
                    >
                      {checkingOut ? "Taking you to checkout…" : "Checkout"}
                    </button>
                  )}
                  {checkoutErr && (
                    <p className="mt-3 text-center font-mono text-[0.58rem] uppercase tracking-wide text-red-400">
                      {checkoutErr}
                    </p>
                  )}
                  <p className="mt-3 text-center font-mono text-[0.58rem] uppercase tracking-wide text-silver-dim/70">
                    Made to order · ships across Canada &amp; North America
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
