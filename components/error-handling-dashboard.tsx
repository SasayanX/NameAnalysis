"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
import { auditCurrentErrorHandling, safeErrorHandlingImprovements } from "@/lib/error-handling-audit"

export function ErrorHandlingDashboard() {
  const audit = auditCurrentErrorHandling()

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "低":
        return "bg-green-100 text-green-800"
      case "中":
        return "bg-yellow-100 text-yellow-800"
      case "高":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "低":
        return "bg-blue-100 text-blue-800"
      case "中":
        return "bg-purple-100 text-purple-800"
      case "高":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-800">🛡️ エラーハンドリング現状診断</CardTitle>
          </div>
          <CardDescription>システム全体の安全性を保ちながら改善を進めるための診断結果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                既存のエラーハンドラー
              </h4>
              <div className="space-y-2">
                {audit.existingErrorHandlers.map((handler, index) => (
                  <div key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-400">
                    {handler}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                潜在的リスク
              </h4>
              <div className="space-y-2">
                {audit.potentialRisks.map((risk, index) => (
                  <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚀 安全な改善提案</CardTitle>
          <CardDescription>システムを壊すリスクを最小限に抑えた改善案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeErrorHandlingImprovements.map((improvement) => (
              <div key={improvement.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{improvement.title}</h4>
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRiskColor(improvement.risk)}>リスク: {improvement.risk}</Badge>
                    <Badge className={getImpactColor(improvement.impact)}>効果: {improvement.impact}</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">予想工数: {improvement.estimatedHours}時間</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>重要:</strong> エラーハンドリング強化は段階的に実装し、各段階で十分なテストを行ってください。
          一度に大きな変更を加えると、前回のようにシステム全体に影響する可能性があります。
        </AlertDescription>
      </Alert>
    </div>
  )
}
