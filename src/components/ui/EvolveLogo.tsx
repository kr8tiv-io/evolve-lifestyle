import { cn } from "@/lib/utils";

/**
 * EVOLVE wordmark — clean metallic-silver letterform placeholder.
 * Swap for the real chrome/white logo from the Drive "Evolve Logos & Media
 * Kit" by dropping it at /public/brand/evolve-logo.svg and rendering an <img>.
 * Built as inline SVG so it scales crisp and inherits the alloy-silver gradient.
 */
export default function EvolveLogo({
  className,
  variant = "silver",
}: {
  className?: string;
  variant?: "silver" | "neon" | "white";
}) {
  const fill =
    variant === "neon" ? "#00ff41" : variant === "white" ? "#f3f4f6" : "url(#alloy)";
  return (
    <svg
      viewBox="0 0 360 56"
      className={cn("h-5 w-auto", className)}
      role="img"
      aria-label="EVOLVE"
    >
      <defs>
        <linearGradient id="alloy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="45%" stopColor="#c9ced4" />
          <stop offset="55%" stopColor="#8a9099" />
          <stop offset="100%" stopColor="#dfe3e7" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="44"
        fill={fill}
        style={{
          fontFamily: "var(--font-neue)",
          fontWeight: 700,
          fontSize: "52px",
          letterSpacing: "0.14em",
        }}
      >
        EVOLVE
      </text>
    </svg>
  );
}
