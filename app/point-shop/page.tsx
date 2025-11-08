"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Sparkles, Star, Gift, Coins, Zap, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PointShopPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* メインヘッダー */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ShoppingBag className="h-20 w-20 text-primary animate-pulse" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          ポイントショップ
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          まもなくオープン予定
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Clock className="h-5 w-5" />
          <span className="font-medium">準備中です</span>
        </div>
      </div>

      {/* メインカード */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 mb-8">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl md:text-3xl mb-4 flex items-center justify-center gap-3">
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            <span>素敵なアイテムが登場予定</span>
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
          </CardTitle>
          <CardDescription className="text-lg">
            獲得したKP（凶烏ポイント）を使って、特別なアイテムを交換できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 予定されている機能 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/10">
                <Gift className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">レアカード</h3>
                  <p className="text-sm text-muted-foreground">
                    特別なデザインのレアカードを獲得できます
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/10">
                <Coins className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">ポイント交換</h3>
                  <p className="text-sm text-muted-foreground">
                    KPを使って様々な特典と交換できます
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/10">
                <Zap className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">限定アイテム</h3>
                  <p className="text-sm text-muted-foreground">
                    期間限定の特別なアイテムが登場します
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/10">
                <Sparkles className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">プレミアム特典</h3>
                  <p className="text-sm text-muted-foreground">
                    高額ポイントで豪華な特典を手に入れられます
                  </p>
                </div>
              </div>
            </div>

            {/* メッセージ */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
              <p className="text-center text-lg font-medium mb-2">
                🎉 オープンまで、もう少しお待ちください！
              </p>
              <p className="text-center text-muted-foreground">
                日々のログインやアクションでKPを貯めて、オープン時に備えましょう
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="default" size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
          <Link href="/kanau-points">
            <Coins className="h-5 w-5 mr-2" />
            KPを確認する
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Sparkles className="h-5 w-5 mr-2" />
            ホームに戻る
          </Link>
        </Button>
      </div>

      {/* お知らせ */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          オープン情報は、公式Twitterやサイト内のお知らせでお伝えします
        </p>
      </div>
    </div>
  )
}


