"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Baby,
  Heart,
  Star,
  Crown,
  Sparkles,
  AlertCircle,
  Shield,
  CheckCircle,
  ExternalLink,
  Phone,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  generateOptimalNames,
  getNameCount,
  type BabyNameCandidate,
  type NamingRequest,
} from "@/lib/baby-naming-engine"

// 必要なインポートを追加
import { UsageTracker } from "@/lib/usage-tracker"
import { UsageLimitModal } from "@/components/usage-limit-modal"
import { getUpgradeMessage } from "@/lib/usage-limits"

const RANK_COLORS = {
  SSS: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
  SS: "bg-gradient-to-r from-purple-500 to-purple-700 text-white",
  S: "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
  "A+": "bg-gradient-to-r from-green-500 to-green-700 text-white",
  A: "bg-green-500 text-white",
  "B+": "bg-blue-500 text-white",
  B: "bg-gray-500 text-white",
  C: "bg-gray-400 text-white",
  D: "bg-gray-300 text-gray-700",
}

const RANK_ICONS = {
  SSS: <Crown className="h-4 w-4" />,
  SS: <Sparkles className="h-4 w-4" />,
  S: <Star className="h-4 w-4" />,
  "A+": <Heart className="h-4 w-4" />,
  A: <Heart className="h-4 w-4" />,
  "B+": <Star className="h-4 w-4" />,
  B: <Star className="h-4 w-4" />,
  C: <AlertCircle className="h-4 w-4" />,
  D: <AlertCircle className="h-4 w-4" />,
}

