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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Lenis smooth-scroll defeats native loading="lazy" (below-fold images never
  // fetch). We keep the src in the SSR HTML (SEO) but drive the actual fetch with
  // an IntersectionObserver so images reliably load as they approach the viewport.
  const [nearView, setNearView] = useState(!!priority);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  useEffect(() => {
    if (nearView) return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearView(true);
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" }
    );
    io.observe(el);
    // Safety net: if intersection never fires (Lenis transform scroll, headless,
    // or a quirky browser), load anyway so an image can never stay invisible.
    const fallback = window.setTimeout(() => setNearView(true), 900);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [nearView]);

  // Drive the reveal by polling img.complete — the only signal that can't stall
  // (onLoad can be missed on cache hits; decode() can hang under a busy compositor).
  // Reads properties only, so it always resolves once the bytes are in.
  useEffect(() => {
    if (loaded || failed) return;
    let active = true;
    const check = () => {
      if (!active) return;
      const el = imgRef.current;
      if (!el) {
        window.setTimeout(check, 120);
        return;
      }
      if (el.complete) {
        if (el.naturalWidth > 0) setLoaded(true);
        else setFailed(true);
      } else {
        window.setTimeout(check, 120);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [loaded, failed, src]);

  const contain = fit === "contain";

  const fallbackBackdrop = `radial-gradient(120% 90% at 30% 10%, ${tone[0]}40, transparent 60%), linear-gradient(160deg, #0a0a0a, #050505)`;

  return (
    <div
      ref={wrapRef}
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
            loading={priority || nearView ? "eager" : "lazy"}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={cn(
              // fail-open: always visible; load state only eases a subtle settle
              "absolute inset-0 h-full w-full object-contain p-[12%] opacity-100 transition-transform duration-700 ease-evolve [filter:drop-shadow(0_26px_30px_rgba(0,0,0,0.6))]",
              loaded ? "scale-100" : "scale-[0.97]",
              imgClassName
            )}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={priority || nearView ? "eager" : "lazy"}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            style={{
              transition:
                "transform 1400ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease",
            }}
            className={cn(
              // fail-open: always visible (no clip-to-invisible); load eases a settle
              "h-full w-full object-cover opacity-100",
              loaded ? "scale-100" : "scale-[1.06]",
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
