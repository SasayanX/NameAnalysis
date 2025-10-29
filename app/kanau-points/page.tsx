"use client"

import { useState } from "react"
import { KanauPointsDisplay } from "@/components/kanau-points-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Coins, 
  Gift, 
  Trophy, 
  Calendar,
  Star,
  Info
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function KanauPointsPage() {
  const [userId] = useState("demo_user_001") // デモ用の固定ユーザーID

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">カナウポイントシステム</h1>
          <p className="text-muted-foreground">
            あなたの名に宿る「叶う力」を数値化し、ランキングで競い合おう
          </p>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="points" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points">ポイント</TabsTrigger>
            <TabsTrigger value="ranking">ランキング</TabsTrigger>
            <TabsTrigger value="info">システム情報</TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-4">
            <KanauPointsDisplay userId={userId} />
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  おなまえ格付けランキング
                </CardTitle>
                <CardDescription>
                  5カナウポイントを消費してランキングに参加しよう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    ランキングシステムは現在開発中です。近日公開予定！
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* ログインボーナス情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    ログインボーナス
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>基本報酬:</span>
                      <Badge variant="outline">1Kp/日</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>連続ボーナス:</span>
                      <Badge variant="outline">最大100Kp/日</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>特別報酬:</span>
                      <Badge variant="outline">5,10,14,21,30,50,100日目</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ランキング情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    ランキング参加
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>参加費用:</span>
                      <Badge variant="outline">5Kp</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>ランキング周期:</span>
                      <Badge variant="outline">四季制</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>最高報酬:</span>
                      <Badge variant="outline">500Kp</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 特別アイテム情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    特別アイテム
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">護符</Badge>
                      <span>姓名判断スコア向上</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">石・鱗片</Badge>
                      <span>ランキング季節ボーナス向上</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">宝珠・結晶</Badge>
                      <span>ランキング季節ボーナス大幅向上</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* システム情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    システム情報
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>通貨:</span>
                      <span>カナウポイント (Kp)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>データ保存:</span>
                      <span>ローカルストレージ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>更新頻度:</span>
                      <span>リアルタイム</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
