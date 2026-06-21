/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  // Static export (out/) for static hosts like Hostinger — gated by an env flag
  // so the normal `next build` + `next start` (tunnel) path is unaffected.
  output: process.env.NEXT_EXPORT === "1" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
