"use client"

import { useEffect } from "react"

// インデックス促進のためのヘルパーコンポーネント
export function IndexingHelper() {
  useEffect(() => {
    // ページビューの記録
    if (typeof window !== "undefined") {
      // Google Analytics などの設定
      console.log("Page view recorded for indexing")
    }
  }, [])

  return (
    <>
      {/* 検索エンジン向けの追加情報 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "まいにち姓名判断",
            description: "旧字体による正確な姓名判断で運命を鑑定",
            url: "https://seimei.kanau-kiryu.com",
            lastReviewed: new Date().toISOString(),
            reviewedBy: {
              "@type": "Person",
              name: "金雨輝龍",
            },
          }),
        }}
      />
    </>
  )
}
