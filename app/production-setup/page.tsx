import { ProductionSetupGuide } from "@/components/production-setup-guide"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "本番環境設定 | 姓名判断アプリ",
  description: "Square本番環境の設定とデプロイ準備",
}

export default function ProductionSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">本番環境設定</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          サンドボックステストが成功しました。本番環境の設定を行い、実際の課金機能を有効化します。
        </p>
      </div>

      <ProductionSetupGuide />
    </div>
  )
}
