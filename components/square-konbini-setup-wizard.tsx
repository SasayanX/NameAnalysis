"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, CreditCard, Store, Zap, Shield } from "lucide-react"
import { SQUARE_KONBINI_STRATEGY } from "@/lib/square-konbini-setup"

export function SquareKonbiniSetupWizard() {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const getPhaseProgress = (phase: 1 | 2 | 3) => {
    const phaseKey = `phase${phase}` as keyof typeof SQUARE_KONBINI_STRATEGY.strategy
    const phaseData = SQUARE_KONBINI_STRATEGY.strategy[phaseKey]
    const totalTasks = phaseData.actions.length
    const completedInPhase = completedTasks.filter((task) => phaseData.actions.includes(task)).length
    return (completedInPhase / totalTasks) * 100
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 戦略概要 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5" />
            Square最優先戦略（占い系に最適）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800">Square（最優先）</h3>
                <p className="text-sm text-green-700">開業届不要・手数料3.25%・振込手数料無料</p>
                <Badge className="mt-1 bg-green-600">占い系実績多数</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">コンビニ決済（補完）</h3>
                <p className="text-sm text-gray-600">クレカ未対応ユーザー向け</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フェーズ選択 */}
      <div className="flex gap-2">
        {[1, 2, 3].map((phase) => (
          <Button
            key={phase}
            variant={currentPhase === phase ? "default" : "outline"}
            onClick={() => setCurrentPhase(phase as 1 | 2 | 3)}
            className="flex-1"
          >
            フェーズ {phase}
            <Badge className="ml-2" variant={currentPhase === phase ? "secondary" : "outline"}>
              {Math.round(getPhaseProgress(phase as 1 | 2 | 3))}%
            </Badge>
          </Button>
        ))}
      </div>

      {/* 現在のフェーズ */}
      {[1, 2, 3].map((phase) => {
        if (currentPhase !== phase) return null
        const phaseKey = `phase${phase}` as keyof typeof SQUARE_KONBINI_STRATEGY.strategy
        const phaseData = SQUARE_KONBINI_STRATEGY.strategy[phaseKey]

        return (
          <Card key={phase}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{phaseData.title}</CardTitle>
                <Badge>{phaseData.duration}</Badge>
              </div>
              <Progress value={getPhaseProgress(phase as 1 | 2 | 3)} className="w-full" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{phaseData.goal}</p>
              <div className="space-y-3">
                {phaseData.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleTask(action)}
                  >
                    {completedTasks.includes(action) ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={completedTasks.includes(action) ? "line-through text-gray-500" : ""}>
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* 実装優先順位 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            実装優先順位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SQUARE_KONBINI_STRATEGY.implementation_priority.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <Badge className="bg-blue-600">{item.priority}</Badge>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.task}</h3>
                  <p className="text-sm text-gray-600">{item.reason}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    工数: {item.effort}
                  </Badge>
                  <br />
                  <Badge variant="outline">効果: {item.impact}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 手数料比較 */}
      <Card>
        <CardHeader>
          <CardTitle>手数料比較（月売上5万円の場合）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">Square のみ</h3>
              <p className="text-2xl font-bold">¥1,625</p>
              <p className="text-sm text-gray-600">実質手数料率: 3.25%</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">コンビニ のみ</h3>
              <p className="text-2xl font-bold">¥2,750</p>
              <p className="text-sm text-gray-600">実質手数料率: 5.5%</p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h3 className="font-semibold text-yellow-600">混合戦略</h3>
              <p className="text-2xl font-bold">¥1,962</p>
              <p className="text-sm text-gray-600">実質手数料率: 3.92%</p>
              <p className="text-xs text-gray-500">Square 70% + コンビニ 30%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 次のアクション */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🚀 今すぐできること</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => window.open("https://squareup.com/jp/ja", "_blank")}>
              Square 公式サイトで詳細確認
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.open("https://atone.be/", "_blank")}>
              atone（コンビニ決済）公式サイト確認
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
