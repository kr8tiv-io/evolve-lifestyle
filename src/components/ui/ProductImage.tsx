"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image with an on-brand fallback. `fit="contain"` is used for the
 * background-removed product cutouts: the garment floats on a dramatic dark
 * branded backdrop (central aurora glow + vignette) instead of being cropped.
 * `fit="cover"` (default) is used for full-bleed stock/lifestyle imagery.
 */
export default function ProductImage({
  src,
  alt,
  tone,
  label,
  className,
  imgClassName,
  priority,
  fit = "cover",
  scene,
}: {
  src: string;
  alt: string;
  tone: [string, string];
  label?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  scene?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  const contain = fit === "contain";

  const fallbackBackdrop = `radial-gradient(120% 90% at 30% 10%, ${tone[0]}40, transparent 60%), linear-gradient(160deg, #0a0a0a, #050505)`;

  return (
    <div
      className={cn("relative overflow-hidden bg-void-800", className)}
      style={contain && scene ? undefined : { backgroundImage: fallbackBackdrop }}
    >
      {/* Canadian-landscape backdrop behind the product cutout */}
      {contain && scene && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scene} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          {/* light grade so the garment reads while the landscape stays vibrant */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,6,0.34)_0%,rgba(5,7,6,0.06)_40%,rgba(5,7,6,0.12)_64%,rgba(5,5,5,0.55)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_45%,transparent_55%,rgba(5,5,5,0.5)_100%)]" />
        </>
      )}
      {!failed &&
        (contain ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-contain p-[12%] transition-all duration-700 ease-evolve [filter:drop-shadow(0_26px_30px_rgba(0,0,0,0.6))]",
              loaded ? "scale-100 opacity-100" : "scale-95 opacity-0",
              imgClassName
            )}
          />
        ) : (
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
        ))}
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
