import { cn } from "@/lib/utils";

/**
 * EVOLVE wordmark — the REAL brand logo (metallic chrome / white transparent
 * PNGs) pulled from the Evolve "Logos & Media Kit" Drive folder.
 * Files live in /public/brand. Native aspect ratio is 3144 × 501 (≈6.275:1);
 * height is driven by `className` (e.g. h-5) with width auto.
 */
export default function EvolveLogo({
  className,
  variant = "chrome",
}: {
  className?: string;
  variant?: "chrome" | "white" | "silver" | "neon";
}) {
  const src =
    variant === "white" || variant === "neon"
      ? "/brand/evolve-wordmark-white.png"
      : "/brand/evolve-wordmark-chrome.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="EVOLVE"
      width={3144}
      height={501}
      loading="eager"
      decoding="async"
      className={cn("h-5 w-auto select-none object-contain", className)}
      draggable={false}
    />
  );
}
