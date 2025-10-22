import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, Trophy, Coins, Calendar, Target } from "lucide-react"
import {
  getGamificationProgress,
  getPointEconomyBalance,
  gamificationRoadmap,
  omamoriBenefits,
  type GamificationFeature,
} from "@/lib/gamification-roadmap"

export function GamificationRoadmap() {
  const progress = getGamificationProgress()
  const economy = getPointEconomyBalance()

  const getPriorityColor = (priority: GamificationFeature["priority"]) => {
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

  const getPhaseColor = (phase: GamificationFeature["phase"]) => {
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
      {/* ゲーミフィケーション概要 */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-yellow-800">🎮 ゲーミフィケーション機能</CardTitle>
          </div>
          <CardDescription>
            ログインボーナス・ポイントシステム・お守りショップでユーザーエンゲージメント向上
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{progress.completionRate}%</div>
              <p className="text-sm text-muted-foreground">完成度</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalHours}h</div>
              <p className="text-sm text-muted-foreground">総開発時間</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.avgEngagement.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">エンゲージメント</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.total}</div>
              <p className="text-sm text-muted-foreground">機能数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ポイント経済システム */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <CardTitle>💰 ポイント経済システム</CardTitle>
          </div>
          <CardDescription>ポイント獲得と消費のバランス設計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">📈 1日の獲得ポイント</h4>
              <div className="space-y-2">
                {economy.dailyEarnings.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">{item.source}</span>
                    <Badge className="bg-green-100 text-green-800">{item.points}pt</Badge>
                  </div>
                ))}
                <div className="flex justify-between items-center p-2 bg-green-100 rounded font-medium">
                  <span>合計</span>
                  <Badge className="bg-green-600 text-white">{economy.dailyTotal}pt</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">🛍️ お守り価格設定</h4>
              <div className="space-y-2">
                {economy.omamorPrices.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">{item.rarity}</span>
                    <Badge className="bg-blue-100 text-blue-800">{item.price}pt</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>• レアお守り獲得まで: {economy.daysForRareOmamori}日</p>
                <p>• ウルトラレア獲得まで: {economy.daysForUltraRare}日</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* お守りの種類と効果 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-purple-600" />
            <CardTitle>🎯 お守りの種類と効果</CardTitle>
          </div>
          <CardDescription>各カテゴリーのお守りとその効果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {omamoriBenefits.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-center">{category.category}</h4>
                <div className="space-y-2">
                  {category.omamori.map((omamori, oIndex) => (
                    <div key={oIndex} className="text-sm">
                      <div className="font-medium text-purple-700">{omamori}</div>
                      <div className="text-muted-foreground text-xs">{category.effects[oIndex]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 開発ロードマップ */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>📅 開発ロードマップ</CardTitle>
          </div>
          <CardDescription>段階的な機能実装計画</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gamificationRoadmap.map((feature) => (
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

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{feature.estimatedHours}時間</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span>価値: {feature.businessValue}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>エンゲージメント: {feature.userEngagement}/10</span>
                  </div>
                </div>

                {feature.deliverables.length > 0 && (
                  <div className="mb-3">
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

                {feature.pointRewards && (
                  <div>
                    <p className="text-sm font-medium mb-2">ポイント報酬:</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.pointRewards.map((reward, index) => (
                        <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                          {reward.action}: {reward.points}pt
                          {reward.dailyLimit && ` (上限${reward.dailyLimit}pt/日)`}
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
    </div>
  )
}
