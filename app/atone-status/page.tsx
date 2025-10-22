import { AtoneWaitingDashboard } from "@/components/atone-waiting-dashboard"

export default function AtoneStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">atone申し込み状況</h1>
        <p className="text-gray-600">
          atoneの審査結果を待つ間に、並行して準備を進めて効率的に課金機能を実装しましょう。
        </p>
      </div>

      <AtoneWaitingDashboard />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 効率的な進め方</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>atone承認を待つ間にSquareの準備も並行して進める</li>
          <li>決済フォームのUI設計を先に完成させる</li>
          <li>サブスクリプション管理機能の設計を固める</li>
          <li>atone承認後は即座にAPI統合に着手</li>
          <li>Square審査も並行して進めて選択肢を増やす</li>
        </ul>
      </div>
    </div>
  )
}
