import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Baby, Target, Clock, TrendingUp } from "lucide-react"
import { getBabyNamingProgress, getHighPriorityFeatures, type BabyNamingFeature } from "@/lib/baby-naming-roadmap"

export function BabyNamingRoadmap() {
  const progress = getBabyNamingProgress()
  const highPriorityFeatures = getHighPriorityFeatures()

  const getPriorityColor = (priority: BabyNamingFeature["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPhaseColor = (phase: BabyNamingFeature["phase"]) => {
    switch (phase) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "development":
        return "bg-blue-100 text-blue-800"
      case "testing":
        return "bg-purple-100 text-purple-800"
      case "planning":
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* 命名判断機能の概要 */}
      <Card className="border-2 border-pink-200 bg-pink-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Baby className="h-6 w-6 text-pink-600" />
            <CardTitle className="text-pink-800">🍼 命名判断（赤ちゃん名付け）機能</CardTitle>
          </div>
          <CardDescription>苗字に最適な名前を自動生成し、最高の運勢を持つ赤ちゃんの名前を提案する機能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{progress.completionRate}%</div>
              <p className="text-sm text-muted-foreground">完成度</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalHours}h</div>
              <p className="text-sm text-muted-foreground">総開発時間</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.businessValue.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">ビジネス価値</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.total}</div>
              <p className="text-sm text-muted-foreground">機能数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 高優先度機能 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-600" />
            <CardTitle>🎯 優先実装機能</CardTitle>
          </div>
          <CardDescription>ビジネス価値が高く、早期実装が必要な機能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {highPriorityFeatures.map((feature) => (
              <div key={feature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                    <Badge className={getPhaseColor(feature.phase)}>{feature.phase}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{feature.estimatedHours}時間</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>価値: {feature.businessValue}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>複雑度: {feature.technicalComplexity}/10</span>
                  </div>
                </div>

                {feature.deliverables.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">成果物:</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.deliverables.map((deliverable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {deliverable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 実装予定 */}
      <Card>
        <CardHeader>
          <CardTitle>📋 実装フェーズ</CardTitle>
          <CardDescription>段階的な機能実装計画</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium">Phase 1: 基盤機能</h4>
                <p className="text-sm text-muted-foreground">命名エンジンのコア機能実装</p>
              </div>
              <Badge className="bg-red-100 text-red-800">45時間</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
              <div>
                <h4 className="font-medium">Phase 2: UI/UX</h4>
                <p className="text-sm text-muted-foreground">使いやすい名付けインターフェース</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">25時間</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
              <div>
                <h4 className="font-medium">Phase 3: 高度な条件設定</h4>
                <p className="text-sm text-muted-foreground">詳細な条件指定機能</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">30時間</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
              <div>
                <h4 className="font-medium">Phase 4: データベース強化</h4>
                <p className="text-sm text-muted-foreground">豊富な名前データベース構築</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">35時間</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50">
              <div>
                <h4 className="font-medium">Phase 5: プレミアム機能</h4>
                <p className="text-sm text-muted-foreground">AI分析とカスタマイズ機能</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">40時間</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
