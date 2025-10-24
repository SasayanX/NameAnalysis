"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, HeartIcon, AlertTriangleIcon, CalendarIcon } from "lucide-react"
import { analyzeNameFortune } from "@/lib/name-data-simple-fixed"
import { calculateNameElements } from "@/lib/five-elements"
import { analyzeCompatibility } from "@/lib/advanced-fortune"
import { calculateSixStar } from "@/lib/six-star-fortune"
// 1. まず、レーダーチャートコンポーネントをインポートします
import { CompatibilityRadarChart } from "./compatibility-radar-chart"
import { calculateSixStarFromCSV } from "@/lib/six-star"

interface CompatibilityAnalyzerProps {
  myName?: { lastName: string; firstName: string }
  myGender?: string
  myBirthdate?: Date
  isPremium?: boolean
}

export function CompatibilityAnalyzer({
  myName,
  myGender = "male",
  myBirthdate,
  isPremium = false,
}: CompatibilityAnalyzerProps) {
  const [partnerLastName, setPartnerLastName] = useState("")
  const [partnerFirstName, setPartnerFirstName] = useState("")
  const [partnerGender, setPartnerGender] = useState("female")
  const [partnerBirthdate, setPartnerBirthdate] = useState<Date | null>(null)
  const [partnerBirthdateString, setPartnerBirthdateString] = useState("")
  const [showPartnerBirthdateInput, setShowPartnerBirthdateInput] = useState(false)
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [lastUsedDate, setLastUsedDate] = useState<string | null>(null)

  // 利用回数を読み込む
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem("compatibilityUsageCount")
      const storedDate = localStorage.getItem("compatibilityLastUsedDate")

      if (storedCount && storedDate) {
        // 日付が変わっていれば、カウントをリセット
        const today = new Date().toDateString()
        if (storedDate !== today) {
          localStorage.setItem("compatibilityUsageCount", "0")
          localStorage.setItem("compatibilityLastUsedDate", today)
          setUsageCount(0)
          setLastUsedDate(today)
        } else {
          setUsageCount(Number.parseInt(storedCount) || 0)
          setLastUsedDate(storedDate)
        }
      } else {
        // 初回利用時
        const today = new Date().toDateString()
        localStorage.setItem("compatibilityUsageCount", "0")
        localStorage.setItem("compatibilityLastUsedDate", today)
        setUsageCount(0)
        setLastUsedDate(today)
      }
    } catch (error) {
      console.error("Error loading usage count:", error)
      setUsageCount(0)
    }
  }, [])

  // 利用回数を更新する関数
  const incrementUsageCount = () => {
    try {
      const today = new Date().toDateString()
      const newCount = usageCount + 1
      localStorage.setItem("compatibilityUsageCount", newCount.toString())
      localStorage.setItem("compatibilityLastUsedDate", today)
      setUsageCount(newCount)
      setLastUsedDate(today)
    } catch (error) {
      console.error("Error updating usage count:", error)
    }
  }

  const handlePartnerBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerBirthdateString(e.target.value)
    const date = new Date(e.target.value)
    if (!isNaN(date.getTime())) {
      setPartnerBirthdate(date)
    }
  }

  // 安全な名前分析関数
  const safeAnalyzeNameFortune = (lastName: string, firstName: string, gender: string) => {
    try {
      // 入力値の検証
      if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
        throw new Error("姓が正しく入力されていません")
      }
      if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
        throw new Error("名が正しく入力されていません")
      }
      if (!gender || typeof gender !== "string") {
        throw new Error("性別が正しく設定されていません")
      }

      // 性別の正規化（文字列の検証を追加）
      const genderStr = String(gender).toLowerCase()
      const normalizedGender = genderStr === "male" || genderStr === "男性" ? "male" : "female"

      console.log("Calling analyzeNameFortune with:", {
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        gender: normalizedGender,
      })

      // customFortuneDataなしで呼び出し（デフォルト値を使用）
      return analyzeNameFortune(lastName.trim(), firstName.trim(), normalizedGender)
    } catch (error) {
      console.error("Error in safeAnalyzeNameFortune:", error)
      throw error
    }
  }

  // 安全な要素計算関数
  const safeCalculateNameElements = (lastName: string, firstName: string) => {
    try {
      if (!lastName || typeof lastName !== "string") {
        throw new Error("姓が正しく入力されていません")
      }
      if (!firstName || typeof firstName !== "string") {
        throw new Error("名が正しく入力されていません")
      }

      return calculateNameElements(lastName.trim(), firstName.trim())
    } catch (error) {
      console.error("Error in safeCalculateNameElements:", error)
      throw error
    }
  }

  const handleAnalyze = async () => {
    // 無料プランで1日の制限に達している場合
    if (!isPremium && usageCount >= 1) {
      setError(
        "無料会員は相性診断が月1回までです。ベーシック会員になると1日1回、プロ会員は1日3回、プレミアム会員は無制限に利用できます。",
      )
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 詳細な入力値検証
      if (!myName || !myName.lastName || !myName.firstName) {
        throw new Error("自分の名前が正しく設定されていません。先に姓名判断を行ってください。")
      }

      if (!partnerLastName || !partnerFirstName) {
        throw new Error("相手の名前を入力してください。")
      }

      // 性別の検証と正規化
      const myGenderSafe = myGender && typeof myGender === "string" ? myGender : "male"
      const partnerGenderSafe = partnerGender && typeof partnerGender === "string" ? partnerGender : "female"

      console.log("Starting compatibility analysis with:", {
        myName: myName,
        myGender: myGenderSafe,
        partnerName: { lastName: partnerLastName, firstName: partnerFirstName },
        partnerGender: partnerGenderSafe,
      })

      // 自分のデータを計算（安全な関数を使用）
      const myBasicResult = safeAnalyzeNameFortune(myName.lastName, myName.firstName, myGenderSafe)
      const myElements = safeCalculateNameElements(myName.lastName, myName.firstName)

      // 相手のデータを計算（安全な関数を使用）
      const partnerBasicResult = safeAnalyzeNameFortune(partnerLastName, partnerFirstName, partnerGenderSafe)
      const partnerElements = safeCalculateNameElements(partnerLastName, partnerFirstName)

      // 六星占術の星を計算
      let mySixStar = undefined
      let partnerSixStar = undefined

      try {
        if (myBirthdate) {
          mySixStar = await calculateSixStarFromCSV(myBirthdate)
        }

        if (partnerBirthdate) {
          partnerSixStar = await calculateSixStarFromCSV(partnerBirthdate)
        }
      } catch (sixStarError) {
        console.warn("Six star calculation failed:", sixStarError)
        // 六星占術の計算に失敗した場合はフォールバック
        try {
          if (myBirthdate) {
            mySixStar = calculateSixStar(myBirthdate)
          }
          if (partnerBirthdate) {
            partnerSixStar = calculateSixStar(partnerBirthdate)
          }
        } catch (fallbackError) {
          console.warn("Fallback six star calculation also failed:", fallbackError)
        }
      }

      // 相性を計算
      let compatibility
      try {
        compatibility = analyzeCompatibility(
          {
            sixStar: mySixStar,
            dominantElement: myElements?.dominantElement || "木",
          },
          {
            sixStar: partnerSixStar,
            dominantElement: partnerElements?.dominantElement || "木",
          },
        )
      } catch (compatibilityError) {
        console.warn("Compatibility analysis failed:", compatibilityError)
        // フォールバック値を設定
        compatibility = {
          overallScore: 50,
          advice: "相性分析中にエラーが発生しましたが、基本的な相性は計算できました。",
          elementCompatibility: {
            score: 50,
            description: "五行の相性は普通です。",
          },
        }
      }

      // 姓名判断の相性（簡易版）
      const nameCompatibility = calculateNameCompatibility(myBasicResult, partnerBasicResult)

      // 結果をセット
      setCompatibilityResult({
        ...compatibility,
        nameCompatibility,
        myName: `${myName.lastName} ${myName.firstName}`,
        partnerName: `${partnerLastName} ${partnerFirstName}`,
        myGender: myGenderSafe,
        partnerGender: partnerGenderSafe,
        hasBirthdate: !!myBirthdate && !!partnerBirthdate,
        mySixStar,
        partnerSixStar,
        myElement: myElements?.dominantElement || "木",
        partnerElement: partnerElements?.dominantElement || "木",
      })

      // 無料プランの場合、利用回数を増やす
      if (!isPremium) {
        incrementUsageCount()
      }
    } catch (error) {
      console.error("Error during compatibility analysis:", error)
      setError(`相性診断中にエラーが発生しました: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 姓名判断の相性を計算する関数（簡易版）
  const calculateNameCompatibility = (myResult: any, partnerResult: any) => {
    try {
      if (!myResult || !partnerResult || !myResult.categories || !partnerResult.categories) {
        return {
          tenCompatibility: { score: 50, description: "データが不足しています" },
          jinCompatibility: { score: 50, description: "データが不足しています" },
          chiCompatibility: { score: 50, description: "データが不足しています" },
          overallScore: 50,
        }
      }

      // 天格、人格、地格の相性を計算
      const tenCompatibility = calculateFortuneCompatibility(
        myResult.categories.find((c: any) => c?.name === "天格"),
        partnerResult.categories.find((c: any) => c?.name === "天格"),
      )

      const jinCompatibility = calculateFortuneCompatibility(
        myResult.categories.find((c: any) => c?.name === "人格"),
        partnerResult.categories.find((c: any) => c?.name === "人格"),
      )

      const chiCompatibility = calculateFortuneCompatibility(
        myResult.categories.find((c: any) => c?.name === "地格"),
        partnerResult.categories.find((c: any) => c?.name === "地格"),
      )

      // デバッグ用：各格の相性計算結果を出力
      console.log("天格の相性:", tenCompatibility)
      console.log("人格の相性:", jinCompatibility)
      console.log("地格の相性:", chiCompatibility)

      // 総合相性スコア（人格の相性を重視）
      const overallScore = Math.round(
        (tenCompatibility.score + jinCompatibility.score * 2 + chiCompatibility.score) / 4,
      )

      return {
        tenCompatibility,
        jinCompatibility,
        chiCompatibility,
        overallScore,
      }
    } catch (error) {
      console.error("Error calculating name compatibility:", error)
      return {
        tenCompatibility: { score: 50, description: "計算エラーが発生しました" },
        jinCompatibility: { score: 50, description: "計算エラーが発生しました" },
        chiCompatibility: { score: 50, description: "計算エラーが発生しました" },
        overallScore: 50,
      }
    }
  }

  // 運勢の相性を計算する関数
  const calculateFortuneCompatibility = (myFortune: any, partnerFortune: any) => {
    if (!myFortune || !partnerFortune || !myFortune.fortune || !partnerFortune.fortune) {
      return { score: 50, description: "データが不足しています" }
    }

    // 運勢の組み合わせによるスコア
    const fortuneMatrix: Record<string, Record<string, number>> = {
      大吉: { 大吉: 90, 吉: 85, 中吉: 80, 凶: 60, 大凶: 50, 中凶: 55 },
      吉: { 大吉: 85, 吉: 80, 中吉: 75, 凶: 55, 大凶: 45, 中凶: 50 },
      中吉: { 大吉: 80, 吉: 75, 中吉: 70, 凶: 50, 大凶: 40, 中凶: 45 },
      凶: { 大吉: 60, 吉: 55, 中吉: 50, 凶: 40, 大凶: 30, 中凶: 35 },
      大凶: { 大吉: 50, 吉: 45, 中吉: 40, 凶: 30, 大凶: 20, 中凶: 25 },
      中凶: { 大吉: 55, 吉: 50, 中吉: 45, 凶: 35, 大凶: 25, 中凶: 30 },
    }

    // 相性スコアを取得
    const score = fortuneMatrix[myFortune.fortune]?.[partnerFortune.fortune] || 50

    // デバッグ用：運勢マトリックスの適用過程を出力
    console.log("自分の運勢:", myFortune.fortune)
    console.log("相手の運勢:", partnerFortune.fortune)
    console.log("適用されたスコア:", score)

    // 相性の説明
    let description = ""
    if (score >= 80) {
      description = "非常に相性が良い組み合わせです。"
    } else if (score >= 65) {
      description = "良好な相性です。"
    } else if (score >= 50) {
      description = "普通の相性です。"
    } else if (score >= 35) {
      description = "やや相性に課題があります。"
    } else {
      description = "相性に注意が必要です。"
    }

    return { score, description }
  }

  // 残り利用回数
  const remainingUses = isPremium ? "無制限" : Math.max(0, 1 - usageCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>相性診断</CardTitle>
        <CardDescription>
          あなたと相手の名前から相性を診断します
          {!isPremium && (
            <span className="block text-amber-600 mt-1">無料会員は月1回まで（残り: {remainingUses}回）</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm text-gray-500">あなたの名前</Label>
            <p className="font-medium">
              {myName ? `${myName.lastName} ${myName.firstName}` : "まだ名前が入力されていません"}
            </p>
            {!myBirthdate && (
              <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>六星占術による相性診断には生年月日が必要です</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerLastName">相手の姓</Label>
                <Input
                  id="partnerLastName"
                  name="partnerLastName"
                  placeholder="例: 佐藤"
                  value={partnerLastName}
                  onChange={(e) => setPartnerLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerFirstName">相手の名</Label>
                <Input
                  id="partnerFirstName"
                  name="partnerFirstName"
                  placeholder="例: 花子"
                  value={partnerFirstName}
                  onChange={(e) => setPartnerFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>相手の性別</Label>
              <RadioGroup
                defaultValue="female"
                value={partnerGender}
                onValueChange={setPartnerGender}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="partner-gender-male" />
                  <Label htmlFor="partner-gender-male">男性</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="partner-gender-female" />
                  <Label htmlFor="partner-gender-female">女性</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 相手の生年月日入力（オプション） */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="partnerBirthdate">相手の生年月日（六星占術に必要）</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPartnerBirthdateInput(!showPartnerBirthdateInput)}
                >
                  {showPartnerBirthdateInput ? "隠す" : "表示"}
                </Button>
              </div>

              {showPartnerBirthdateInput && (
                <Input
                  id="partnerBirthdate"
                  name="partnerBirthdate"
                  type="date"
                  value={partnerBirthdateString}
                  onChange={handlePartnerBirthdateChange}
                />
              )}
            </div>
          </div>

          <Button onClick={handleAnalyze} className="w-full" disabled={isLoading || (!isPremium && usageCount >= 1)}>
            {isLoading ? "診断中..." : "相性を診断する"}
          </Button>
        </div>

        {compatibilityResult && (
          <div className="mt-6 space-y-6">
            {isPremium ? (
              <CompatibilityRadarChart compatibilityData={compatibilityResult} />
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>相性チャート</CardTitle>
                  <CardDescription>視覚的な相性分析</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="mb-4">プレミアム会員になると、詳細な相性チャートが表示されます</p>
                  <Button variant="default" size="sm" className="bg-amber-500 hover:bg-amber-600">
                    プレミアムに登録
                  </Button>
                </CardContent>
              </Card>
            )}
            <div className="text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="text-lg font-medium">{compatibilityResult.myName}</div>
                <HeartIcon className="h-6 w-6 text-red-500" />
                <div className="text-lg font-medium">{compatibilityResult.partnerName}</div>
              </div>

              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-200 to-red-200 flex items-center justify-center">
                  <div className="text-4xl font-bold text-red-600">{compatibilityResult.overallScore || 50}</div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">総合相性スコア</h3>
              <p className="text-gray-600 mb-4">{compatibilityResult.advice || "相性診断が完了しました。"}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">相性の詳細</h4>

              {/* 六星占術の相性 - 生年月日がある場合のみ表示 */}
              {compatibilityResult.sixStarCompatibility && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">六星占術の相性</span>
                    <span>{compatibilityResult.sixStarCompatibility.score}点</span>
                  </div>
                  <Progress value={compatibilityResult.sixStarCompatibility.score} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {compatibilityResult.mySixStar?.star}人{compatibilityResult.mySixStar?.type} ×{" "}
                    {compatibilityResult.partnerSixStar?.star}人{compatibilityResult.partnerSixStar?.type}：
                    {compatibilityResult.sixStarCompatibility.description}
                  </p>
                </div>
              )}

              {/* 生年月日がない場合は六星占術の代わりに入力を促すメッセージを表示 */}
              {!compatibilityResult.hasBirthdate && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <CalendarIcon className="h-4 w-4" />
                  <AlertTitle>六星占術による相性診断には生年月日が必要です</AlertTitle>
                  <AlertDescription>
                    より詳細な相性診断結果を得るには、あなたと相手の生年月日を入力してください。
                  </AlertDescription>
                </Alert>
              )}

              {compatibilityResult.elementCompatibility && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">五行の相性</span>
                    <span>{compatibilityResult.elementCompatibility.score}点</span>
                  </div>
                  <Progress value={compatibilityResult.elementCompatibility.score} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {compatibilityResult.myElement} × {compatibilityResult.partnerElement}：
                    {compatibilityResult.elementCompatibility.description}
                  </p>
                </div>
              )}

              {compatibilityResult.nameCompatibility && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">姓名判断の相性</span>
                    <span>{compatibilityResult.nameCompatibility.overallScore}点</span>
                  </div>
                  <Progress value={compatibilityResult.nameCompatibility.overallScore} className="h-2" />
                </div>
              )}

              {isPremium && compatibilityResult.nameCompatibility && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">詳細分析</h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">天格の相性</div>
                      <div className="font-medium">
                        {compatibilityResult.nameCompatibility.tenCompatibility?.score || 50}点
                      </div>
                      <div className="text-xs text-gray-600">
                        {compatibilityResult.nameCompatibility.tenCompatibility?.description || "データなし"}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">人格の相性</div>
                      <div className="font-medium">
                        {compatibilityResult.nameCompatibility.jinCompatibility?.score || 50}点
                      </div>
                      <div className="text-xs text-gray-600">
                        {compatibilityResult.nameCompatibility.jinCompatibility?.description || "データなし"}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">地格の相性</div>
                      <div className="font-medium">
                        {compatibilityResult.nameCompatibility.chiCompatibility?.score || 50}点
                      </div>
                      <div className="text-xs text-gray-600">
                        {compatibilityResult.nameCompatibility.chiCompatibility?.description || "データなし"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">相性アドバイス</h4>
                    <p className="text-sm">
                      {compatibilityResult.myName}さんと{compatibilityResult.partnerName}さんは
                      {(compatibilityResult.overallScore || 50) >= 80
                        ? "非常に相性が良いです。お互いの良さを引き出し合える関係になるでしょう。"
                        : (compatibilityResult.overallScore || 50) >= 65
                          ? "良好な相性です。多少の違いはありますが、互いに補い合うことで良い関係を築けます。"
                          : (compatibilityResult.overallScore || 50) >= 50
                            ? "普通の相性です。コミュニケーションを大切にすることで理解を深められます。"
                            : "相性に課題がある組み合わせです。互いの違いを尊重し、歩み寄る姿勢が大切です。"}
                      {compatibilityResult.myElement}の気質を持つあなたと、{compatibilityResult.partnerElement}
                      の気質を持つ相手は、
                      {(compatibilityResult.elementCompatibility?.score || 50) >= 70
                        ? "エネルギーの流れが調和しやすい関係です。"
                        : (compatibilityResult.elementCompatibility?.score || 50) >= 50
                          ? "お互いの特性を理解することで良い関係を築けます。"
                          : "時に衝突することもありますが、それが成長につながります。"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isPremium && compatibilityResult && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-amber-200 rounded-lg text-center">
            <p className="text-sm font-medium text-amber-800">
              会員登録すると、より詳細な相性分析と相性アドバイスが見られます
            </p>
            <p className="text-xs text-amber-700 mt-1">
              ベーシック(110円/月)：1日1回、プロ(330円/月)：1日3回、プレミアム(550円/月)：無制限
            </p>
            <Button variant="default" size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
              会員登録する
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <InfoIcon className="h-3 w-3" />
          <span>相性診断は参考情報です</span>
        </div>
        {!isPremium && <div>今月の利用回数: {usageCount}/1</div>}
      </CardFooter>
    </Card>
  )
}
