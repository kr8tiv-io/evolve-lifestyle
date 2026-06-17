import { cn } from "@/lib/utils";

/**
 * Infinite tracked marquee. Duplicates content so the CSS translate loop is
 * seamless. Used for slogan ribbons between sections.
 */
export default function Marquee({
  items,
  className,
  speed = "default",
  separator = "✦",
}: {
  items: string[];
  className?: string;
  speed?: "default" | "slow";
  separator?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-7">{item}</span>
          <span className="text-neon/60">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden whitespace-nowrap",
        className
      )}
    >
      <div
        className={cn(
          "flex",
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee"
        )}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
