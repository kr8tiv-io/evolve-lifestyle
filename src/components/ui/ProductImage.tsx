"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image with an on-brand fallback. If the (swappable, royalty-free) stock URL
 * fails to load, it dissolves into the product's brand gradient + wordmark so
 * the grid NEVER looks broken. Real product photography drops straight in.
 */
export default function ProductImage({
  src,
  alt,
  tone,
  label,
  className,
  imgClassName,
  priority,
}: {
  src: string;
  alt: string;
  tone: [string, string];
  label?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Robustness: if the (swappable, external) stock image hasn't loaded within
  // a window, fall back to the brand gradient. Unmounting the <img> also
  // aborts a hung request, so a slow/offline network never leaves a blank hole.
  useEffect(() => {
    if (loaded || failed) return;
    const t = setTimeout(() => setFailed(true), 4500);
    return () => clearTimeout(t);
  }, [loaded, failed]);

  return (
    <div
      className={cn("relative overflow-hidden bg-void-800", className)}
      style={{
        backgroundImage: `radial-gradient(120% 90% at 30% 10%, ${tone[0]}40, transparent 60%), linear-gradient(160deg, #0a0a0a, #050505)`,
      }}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-[1200ms] ease-evolve",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
            imgClassName
          )}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span
            className="font-medium uppercase tracking-[0.3em] text-silver/80"
            style={{ fontSize: "clamp(1rem,2vw,1.6rem)" }}
          >
            EVOLVE
          </span>
          {label && (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-neon-soft">
              {label}
            </span>
          )}
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage: `radial-gradient(80% 60% at 50% 120%, ${tone[1]}30, transparent 70%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
