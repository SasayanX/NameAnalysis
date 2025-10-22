import { DeploymentStatusChecker } from "@/components/deployment-status-checker"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "デプロイ状況確認 | 姓名判断アプリ",
  description: "Webhookエンドポイントのデプロイ状況を確認",
}

export default function DeploymentCheckPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">デプロイ状況確認</h1>
          <p className="text-gray-600">Webhookエンドポイントが正常にデプロイされているか確認します。</p>
        </div>

        <DeploymentStatusChecker />
      </div>
    </div>
  )
}
