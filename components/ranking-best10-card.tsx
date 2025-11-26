"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { fetchSeasonRanking, getCurrentSeasonKey, type RankingEntry } from "@/lib/ranking-repo"

/**
 * 季節名を日本語で返す
 */
function getSeasonNameKanji(seasonKey: string): string {
  if (seasonKey.includes("spring")) return "春"
  if (seasonKey.includes("summer")) return "夏"
  if (seasonKey.includes("autumn")) return "秋"
  if (seasonKey.includes("winter")) return "冬"
  return "春" // デフォルト
}

/**
 * 全国おなまえ格付けランキングベスト10コンポーネント
 * 左カラムの一番下に表示される
 */
export function RankingBest10Card() {
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [seasonKey, setSeasonKey] = useState<string>("")

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const currentSeason = getCurrentSeasonKey()
        setSeasonKey(currentSeason)
        const data = await fetchSeasonRanking(currentSeason, 10) // 最大10件取得
        
        // 10名未満の場合は空配列として扱う（表示しない）
        if (data.length < 10) {
          setEntries([])
        } else {
          setEntries(data.slice(0, 10)) // 上位10名のみ
        }
      } catch (error) {
        console.error("ランキング取得エラー:", error)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    loadRanking()
  }, [])

  // 10名未満の場合は表示しない
  if (loading || entries.length < 10) {
    return null
  }

  const seasonKanji = getSeasonNameKanji(seasonKey)

  return (
    <Card className="border-trophy-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-100">
          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          全国おなまえ格付けランキングベスト10
        </CardTitle>
        <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-200 mt-1">
          {seasonKanji}の陣
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-2">
          {entries.map((entry, index) => {
            // 表示名の決定: ranking_display_name（マスキング済みまたはニックネーム）を使用
            const displayName = entry.ranking_display_name || entry.name || "名前非公開"
            const rank = entry.rank ?? index + 1

            return (
              <li
                key={entry.id}
                className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 hover:bg-white/80 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <div className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {rank}位：{displayName}：{entry.total_score}pt
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

