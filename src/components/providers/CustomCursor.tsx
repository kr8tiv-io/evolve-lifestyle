"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Brand-reactive custom cursor. A precise neon dot plus a lagging alloy ring
 * that swells and lights when it nears links, buttons, or magnetic targets.
 * Desktop pointer devices only — never shown on touch or reduced-motion.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.5 });

  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target as HTMLElement;
      setActive(
        !!t.closest('a, button, [data-cursor="magnetic"], input, select, [role="button"]')
      );
    };
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.25s" }}
      aria-hidden
    >
      {/* precise dot */}
      <motion.div
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-neon"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* lagging ring */}
      <motion.div
        className="fixed left-0 top-0 rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: active ? 56 : 30,
          height: active ? 56 : 30,
          borderColor: active ? "rgba(0,255,65,0.9)" : "rgba(201,206,212,0.45)",
          boxShadow: active ? "0 0 24px rgba(0,255,65,0.45)" : "none",
          backgroundColor: active ? "rgba(0,255,65,0.06)" : "transparent",
          transition: "width 0.25s, height 0.25s, border-color 0.25s, box-shadow 0.25s, background-color 0.25s",
        }}
      />
    </div>
  );
}
