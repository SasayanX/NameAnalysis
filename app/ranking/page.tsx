"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trophy, Sparkles } from "lucide-react"
import { fetchSeasonRanking, getCurrentSeasonKey, type RankingEntry } from "@/lib/ranking-repo"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export default function RankingPage() {
  const [season, setSeason] = useState<string>(getCurrentSeasonKey())
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { user } = useAuth()

  const seasonOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return [
      `${y}_spring`,
      `${y}_summer`,
      `${y}_autumn`,
      `${y}_winter`,
    ]
  }, [])

  useEffect(() => {
    setLoading(true)
    setError("")
    fetchSeasonRanking(season)
      .then(setEntries)
      .catch((e) => setError(e.message || "ランキングの取得に失敗しました"))
      .finally(() => setLoading(false))
  }, [season])


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" /> おなまえ格付けランキング
          </CardTitle>
          <CardDescription>四季ごとのランキングを表示します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">シーズン</span>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="シーズンを選択" />
              </SelectTrigger>
              <SelectContent>
                {seasonOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              読み込み中...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {user && (
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      重要
                    </Badge>
                    <div className="text-sm font-medium">ランキング登録について</div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>ランキングへの登録は、<strong>姓名判断システムを通じてのみ</strong>可能です。</p>
                    <p>不正防止のため、このページからの直接登録はできません。</p>
                    <p className="mt-2">
                      <Link href="/" className="text-primary underline hover:no-underline">
                        → 姓名判断を実行してランキングに登録
                      </Link>
                    </p>
                  </div>
                </div>
              )}
              {entries.length === 0 && (
                <div className="text-sm text-muted-foreground">このシーズンのエントリーはまだありません。</div>
              )}

              <ol className="space-y-2">
                {entries.map((e, i) => (
                  <li key={e.id} className="p-3 rounded-md border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{e.rank ?? i + 1}</Badge>
                      <div>
                        <div className="font-medium text-sm">{e.name}</div>
                        <div className="text-xs text-muted-foreground">パワースコア {e.power_score} / 季節+{e.seasonal_bonus}% / アイテム+{e.item_bonus}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold">{e.total_score}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


