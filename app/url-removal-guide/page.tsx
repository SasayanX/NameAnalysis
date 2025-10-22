import type { Metadata } from "next"
import { UrlRemovalGuide } from "@/components/url-removal-guide"

export const metadata: Metadata = {
  title: "URL削除ガイド | まいにち姓名判断",
  description: "Google Search ConsoleでのURL削除手順を詳しく解説します。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UrlRemovalGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">URL削除ガイド</h1>
          <p className="text-muted-foreground">
            Google Search Consoleで不要なページを効率的に削除する方法を解説します。
          </p>
        </div>

        <UrlRemovalGuide />
      </div>
    </div>
  )
}
