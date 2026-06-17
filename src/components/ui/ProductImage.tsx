"use client";

import { useEffect, useRef, useState } from "react";
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
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cache race: a local/cached image can finish loading before React attaches
  // onLoad, so the event never fires. Check `complete` on mount and reveal it.
  // (Images are self-hosted, so a genuinely missing file fires onError
  // instantly — no time-based fallback needed, which would otherwise punish a
  // merely-slow connection by hiding an image that was about to arrive.)
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

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
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          style={{
            clipPath: loaded ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
            transition:
              "clip-path 1100ms cubic-bezier(0.16,1,0.3,1), transform 1400ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease",
          }}
          className={cn(
            "h-full w-full object-cover",
            loaded ? "scale-100 opacity-100" : "scale-[1.08] opacity-60",
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
