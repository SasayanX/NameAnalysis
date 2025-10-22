import { SEOEmergencyChecker } from "@/components/seo-emergency-checker"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo-config"

export const metadata = generateSEOMetadata({
  title: "SEO緊急診断",
  description: "Google Search Consoleでアクセスがゼロの原因を特定する緊急診断ツール",
  noIndex: true,
})

export default function SEOEmergencyCheckPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">SEO緊急診断</h1>
          <p className="text-gray-600">Google Search Consoleで値が全てゼロの原因を特定し、対処法を提案します。</p>
        </div>

        <SEOEmergencyChecker />

        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-3">最も可能性の高い原因</h2>
          <div className="space-y-2 text-sm text-red-700">
            <p>
              <strong>1. robots.txtの問題:</strong> サイト全体がクロールをブロックされている
            </p>
            <p>
              <strong>2. noindexタグ:</strong> ページがインデックスされないよう設定されている
            </p>
            <p>
              <strong>3. サイトマップの問題:</strong> Googleにサイトの構造が伝わっていない
            </p>
            <p>
              <strong>4. 技術的エラー:</strong> サーバーエラーやアクセス不可
            </p>
            <p>
              <strong>5. 新しいサイト:</strong> インデックスに時間がかかっている
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
