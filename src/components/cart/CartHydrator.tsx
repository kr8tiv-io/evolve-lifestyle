"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/**
 * Rehydrates the persisted cart from localStorage AFTER mount. The store uses
 * `skipHydration`, so the server HTML and the first client render both show the
 * empty default (no mismatch); this effect then loads the saved lines. Renders
 * nothing. Mounted once, globally, from the root layout.
 */
export default function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
