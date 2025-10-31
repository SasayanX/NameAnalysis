import type { MetadataRoute } from "next"
import { seoConfig } from "@/lib/seo-config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: "まいにちAI姓名判断",
    description: seoConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: seoConfig.themeColor,
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    categories: ["lifestyle", "entertainment"],
    lang: "ja",
    dir: "ltr",
    // TWA用設定
    display_override: ["window-controls-overlay"],
    edge_side_panel: {
      preferred_width: 400
    },
  }
}
