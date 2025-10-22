import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calculator, TrendingUp } from "lucide-react"

export function ClimateDecisionHelper() {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          Stripe Climate 寄付率について
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold">最低寄付率：0.5%</h3>
          </div>
          <div className="text-sm space-y-1">
            <p>
              • 月売上 ¥100,000 → <strong>¥500/月</strong> の寄付
            </p>
            <p>
              • 月売上 ¥200,000 → <strong>¥1,000/月</strong> の寄付
            </p>
            <p>
              • 年売上 ¥1,200,000 → <strong>¥6,000/年</strong> の寄付
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold text-green-800">推奨タイミング</h3>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 月間売上が¥300,000以上安定した時</li>
            <li>• 利益率が20%以上確保できた時</li>
            <li>• 事業が軌道に乗って余裕ができた時</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <strong>今はスキップして、事業が安定してから検討しましょう！</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">※後からいつでも設定できます</p>
        </div>
      </CardContent>
    </Card>
  )
}