// BabyNamingToolコンポーネントに使用制限チェックを追加
export function BabyNamingTool() {
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [candidates, setCandidates] = useState<BabyNameCandidate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false) // 追加

  const usageTracker = UsageTracker.getInstance()

  const handleGenerate = async () => {
    if (!lastName.trim()) {
      setErrorMessage("苗字を入力してください。")
      return
    }

    // 使用制限チェックを追加
    const canUse = usageTracker.canUseFeature("babyNaming")
    if (!canUse.allowed) {
      setShowUsageLimitModal(true)
      return
    }

    setIsGenerating(true)
    setCandidates([])
    setErrorMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500)) // 生成中の演出

      const request: NamingRequest = {
        lastName: lastName.trim(),
        gender,
        preferences: {
          strictMode: true, // 凶数完全排除モード
        },
      }

      console.log("名前生成開始:", request)
      const results = generateOptimalNames(request, 3)

      // 使用回数を増加
      const success = usageTracker.incrementUsage("babyNaming")
      if (!success) {
        setErrorMessage("使用制限に達しました。プランをアップグレードしてください。")
        return
      }

      setCandidates(results)

      if (results.length === 0) {
        setErrorMessage(
          "非常に厳しい条件のため、完璧な名前が見つかりませんでした。" +
            "プロの姓名判断師による個別相談をおすすめします。",
        )
      }
    } catch (error: any) {
      console.error("名前生成エラー:", error)
      setErrorMessage(`名前の生成中にエラーが発生しました: ${error.message || "不明なエラー"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 使用状況を取得
  const usageStatus = usageTracker.getUsageStatus()
  const babyNamingUsage = usageTracker.canUseFeature("babyNaming")

  const handleClear = () => {
    setLastName("")
    setCandidates([])
    setErrorMessage(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 使用制限モーダルを追加 */}
      <UsageLimitModal
        isOpen={showUsageLimitModal}
        onClose={() => setShowUsageLimitModal(false)}
        feature="babyNaming"
        currentPlan={usageStatus.plan}
        limit={babyNamingUsage.limit}
        upgradeMessage={getUpgradeMessage("babyNaming", usageStatus.plan)}
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            赤ちゃん名付けツール
            {/* プレミアム機能バッジを追加 */}
            {usageStatus.plan === "free" && (
              <Badge className="bg-purple-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                プレミアム機能
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {/* 使用制限情報を追加 */}
            {babyNamingUsage.limit !== -1 ? (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">
                    今日の利用状況: {usageStatus.todayUsage.babyNaming}/{babyNamingUsage.limit}回
                  </span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    残り{babyNamingUsage.remaining}回
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-medium">
                    プレミアム機能 - 使い放題
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    無制限
                  </Badge>
                </div>
              </div>
            )}
            <strong>
              🎯 豊富な候補から厳選！
            </strong>
            <br />
            姓名判断で凶数を完全に排除した名前のみをご提案します。
            <br />
            <strong>🛡️ 厳格基準：全ての格で凶・大凶なし + 総合65点以上 + Aランク以上</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>豊富な名付けロジック</strong>: 多様な名前候補（伝統的・現代的・自然系・季節系・天体系・色彩系・音楽系・芸術系など）から、姓名判断で天格・人格・地格・外格・総格の全てに「凶」「大凶」が含まれない名前のみを厳選します。
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">苗字（姓）</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="例: 田中"
                className="text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label>性別</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value) => setGender(value as "male" | "female")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">男の子</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">女の子</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1" size="lg">
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="animate-pulse h-5 w-5" />
                  250候補から凶数完全排除中...
                </div>
              ) : (
                "豊富な候補から凶数なしの名前を厳選"
              )}
            </Button>
            <Button onClick={handleClear} variant="outline" size="lg">
              クリア
            </Button>
          </div>

          {isGenerating && (
            <Alert>
              <Sparkles className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                {gender === "male" ? `男性${nameCount.male}個` : `女性${nameCount.female}個`}
                の豊富な名前候補から、姓名判断で凶数を完全に排除した名前のみを厳選しています。伝統的な名前から現代的な名前まで、多様なカテゴリーから最適な名前をご提案します...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {candidates.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">豊富な候補から厳選された名前</h2>
            <p className="text-muted-foreground">
              {lastName}さんのお子様に最適な「凶数なし」の名前を
              {gender === "male" ? `男性${nameCount.male}個` : `女性${nameCount.female}個`}
              の豊富な候補から厳選しました
            </p>
          </div>

          <div className="grid gap-6">
            {candidates.map((candidate, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2">
                  {candidate.hasNoKyousu && (
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      凶数なし
                    </Badge>
                  )}
                  {candidate.isGoodFortune && (
                    <Badge className="bg-blue-500 text-white flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      最高品質
                    </Badge>
                  )}
                  <Badge
                    className={`${RANK_COLORS[candidate.powerRank as keyof typeof RANK_COLORS]} flex items-center gap-1`}
                  >
                    {RANK_ICONS[candidate.powerRank as keyof typeof RANK_ICONS]}
                    {candidate.powerRank}ランク
                  </Badge>
                  {candidate.searchMode && candidate.searchMode !== "厳格モード" && (
                    <Badge variant="outline" className="text-xs">
                      {candidate.searchMode}
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {lastName} {candidate.kanji}
                    </span>
                    <span className="text-lg text-muted-foreground">({candidate.reading})</span>
                  </CardTitle>
                  <CardDescription className="text-lg">{candidate.meaning}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{candidate.fortuneAnalysis.ten}</div>
                      <div className="text-sm text-muted-foreground">天格 ({candidate.fortuneDetails.tenFormat}画)</div>
                      <div className="text-xs text-muted-foreground">{candidate.fortuneDetails.tenFortune}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{candidate.fortuneAnalysis.jin}</div>
                      <div className="text-sm text-muted-foreground">人格 ({candidate.fortuneDetails.jinFormat}画)</div>
                      <div className="text-xs text-muted-foreground">{candidate.fortuneDetails.jinFortune}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{candidate.fortuneAnalysis.chi}</div>
                      <div className="text-sm text-muted-foreground">地格 ({candidate.fortuneDetails.chiFormat}画)</div>
                      <div className="text-xs text-muted-foreground">{candidate.fortuneDetails.chiFortune}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{candidate.fortuneAnalysis.gai}</div>
                      <div className="text-sm text-muted-foreground">外格 ({candidate.fortuneDetails.gaiFormat}画)</div>
                      <div className="text-xs text-muted-foreground">{candidate.fortuneDetails.gaiFortune}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{candidate.fortuneAnalysis.total}</div>
                      <div className="text-sm text-muted-foreground">
                        総格 ({candidate.fortuneDetails.totalFormat}画)
                      </div>
                      <div className="text-xs text-muted-foreground">{candidate.fortuneDetails.totalFortune}</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">性格・特徴</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.characteristics.map((char, i) => (
                        <Badge key={i} variant="secondary">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">総合スコア: </span>
                      <span className="text-lg font-bold text-primary">{candidate.totalScore}点</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">パワーレベル: </span>
                      <span className="text-lg font-bold text-primary">{candidate.powerLevel}/10</span>
                    </div>
                  </div>

                  {candidate.warnings && candidate.warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{candidate.warnings.join(", ")}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              ✅ <strong>豊富な候補から厳選</strong>: 男性{nameCount.male}個・女性{nameCount.female}
              個の多様な名前候補から、凶数完全排除 + 総合65点以上 + Aランク以上の条件をクリアした名前のみを表示
              <br />※
              姓名判断は参考程度にお考えください。最終的な名前の決定は、ご家族でよく話し合って決めることをおすすめします。
            </p>
          </div>
        </div>
      )}
      {candidates.length > 0 && (
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Star className="h-5 w-5" />
                判断に迷ったり、より詳しい姓名判断をお求めの方はプロへの相談をおすすめ致します
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-yellow-700">
                <p className="mb-3">
                  <strong>🔮 この結果はAIによる基本的な姓名判断です。</strong>
                  <br />
                  お子様の人生に関わる大切な名前選び、プロの姓名判断師による
                  <strong>詳細な鑑定</strong>をご希望の方は...
                </p>

                <div className="bg-white p-4 rounded-lg border border-yellow-200 mb-4">
                  <h4 className="font-bold text-yellow-800 mb-2">✨ プロ鑑定で分かること</h4>
                  <ul className="text-sm space-y-1 text-yellow-700">
                    <li>• 四柱推命による生年月日との相性</li>
                    <li>• 家系の運気との調和</li>
                    <li>• 将来の運勢の詳細な流れ</li>
                    <li>• 最適な画数の組み合わせ</li>
                    <li>• 音の響きや字面の吉凶</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white" size="lg">
                  <a
                    href="https://kanau-kiryu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    カナウ四柱推命で詳細鑑定
                  </a>
                </Button>

                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>090-6483-3637</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>9:00-22:00</span>
                </div>
              </div>

              <Alert className="bg-yellow-100 border-yellow-300">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>特別割引</strong>: 「AI名付けツールから来ました」とお伝えいただくと、 初回鑑定料が
                  <strong>20%OFF</strong>になります！
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
