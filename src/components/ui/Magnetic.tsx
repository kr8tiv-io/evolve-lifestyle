"use client";

import { ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Magnetic hover — the element drifts toward the cursor, agency-style.
 * Wrap buttons, nav links, logo, the cart icon.
 */
export default function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
