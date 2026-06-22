"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  /** unique per product+variant */
  id: string;
  slug: string;
  name: string;
  variantId: string;
  size: string;
  color: string;
  swatch: string;
  price: number; // cents
  image: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === line.id);
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.id === line.id ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { isOpen: true, lines: [...state.lines, { ...line, qty }] };
        }),
      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.id === id ? { ...l, qty: Math.max(0, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().lines.reduce((n, l) => n + l.qty, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.qty * l.price, 0),
    }),
    {
      name: "evolve-cart",
      // only the line items persist — NOT isOpen (so the drawer never reopens itself
      // on load, and the server/first-client render match the empty default).
      partialize: (state) => ({ lines: state.lines }),
      // do not read localStorage during the initial render; rehydrate after mount
      // (CartHydrator) so server HTML and first client render are identical. This
      // removes the hydration text-mismatch on the cart-count badge that was
      // cascading into React #329 in production.
      skipHydration: true,
    }
  )
);
