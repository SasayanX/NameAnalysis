import type { Metadata } from "next"
import { SitemapValidator } from "@/components/sitemap-validator"

export const metadata: Metadata = {
  title: "サイトマップ検証ツール | まいにち姓名判断",
  description: "サイトマップの内容を確認し、Google Search Consoleでの検出状況を監視するツールです。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SitemapCheckPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">サイトマップ検証ツール</h1>
          <p className="text-muted-foreground">
            現在のサイトマップ内容を確認し、Google Search Consoleでの検出状況を監視します。
          </p>
        </div>

        <SitemapValidator />
      </div>
    </div>
  )
}
