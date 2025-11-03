"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Coins,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { getPointTransactions, getPointStatistics, type PointTransaction, type PointStatistics } from "@/lib/kanau-points-supabase"

const CATEGORY_LABELS: Record<string, string> = {
  login_bonus: "ログインボーナス",
  ranking_reward: "ランキング報酬",
  ranking_entry: "ランキング登録",
  special_reward: "機能実行ボーナス",
  purchase: "購入",
}

const CATEGORY_COLORS: Record<string, string> = {
  login_bonus: "bg-blue-100 text-blue-800 border-blue-200",
  ranking_reward: "bg-purple-100 text-purple-800 border-purple-200",
  ranking_entry: "bg-yellow-100 text-yellow-800 border-yellow-200",
  special_reward: "bg-green-100 text-green-800 border-green-200",
  purchase: "bg-red-100 text-red-800 border-red-200",
}

export function PointHistory() {
  const { user: authUser } = useAuth()
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [statistics, setStatistics] = useState<PointStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"history" | "statistics">("history")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  useEffect(() => {
    if (authUser) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [authUser, page])

  const loadData = async () => {
    if (!authUser) return
    
    setIsLoading(true)
    try {
      const [txs, stats] = await Promise.all([
        getPointTransactions(authUser.id, limit, page * limit),
        getPointStatistics(authUser.id, 30),
      ])
      
      if (page === 0) {
        setTransactions(txs)
      } else {
        setTransactions((prev) => [...prev, ...txs])
      }
      
      setHasMore(txs.length === limit)
      setStatistics(stats)
    } catch (error) {
      console.error("ポイント履歴の読み込みエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `今日 ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `昨日 ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  if (!authUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ポイント履歴</CardTitle>
          <CardDescription>ログインが必要です</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          ポイント履歴・統計
        </CardTitle>
        <CardDescription>ポイントの獲得・消費履歴と統計情報を確認できます</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "history" | "statistics")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">履歴</TabsTrigger>
            <TabsTrigger value="statistics">統計</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {isLoading && transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                履歴がありません
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          tx.type === "earn" 
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" 
                            : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {tx.type === "earn" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{tx.reason}</span>
                            <Badge className={CATEGORY_COLORS[tx.category] || "bg-gray-100 text-gray-800"}>
                              {CATEGORY_LABELS[tx.category] || tx.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tx.created_at)}
                          </div>
                        </div>
                        <div className={`font-semibold text-lg ${
                          tx.type === "earn" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "earn" ? "+" : "-"}{tx.amount} KP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        読み込み中...
                      </>
                    ) : (
                      "もっと見る"
                    )}
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {isLoading || !statistics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* 統計サマリー */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-500 mb-1">現在の残高</div>
                      <div className="text-2xl font-bold text-green-600">
                        {statistics.currentBalance.toLocaleString()} KP
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-500 mb-1">総獲得</div>
                      <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                        <TrendingUp className="h-5 w-5" />
                        {statistics.totalEarned.toLocaleString()} KP
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-500 mb-1">総消費</div>
                      <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-5 w-5" />
                        {statistics.totalSpent.toLocaleString()} KP
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-500 mb-1">取引回数</div>
                      <div className="text-2xl font-bold">
                        {statistics.transactionCount} 回
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* カテゴリ別集計 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">カテゴリ別集計（過去30日）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(statistics.byCategory).length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          データがありません
                        </div>
                      ) : (
                        Object.entries(statistics.byCategory)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, amount]) => (
                            <div key={category} className="flex items-center justify-between p-2 border rounded">
                              <Badge className={CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800"}>
                                {CATEGORY_LABELS[category] || category}
                              </Badge>
                              <span className="font-semibold">{amount.toLocaleString()} KP</span>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 日別推移 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">日別推移（過去30日）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statistics.byDay.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        データがありません
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {statistics.byDay.map((day) => (
                          <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                            <div className="text-sm">
                              {new Date(day.date).toLocaleDateString("ja-JP", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-green-600">
                                <ArrowUp className="h-3 w-3" />
                                <span className="text-sm">{day.earned} KP</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-600">
                                <ArrowDown className="h-3 w-3" />
                                <span className="text-sm">{day.spent} KP</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

