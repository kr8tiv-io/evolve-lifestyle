"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EvolveLogo from "@/components/ui/EvolveLogo";

/**
 * First-load cinematic curtain. Counts 0 → 100 while the hero mounts; the
 * wordmark charges from dim to a neon glow, then the curtain lifts. Shows once
 * per session and is hard-capped so it can never hang.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("evolve-loaded")) {
      setDone(true);
      return;
    }
    const finish = () => {
      sessionStorage.setItem("evolve-loaded", "1");
      setDone(true);
    };
    let n = 0;
    const id = setInterval(() => {
      n += Math.floor(Math.random() * 8) + 4;
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setTimeout(finish, 460);
      }
      setCount(n);
    }, 85);
    // hard time cap — never hangs past ~3.2s
    const cap = setTimeout(() => {
      clearInterval(id);
      setCount(100);
      finish();
    }, 3200);
    return () => {
      clearInterval(id);
      clearTimeout(cap);
    };
  }, []);

  const charge = count / 100;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.87, 0, 0.13, 1] }}
        >
          {/* ambient charge glow behind the mark */}
          <div
            className="pointer-events-none absolute h-64 w-64 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,255,65,0.18), transparent 70%)",
              opacity: charge,
            }}
          />
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.28em" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{ filter: `drop-shadow(0 0 ${charge * 26}px rgba(0,255,65,${charge * 0.6}))` }}
          >
            <EvolveLogo variant="white" className="h-7 sm:h-10" />
          </motion.div>
          <span className="relative mt-3 font-mono text-[0.65rem] uppercase tracking-[0.4em] text-neon-soft">
            Prairies to Peaks
          </span>

          <div className="tnum absolute bottom-10 right-6 font-mono text-5xl text-silver/20 sm:right-12 sm:text-7xl">
            {String(count).padStart(3, "0")}
          </div>
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-neon shadow-[0_0_12px_rgba(0,255,65,0.7)]"
            style={{ width: `${count}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
