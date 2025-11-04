import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/debug/",
          "/test/",
          "/private/",
          "/seo-analysis/",
          "/sitemap-check/",
          "/webhook-*",
          "/payment-*",
          "/square-*",
          "/production-*",
          "/sandbox-*",
          "/credential-*",
          "/environment-*",
          "/setup-*",
          "/completion-*",
          "/deployment-*",
          "/monetization-*",
          "/indexing-*",
          "/url-removal-*",
          "/csv-*",
          "/advanced-csv-*",
          "/baby-naming-validation/",
          "/stroke-fortune-list/",
          "/debug-stroke-data/",
          "/supervisor/",
          "/roadmap/",
          "/atone-status/",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web", "PerplexityBot", "YouBot"],
        disallow: "/",
      },
    ],
    sitemap: "https://seimei.app/sitemap.xml",
  }
}
