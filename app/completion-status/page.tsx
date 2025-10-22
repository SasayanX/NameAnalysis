import { CompletionStatusDashboard } from "@/components/completion-status-dashboard"

export default function CompletionStatusPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">プロジェクト完成状況</h1>
        <p className="text-muted-foreground">Square Webhook決済システムの実装状況を確認できます</p>
      </div>
      <CompletionStatusDashboard />
    </div>
  )
}
