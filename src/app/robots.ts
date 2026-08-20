import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE_AREAS = ["/admin", "/login", "/api", "/newsletter"];

// Explicit group for AI crawlers: `*` already allows them today, but naming
// them declares intent and survives a future tightening of the `*` group.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_AREAS,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: PRIVATE_AREAS,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
