import { SquareKonbiniSetupWizard } from "@/components/square-konbini-setup-wizard"

export default function SquareKonbiniSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Square + コンビニ決済 実装ガイド</h1>
        <p className="text-gray-600">
          開業届不要で始められるSquareと、審査なしのコンビニ決済を組み合わせた最適な決済戦略です。
        </p>
      </div>

      <SquareKonbiniSetupWizard />

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Square の魅力</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>開業届不要で審査申請可能</li>
            <li>振込手数料完全無料</li>
            <li>翌営業日入金で資金繰り良好</li>
            <li>手数料3.25%（業界最安水準）</li>
            <li>占い・スピリチュアル業界でも多数利用実績</li>
          </ul>
        </div>

        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">🏪 コンビニ決済の魅力</h3>
          <ul className="list-disc list-inside space-y-1 text-green-700">
            <li>審査なし・即日利用開始</li>
            <li>クレジットカード不要</li>
            <li>日本人に馴染みのある決済方法</li>
            <li>未成年・学生でも利用可能</li>
            <li>現金決済の安心感</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
