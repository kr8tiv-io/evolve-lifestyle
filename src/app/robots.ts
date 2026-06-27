import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Allow all crawlers, and EXPLICITLY welcome AI answer-engine crawlers so the
// brand and the Evolve Journal can surface in ChatGPT, Perplexity, Google AI
// Overviews, Claude, and Apple Intelligence. Purely additive — nothing blocked.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: "/" })),
    ],
    sitemap: "https://evolveapparel.shop/sitemap.xml",
    host: "https://evolveapparel.shop",
  };
}
