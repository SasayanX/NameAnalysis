import { ProductionReadyChecker } from "@/components/production-ready-checker"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "本番環境準備完了 | 姓名判断アプリ",
  description: "Square本番環境の最終設定とデプロイ準備",
}

export default function ProductionReadyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">本番環境準備</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          本番認証情報が設定されました。残りの設定を完了してマネタイズ機能を有効化します。
        </p>
      </div>

      <ProductionReadyChecker />
    </div>
  )
}
