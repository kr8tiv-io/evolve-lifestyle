"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { isOpen, close, lines, remove, setQty, subtotal, count } = useCart();
  const total = subtotal();

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
                    Shipping + GST calculated at checkout · 5% GST
                  </p>
                  <button
                    className="btn-neon mt-5 w-full"
                    onClick={() =>
                      alert(
                        "Checkout is wired in later — Printful/Shopify handoff goes here."
                      )
                    }
                  >
                    Checkout — placeholder
                  </button>
                  <p className="mt-3 text-center font-mono text-[0.58rem] uppercase tracking-wide text-silver-dim/70">
                    Drop-ship ready · connect Printful or Shopify to go live
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
