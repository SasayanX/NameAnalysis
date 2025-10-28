"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculateNameRankingPoints } from "@/lib/name-ranking"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { LockIcon, StarIcon, TrophyIcon, ZapIcon } from "lucide-react"
import { getStarLevelDescription } from "@/lib/name-ranking"

interface NameRankingCardProps {
  lastName: string
  firstName: string
  gender: "male" | "female"
  isPremium: boolean
  premiumLevel?: number // 0: 無料, 1: ベーシック(110円), 2: プロ(330円), 3: プレミアム(550円)
}

export function NameRankingCard({ lastName, firstName, gender, isPremium, premiumLevel = 0 }: NameRankingCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { fortuneData } = useFortuneData()

  // 名前が入力されていない場合
  if (!lastName || !firstName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>おなまえ格付けポイント</CardTitle>
          <CardDescription>名前を入力すると格付けが表示されます</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>名前を入力して分析してください</p>
        </CardContent>
      </Card>
    )
  }

  // 名前の格付けポイントを計算
  const rankingResult = calculateNameRankingPoints(lastName, firstName, fortuneData, gender)

  // プレミアム会員でない場合は一部情報を制限
  const limitedResult = !isPremium
    ? {
        ...rankingResult,
        details: rankingResult.details.map((detail, index) => (index < 2 ? detail : { ...detail, points: null })),
      }
    : rankingResult

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white dark:from-purple-700 dark:to-indigo-700">
        <CardTitle className="flex justify-between items-center">
          <span>おなまえ格付けランク</span>
          {isPremium && (
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              プレミアム機能
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-white/80">あなたの名前の強さがまるわかり！</CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">
            {lastName} {firstName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{gender === "male" ? "男性" : "女性"}</div>

          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800 flex items-center justify-center">
                <div className="text-center">
                  {isPremium ? (
                    <>
                      <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-200">
                        {rankingResult.powerRank}
                      </div>
                      <div className="text-sm text-indigo-600 dark:text-indigo-300">ランク</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                        <LockIcon className="h-10 w-10 mx-auto mb-1" />
                        <span>非公開</span>
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">プレミアム限定</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1 mb-2">
            {isPremium ? (
              Array.from({ length: 10 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < rankingResult.powerLevel
                      ? "text-amber-400 fill-amber-400 dark:text-amber-300 dark:fill-amber-300"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))
            ) : (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <LockIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">パワーレベルはプレミアム会員限定です</span>
              </div>
            )}
          </div>

          {/* 10段階運勢説明を追加 */}
          {isPremium && (
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="text-center">
                <div className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">
                  {getStarLevelDescription(rankingResult.powerLevel).title}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  {getStarLevelDescription(rankingResult.powerLevel).description}
                </div>
              </div>
            </div>
          )}

          <div className="text-lg font-medium mb-4">
            総合パワーポイント:{" "}
            {premiumLevel === 3 ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.floor(rankingResult.totalPoints)}
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                <LockIcon className="h-4 w-4 mr-1" />
                <span>プレミアム限定</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {limitedResult.details.map((detail, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {index === 0 && <ZapIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />}
                  {index === 1 && <TrophyIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                  {index === 2 && <StarIcon className="h-4 w-4 text-green-500 dark:text-green-400" />}
                  {index === 3 && <ZapIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />}
                  {index === 4 && <TrophyIcon className="h-4 w-4 text-red-500 dark:text-red-400" />}
                  <span className="font-medium">{detail.category}</span>
                </div>
                <span className="font-bold">
                  {detail.points !== null ? (
                    `${Math.floor(detail.points)}pt`
                  ) : (
                    <div className="flex items-center">
                      <LockIcon className="h-3 w-3 mr-1" />
                      <span>非公開</span>
                    </div>
                  )}
                </span>
              </div>

              {detail.points !== null ? (
                <Progress value={detail.points} className="h-2 bg-gray-100 dark:bg-gray-700" />
              ) : (
                <Progress value={0} className="h-2 bg-gray-200 dark:bg-gray-700" />
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">{detail.description}</p>
            </div>
          ))}
        </div>

        {!isPremium && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg text-center">
            <p className="text-sm font-medium text-amber-800">
              会員登録すると、格付けランク（S、SS、SSSなど）とすべての詳細な分析が見られます
            </p>
            <p className="text-xs text-amber-700 mt-1">ベーシック(220円/月)から詳細機能が使えます</p>
            <Button variant="default" size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
              会員登録する
            </Button>
          </div>
        )}

        {isPremium && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "詳細を閉じる" : "詳細を見る"}
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium">格付けポイントの詳細</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  「{lastName} {firstName}」さんの名前は、特に
                  {rankingResult.details.sort((a, b) => b.points - a.points)[0].category}が強く、 総合的なパワーランクは
                  <span className="font-bold">{rankingResult.powerRank}</span>です。 これは全体の上位
                  {getRankPercentile(rankingResult.powerRank)}%に入る優れた名前です。
                </p>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-1">名前パワーの活かし方</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    {getNamePowerAdvice(rankingResult.powerRank, rankingResult.details)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 w-full text-center">
          ※格付けポイントは参考値です。実際の運勢を保証するものではありません。
        </div>
      </CardFooter>
    </Card>
  )
}

// ランクのパーセンタイルを取得する関数
function getRankPercentile(rank: string): number {
  switch (rank) {
    case "SSS":
      return 1
    case "SS":
      return 3
    case "S":
      return 7
    case "A+":
      return 12
    case "A":
      return 20
    case "B+":
      return 30
    case "B":
      return 50
    case "C":
      return 70
    default:
      return 90
  }
}

// 表示用ランクを取得する関数（無料プランではSSS・SSを隠す）
function getDisplayRank(rank: string, isPremium: boolean): string {
  if (!isPremium && (rank === "SSS" || rank === "SS")) {
    return "S" // SSS・SSは無料ではSとして表示
  }
  return rank
}

// 名前パワーのアドバイスを生成する関数
function getNamePowerAdvice(rank: string, details: any[]): string {
  // 最も高いカテゴリを取得
  const topCategory = details.sort((a, b) => b.points - a.points)[0].category

  let advice = ""

  if (rank === "SSS" || rank === "SS" || rank === "S") {
    advice = `あなたの名前は非常に強力なパワーを持っています。特に${topCategory}が際立っており、自信を持って行動することで運気を最大限に引き出せるでしょう。`
  } else if (rank === "A+" || rank === "A") {
    advice = `あなたの名前は良好なパワーバランスを持っています。${topCategory}を活かした行動を意識すると、さらに運気が高まるでしょう。`
  } else if (rank === "B+" || rank === "B") {
    advice = `あなたの名前は平均的なパワーを持っています。${topCategory}を意識して生活に取り入れることで、運気を上昇させることができます。`
  } else {
    advice = `あなたの名前のパワーを最大限に引き出すには、${topCategory}を強化する行動を心がけましょう。日々の積み重ねが運気を変えていきます。`
  }

  return advice
}
