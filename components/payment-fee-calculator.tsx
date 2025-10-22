"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react"
import { PAYMENT_PROVIDERS, calculateMonthlyCost, RECOMMENDED_BY_SALES } from "@/lib/payment-provider-comparison"

export function PaymentFeeCalculator() {
  const [monthlySales, setMonthlySales] = useState<number>(50000)
  const [transactionCount, setTransactionCount] = useState<number>(100)

  const results = PAYMENT_PROVIDERS.map((provider) => ({
    provider,
    cost: calculateMonthlyCost(provider, monthlySales, transactionCount),
  })).sort((a, b) => a.cost.totalCost - b.cost.totalCost)

  const getSalesCategory = (sales: number) => {
    if (sales < 10000) return "月売上 1万円未満"
    if (sales < 50000) return "月売上 1-5万円"
    if (sales < 200000) return "月売上 5-20万円"
    return "月売上 20万円以上"
  }

  const recommendation = RECOMMENDED_BY_SALES[getSalesCategory(monthlySales)]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 計算機 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            手数料シミュレーター
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sales">月間売上（円）</Label>
              <Input
                id="sales"
                type="number"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="transactions">月間取引件数</Label>
              <Input
                id="transactions"
                type="number"
                value={transactionCount}
                onChange={(e) => setTransactionCount(Number(e.target.value))}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推奨プロバイダー */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            あなたの売上規模での推奨
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">{recommendation.推奨}</p>
              <p className="text-sm text-green-600">{recommendation.理由}</p>
            </div>
            <Badge className="bg-green-600">{getSalesCategory(monthlySales)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 比較結果 */}
      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={result.provider.name} className={index === 0 ? "border-blue-500 bg-blue-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {result.provider.name}
                  {index === 0 && <Badge className="bg-blue-600">最安</Badge>}
                  {result.provider.開業届必要 && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      開業届必須
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-right">
                  <p className="text-2xl font-bold">¥{result.cost.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">実質手数料率: {result.cost.effectiveRate.toFixed(2)}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">基本手数料</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Visa/Mastercard:</span>
                      <span>{result.provider.transactionFees.visa_mastercard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>JCB:</span>
                      <span>{result.provider.transactionFees.jcb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>American Express:</span>
                      <span>{result.provider.transactionFees.amex}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">追加費用</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>振込手数料:</span>
                      <span>{result.provider.additionalFees.transferFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>チャージバック:</span>
                      <span>{result.provider.additionalFees.chargebackFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>入金サイクル:</span>
                      <span>{result.provider.settlementCycle}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  隠れたコスト・注意点
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {result.provider.隠れたコスト.map((cost, i) => (
                    <li key={i}>{cost}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">特徴</h4>
                <div className="flex flex-wrap gap-2">
                  {result.provider.特徴.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t bg-gray-50 p-3 rounded">
                <h4 className="font-semibold mb-2">月間コスト内訳</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">決済手数料</p>
                    <p className="font-semibold">¥{result.cost.transactionFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">振込手数料</p>
                    <p className="font-semibold">¥{result.cost.transferFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">合計</p>
                    <p className="font-semibold text-lg">¥{result.cost.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
