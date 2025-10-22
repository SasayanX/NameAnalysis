import type { Metadata } from "next"
import { IndexingAccelerator } from "@/components/indexing-accelerator"

export const metadata: Metadata = {
  title: "インデックス促進ツール | まいにち姓名判断",
  description: "Google検索でのインデックス状況を確認し、検索結果への表示を促進するためのツールです。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function IndexingHelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">インデックス促進ツール</h1>
          <p className="text-muted-foreground">
            Google検索での表示を促進するための緊急対応ツールです。各ページを個別にインデックス登録リクエストしてください。
          </p>
        </div>

        <IndexingAccelerator />
      </div>
    </div>
  )
}
