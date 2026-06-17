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
    { name: "evolve-cart" }
  )
);
