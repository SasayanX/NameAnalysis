"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trophy, Sparkles } from "lucide-react"
import { fetchSeasonRanking, getCurrentSeasonKey, type RankingEntry, submitRankingEntry, submitRankingEntryFromNameAnalysis } from "@/lib/ranking-repo"
import { getOrCreatePointsSummary } from "@/lib/kanau-points-supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export default function RankingPage() {
  const [season, setSeason] = useState<string>(getCurrentSeasonKey())
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [entryName, setEntryName] = useState("")
  const [entryPower, setEntryPower] = useState<number>(70)
  const [submitting, setSubmitting] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
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

  useEffect(() => {
    if (user) {
      getOrCreatePointsSummary(user.id)
        .then((s) => setPoints(s.points || 0))
        .catch(() => {})
    }
  }, [user])

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
                <div className="p-3 border rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">ランキングに登録（5Kp消費）</div>
                    {points !== null && (
                      <div className="text-sm text-muted-foreground">所持ポイント: {points}Kp</div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input placeholder="名前（例: 陽翔）" value={entryName} onChange={(e) => setEntryName(e.target.value)} />
                    <Input type="number" min={1} max={100} value={entryPower} onChange={(e) => setEntryPower(Number(e.target.value))} placeholder="パワースコア" />
                    <Button disabled={!entryName || submitting || (points !== null && points < 5)} onClick={async () => {
                      try {
                        setSubmitting(true)
                        await submitRankingEntry(user.id, entryName, entryPower)
                        // 再読込
                        const list = await fetchSeasonRanking(season)
                        setEntries(list)
                        setEntryName("")
                        const updated = await getOrCreatePointsSummary(user.id)
                        setPoints(updated.points || 0)
                      } catch (e: any) {
                        setError(e.message || "登録に失敗しました")
                      } finally {
                        setSubmitting(false)
                      }
                    }}>登録</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {points !== null && points < 5 && (
                      <span className="text-red-600">
                        ※ ポイントが不足しています。まず<Link href="/kanau-points" className="underline">ログインボーナス</Link>を受け取ってください。
                      </span>
                    )}
                    {points !== null && points >= 5 && "季節の漢字を含むと+10%（例: 春/夏/秋/冬/桜/陽/紅/雪 など）。アイテム所持で更に最大+50%。"}
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


