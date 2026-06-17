"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Cinematic page transition: a Boreal Void curtain wipes up over the
 * outgoing route, then peels away to reveal the next. Content also
 * fades/rises in. Respects reduced-motion via Framer's defaults.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Curtain — covers, then lifts away to reveal the new route */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-void"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.87, 0, 0.13, 1] }}
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-neon/70">
            EVOLVE
          </span>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
