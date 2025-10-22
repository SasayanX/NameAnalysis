"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrophyIcon, CrownIcon, LockIcon, ShareIcon, RefreshCwIcon } from "lucide-react"

interface RankingEntry {
  id: string
  displayName: string // 田中○郎、山田○子など
  powerRank: string
  totalPoints: number
  prefecture?: string
  age?: string
  gender: "male" | "female"
  timestamp: Date
  isCurrentUser?: boolean
}

interface NamePowerRankingProps {
  currentUserRanking?: RankingEntry
  isPremium: boolean
  onUpgrade: () => void
}

export function NamePowerRanking({ currentUserRanking, isPremium, onUpgrade }: NamePowerRankingProps) {
  const [activeTab, setActiveTab] = useState("overall")
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // サンプルデータ（実際はAPIから取得）
  useEffect(() => {
    const sampleRankings: RankingEntry[] = [
      {
        id: "1",
        displayName: "田中○郎",
        powerRank: "SSS",
        totalPoints: 650,
        prefecture: "東京都",
        age: "30代",
        gender: "male",
        timestamp: new Date(),
      },
      {
        id: "2",
        displayName: "山田○子",
        powerRank: "SS",
        totalPoints: 580,
        prefecture: "大阪府",
        age: "20代",
        gender: "female",
        timestamp: new Date(),
      },
      {
        id: "3",
        displayName: "佐藤○美",
        powerRank: "S",
        totalPoints: 520,
        prefecture: "神奈川県",
        age: "40代",
        gender: "female",
        timestamp: new Date(),
      },
      {
        id: "4",
        displayName: "鈴木○也",
        powerRank: "A+",
        totalPoints: 480,
        prefecture: "愛知県",
        age: "30代",
        gender: "male",
        timestamp: new Date(),
      },
      {
        id: "5",
        displayName: "高橋○香",
        powerRank: "A",
        totalPoints: 450,
        prefecture: "福岡県",
        age: "20代",
        gender: "female",
        timestamp: new Date(),
      },
    ]

    setTimeout(() => {
      setRankings(sampleRankings)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownIcon className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <TrophyIcon className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <TrophyIcon className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>
  }

  const getRankColor = (powerRank: string) => {
    switch (powerRank) {
      case "SSS":
        return "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      case "SS":
        return "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      case "S":
        return "bg-gradient-to-r from-green-600 to-blue-600 text-white"
      case "A+":
        return "bg-gradient-to-r from-yellow-500 to-green-500 text-white"
      case "A":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const filteredRankings = rankings.filter((entry) => {
    if (activeTab === "male") return entry.gender === "male"
    if (activeTab === "female") return entry.gender === "female"
    return true
  })

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrophyIcon className="h-8 w-8" />
              おなまえパワーランキング
            </CardTitle>
            <CardDescription className="text-white/80">
              全国のユーザーの名前パワーをランキング形式で表示
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <RefreshCwIcon className="h-4 w-4 mr-1" />
              更新
            </Button>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ShareIcon className="h-4 w-4 mr-1" />
              シェア
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* 現在のユーザーの順位表示 */}
        {currentUserRanking && (
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-amber-600">#{currentUserRanking.id}</div>
                  <div>
                    <div className="font-bold text-lg">{currentUserRanking.displayName}</div>
                    <div className="text-sm text-gray-600">あなたの現在の順位</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getRankColor(currentUserRanking.powerRank)}>{currentUserRanking.powerRank}</Badge>
                  <div className="text-lg font-bold mt-1">{currentUserRanking.totalPoints}pt</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overall">総合ランキング</TabsTrigger>
            <TabsTrigger value="male">男性ランキング</TabsTrigger>
            <TabsTrigger value="female">女性ランキング</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRankings.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`transition-all hover:shadow-md ${
                      entry.isCurrentUser ? "ring-2 ring-amber-400 bg-amber-50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12">{getRankIcon(index + 1)}</div>
                          <div>
                            <div className="font-bold text-lg flex items-center gap-2">
                              {isPremium ? (
                                entry.displayName
                              ) : index < 3 ? (
                                entry.displayName
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{entry.displayName}</span>
                                  <LockIcon className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              {entry.isCurrentUser && (
                                <Badge variant="outline" className="text-xs">
                                  あなた
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              {isPremium || index < 3 ? (
                                <>
                                  <span>{entry.prefecture}</span>
                                  <span>•</span>
                                  <span>{entry.age}</span>
                                  <span>•</span>
                                  <span>{entry.gender === "male" ? "男性" : "女性"}</span>
                                </>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <LockIcon className="h-3 w-3" />
                                  <span>詳細はプレミアム会員限定</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRankColor(entry.powerRank)} size="lg">
                            {entry.powerRank}
                          </Badge>
                          <div className="text-lg font-bold mt-1">
                            {isPremium || index < 3 ? (
                              `${entry.totalPoints}pt`
                            ) : (
                              <div className="flex items-center gap-1">
                                <LockIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">非公開</span>
                              </div>
                            )}
                          </div>
                          {isPremium || index < 3 ? (
                            <Progress value={(entry.totalPoints / 700) * 100} className="w-20 h-2 mt-1" />
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* プレミアム会員でない場合の誘導 */}
        {!isPremium && (
          <Card className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <LockIcon className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-2">全ランキングを見るにはプレミアム会員に</h3>
              <p className="text-purple-700 mb-4">
                プレミアム会員になると、全順位の詳細情報、地域別ランキング、過去のランキング履歴などが見放題！
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-bold text-purple-800">✓ 全順位表示</div>
                  <div className="text-purple-600">1位〜1000位まで</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-bold text-purple-800">✓ 詳細情報</div>
                  <div className="text-purple-600">地域・年代・ポイント</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-bold text-purple-800">✓ 地域別ランキング</div>
                  <div className="text-purple-600">都道府県別順位</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-bold text-purple-800">✓ 履歴機能</div>
                  <div className="text-purple-600">過去の順位変動</div>
                </div>
              </div>
              <Button onClick={onUpgrade} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2">
                プレミアム会員になる（550円/月）
              </Button>
              <p className="text-xs text-purple-600 mt-2">※初回7日間無料トライアル</p>
            </CardContent>
          </Card>
        )}

        {/* ランキング参加の説明 */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-bold mb-2">🏆 ランキング参加について</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 姓名判断を実行すると自動的にランキングに参加されます</li>
              <li>• 個人情報保護のため、お名前の一部は○で表示されます</li>
              <li>• ランキングは毎日午前0時に更新されます</li>
              <li>• 参加を希望しない場合は設定から無効にできます</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
