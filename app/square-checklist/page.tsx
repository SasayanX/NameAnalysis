import { SquareSetupChecklist } from "@/components/square-setup-checklist"

export default function SquareChecklistPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Square セットアップ チェックリスト</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Square Developer Console での設定項目をチェックリスト形式で管理します。
          各項目を完了したらチェックを入れてください。
        </p>
      </div>

      <SquareSetupChecklist />
    </div>
  )
}
