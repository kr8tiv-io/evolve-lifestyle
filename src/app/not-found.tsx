import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-tracked-lg text-neon-soft">
        Off the map
      </p>
      <h1 className="mt-6 text-display font-medium uppercase tracking-tightest text-silver-bright">
        404
      </h1>
      <p className="mt-4 max-w-sm text-silver-dim">
        Where the signal dies, we come alive — but this page is genuinely lost
        to the bush.
      </p>
      <Link href="/" className="btn-neon mt-8">
        Back to base camp
      </Link>
    </div>
  );
}
