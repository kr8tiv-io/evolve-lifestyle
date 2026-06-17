"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * First-load cinematic curtain. Counts 0 → 100 while the hero mounts,
 * then splits and lifts to reveal the site. Shows once per session.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("evolve-loaded")) {
      setDone(true);
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += Math.floor(Math.random() * 8) + 3;
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setTimeout(() => {
          sessionStorage.setItem("evolve-loaded", "1");
          setDone(true);
        }, 480);
      }
      setCount(n);
    }, 90);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.87, 0, 0.13, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.28em" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-silver-bright"
          >
            <span className="text-2xl font-medium uppercase tracking-[0.28em] sm:text-4xl">
              EVOLVE
            </span>
          </motion.div>
          <span className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.4em] text-neon-soft">
            Prairies to Peaks
          </span>

          <div className="absolute bottom-10 right-6 font-mono text-5xl tabular-nums text-silver/20 sm:right-12 sm:text-7xl">
            {String(count).padStart(3, "0")}
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] bg-neon" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
