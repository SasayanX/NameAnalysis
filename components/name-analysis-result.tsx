"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Lock, Crown, Trophy } from "lucide-react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AIFortuneAdvisor } from "@/components/ai-fortune-advisor"

interface NameAnalysisResultProps {
  results: any
  name: string
  gender?: string
  isPremium?: boolean
  isPro?: boolean
  currentPlan?: "free" | "basic" | "premium"
}

export function NameAnalysisResult({
  results,
  name,
  gender = "male",
  isPremium = false,
  isPro = false,
  currentPlan = "free",
}: NameAnalysisResultProps) {
  const [isAdviceOpen, setIsAdviceOpen] = useState(false)

  // プランに基づく機能制限
  const canViewDetailedAnalysis = currentPlan !== "free"
  const canViewRanking = currentPlan === "premium"
  const canViewAllCategories = currentPlan !== "free"

  // Function to determine badge color based on fortune
  const getBadgeVariant = (fortune: string) => {
    if (!fortune) return "secondary"
    if (fortune.includes("大吉")) return "destructive" // 赤色
    if (fortune.includes("中吉")) return "dark-pink" // 濃いピンク
    if (fortune.includes("吉")) return "light-pink" // 薄いピンク
    if (fortune.includes("凶") && !fortune.includes("大凶") && !fortune.includes("中凶")) return "white" // 白
    if (fortune.includes("中凶")) return "gray" // グレー
    if (fortune.includes("大凶")) return "dark-gray" // 濃いグレー
    return "outline"
  }

  // スコア計算関数を追加（正しいスコア値で）
  function calculateFortuneScore(fortune: string): number {
    switch (fortune) {
      case "大吉":
        return 100
      case "中吉":
        return 80
      case "吉":
        return 60
      case "凶":
        return 40
      case "中凶":
        return 20
      case "大凶":
        return 0
      default:
        return 50
    }
  }

  // 画数を取得する関数（修正版）
  const getStrokeCount = (categoryName: string): string => {
    console.log(`=== ${categoryName} 画数取得開始 ===`)
    console.log("results全体:", results)
    console.log("results.tenFormat:", results?.tenFormat)
    console.log("results.jinFormat:", results?.jinFormat)
    console.log("results.chiFormat:", results?.chiFormat)
    console.log("results.gaiFormat:", results?.gaiFormat)
    console.log("results.totalFormat:", results?.totalFormat)

    // 直接resultsから取得
    if (results) {
      // 天格
      if (categoryName === "天格" && results.tenFormat) {
        console.log(`✅ 天格: ${results.tenFormat}画`)
        return `${results.tenFormat}画`
      }
      // 人格
      if (categoryName === "人格" && results.jinFormat) {
        console.log(`✅ 人格: ${results.jinFormat}画`)
        return `${results.jinFormat}画`
      }
      // 地格
      if (categoryName === "地格" && results.chiFormat) {
        console.log(`✅ 地格: ${results.chiFormat}画`)
        return `${results.chiFormat}画`
      }
      // 外格
      if (categoryName === "外格" && results.gaiFormat) {
        console.log(`✅ 外格: ${results.gaiFormat}画`)
        return `${results.gaiFormat}画`
      }
      // 総格
      if (categoryName === "総格" && results.totalFormat) {
        console.log(`✅ 総格: ${results.totalFormat}画`)
        return `${results.totalFormat}画`
      }
    }

    // categoriesから取得（フォールバック）
    if (results && results.categories) {
      const category = results.categories.find((cat: any) => cat.name === categoryName)
      console.log(`${categoryName}のcategory:`, category)
      
      if (category) {
        // strokeCountプロパティから直接取得
        if (category.strokeCount) {
          console.log(`✅ ${categoryName}: categoriesからstrokeCount ${category.strokeCount}画`)
          return `${category.strokeCount}画`
        }
        
        // valueプロパティから取得
        if (category.value) {
          const match = category.value.toString().match(/(\d+)画/)
          if (match) {
            const strokeCount = `${match[1]}画`
            console.log(`✅ ${categoryName}: categoriesからvalue ${strokeCount}`)
            return strokeCount
          }
        }
      }
    }

    console.error(`❌ ${categoryName}の画数が取得できませんでした。`)
    return "1画"
  }

  // 詳細なアドバイスを生成する関数を追加
  const generateDetailedAdvice = (results: any, name: string, gender: string): string => {
    if (!results || !results.categories) return "分析結果が不完全です。"

    const categories = results.categories
    const totalScore = results.totalScore || 0

    // 各格の運勢を取得
    const tenFortune = categories.find((c: any) => c.name === "天格")?.fortune || ""
    const jinFortune = categories.find((c: any) => c.name === "人格")?.fortune || ""
    const chiFortune = categories.find((c: any) => c.name === "地格")?.fortune || ""
    const gaiFortune = categories.find((c: any) => c.name === "外格")?.fortune || ""
    const souFortune = categories.find((c: any) => c.name === "総格")?.fortune || ""

    // 運勢レベルを数値化
    const getFortuneLevel = (fortune: string): number => {
      if (fortune.includes("大吉")) return 5
      if (fortune.includes("中吉")) return 4
      if (fortune.includes("吉")) return 3
      if (fortune.includes("凶") && !fortune.includes("大凶") && !fortune.includes("中凶")) return 2
      if (fortune.includes("中凶")) return 1
      if (fortune.includes("大凶")) return 0
      return 2
    }

    const tenLevel = getFortuneLevel(tenFortune)
    const jinLevel = getFortuneLevel(jinFortune)
    const chiLevel = getFortuneLevel(chiFortune)
    const gaiLevel = getFortuneLevel(gaiFortune)
    const souLevel = getFortuneLevel(souFortune)

    // 吉凶の数をカウント
    const levels = [tenLevel, jinLevel, chiLevel, gaiLevel, souLevel]
    const excellentCount = levels.filter((l) => l >= 4).length // 大吉・中吉
    const goodCount = levels.filter((l) => l === 3).length // 吉
    const badCount = levels.filter((l) => l <= 2).length // 凶系

    // 性別に応じた敬称
    const honorific = gender === "female" ? "様" : "殿"

    // パターン別の詳細アドバイス生成
    let advice = ""

    // 1. 全て良好な場合（大吉・中吉が4つ以上）
    if (excellentCount >= 4) {
      advice = `${name}${honorific}の御名は、まさに天に愛された稀有な運勢を宿しております。

天格「${tenFortune}」により、社会において輝かしい地位を築き、多くの人々から尊敬と信頼を得る宿命にあります。特に${gender === "female" ? "女性らしい優雅さと知性" : "男性らしい力強さと決断力"}を兼ね備え、リーダーシップを発揮されるでしょう。

人格「${jinFortune}」は、内なる光を放つ素晴らしい性格運を示しており、${gender === "female" ? "慈愛に満ちた心と美しい感性" : "正義感と責任感の強さ"}により、周囲の人々を自然と惹きつける魅力をお持ちです。

地格「${chiFortune}」により、家庭環境に恵まれ、${gender === "female" ? "良き妻・良き母として家族を支え" : "家族の大黒柱として皆を守り"}、代々続く繁栄の礎を築かれます。

外格「${gaiFortune}」は対人関係の素晴らしさを表し、総格「${souFortune}」により人生全体を通じて幸福と成功に満ちた歩みを続けられるでしょう。

この優れた運勢を活かすため、常に謙虚な心を忘れず、周囲への感謝を大切にし、持って生まれた才能を社会のために役立てることで、さらなる開運と発展が約束されています。`
    }
    // 2. 良好だが一部に課題がある場合
    else if (excellentCount >= 2 && badCount <= 1) {
      const strongPoints = []
      const weakPoints = []

      if (tenLevel >= 4) strongPoints.push(`天格「${tenFortune}」による社会運の強さ`)
      else if (tenLevel <= 2) weakPoints.push(`天格「${tenFortune}」による社会運への注意`)

      if (jinLevel >= 4) strongPoints.push(`人格「${jinFortune}」による性格運の優秀さ`)
      else if (jinLevel <= 2) weakPoints.push(`人格「${jinFortune}」による性格運の課題`)

      if (chiLevel >= 4) strongPoints.push(`地格「${chiFortune}」による家庭運の良さ`)
      else if (chiLevel <= 2) weakPoints.push(`地格「${chiFortune}」による家庭運への配慮`)

      advice = `${name}${honorific}の御名は、優れた長所を持ちながらも、人生の学びを含んだ深い意味を持つ運勢です。

【優れた点】
${strongPoints.map((point) => `・${point}`).join("\n")}

これらの長所により、${gender === "female" ? "女性として" : "男性として"}の魅力と能力を十分に発揮し、多くの成功を収められるでしょう。

${
  weakPoints.length > 0
    ? `【注意すべき点】
${weakPoints.map((point) => `・${point}`).join("\n")}

これらの課題は、人生の成長のために与えられた学びの機会です。`
    : ""
}

総格「${souFortune}」が示すように、人生全体を通じて見れば、困難を乗り越えることでより大きな成功と幸福を手にする運命にあります。

${gender === "female" ? "女性らしい直感力と包容力" : "男性らしい決断力と行動力"}を活かし、長所を伸ばしながら短所を補うことで、真の開運への道が開かれます。特に人間関係を大切にし、周囲との調和を心がけることで、運勢はさらに向上するでしょう。`
    }
    // 3. バランス型の場合
    else if (goodCount >= 3 && badCount <= 2) {
      advice = `${name}${honorific}の御名は、中庸の美徳を体現した、安定感のある運勢を示しています。

天格「${tenFortune}」、人格「${jinFortune}」、地格「${chiFortune}」の調和により、${gender === "female" ? "女性として" : "男性として"}の品格と実力を兼ね備えた、信頼できる人物として周囲から評価されます。

このような運勢をお持ちの方は、派手さはないものの、着実に人生を築き上げる力があります。特に${gender === "female" ? "家庭と仕事の両立において優れた能力を発揮し" : "責任感の強さと誠実さにより、組織や家族から頼りにされ"}、長期的な成功を収められるでしょう。

外格「${gaiFortune}」は対人関係における${gender === "female" ? "優しさと協調性" : "誠実さと信頼性"}を表し、総格「${souFortune}」により、人生の後半にかけてより大きな幸福と安定を得られる暗示があります。

この運勢を最大限に活かすためには、日々の努力を怠らず、周囲との人間関係を大切にし、${gender === "female" ? "女性らしい細やかな気配りと温かさ" : "男性らしい責任感と決断力"}を発揮することが重要です。急がず焦らず、着実な歩みを続けることで、必ず大きな成果を得られるでしょう。`
    }
    // 4. 混在型（吉凶が混じっている場合）
    else if (excellentCount >= 1 && badCount >= 2) {
      const bestCategory = categories.find((c: any) => getFortuneLevel(c.fortune) >= 4)
      const worstCategory = categories.find((c: any) => getFortuneLevel(c.fortune) <= 1)

      advice = `${name}${honorific}の御名は、光と影が交錯する、人生の深い学びを含んだ運勢です。

【光明の部分】
${bestCategory ? `${bestCategory.name}「${bestCategory.fortune}」` : "優れた運勢の部分"}が、あなたの人生に大きな希望と可能性をもたらします。この優れた運勢により、${gender === "female" ? "女性として" : "男性として"}の特別な才能や魅力が開花し、多くの人々に良い影響を与える力をお持ちです。

【試練の部分】
${worstCategory ? `${worstCategory.name}「${worstCategory.fortune}」` : "注意を要する運勢の部分"}は、人生における重要な学びの機会を示しています。これらの困難は、あなたの魂を鍛え、より強く美しい人格を形成するための、天からの贈り物と考えるべきでしょう。

このような運勢をお持ちの方は、人生の浮き沈みを通じて、他者への深い理解と慈悲の心を育み、最終的には多くの人々を救い導く使命を担っています。

総格「${souFortune}」が示すように、人生全体を通じて見れば、困難を乗り越えた先に大きな成功と精神的な充実が待っています。

${gender === "female" ? "女性らしい強さと優しさ" : "男性らしい勇気と忍耐力"}を武器に、決して諦めることなく前進し続けることで、運命を好転させ、真の幸福を掴むことができるでしょう。特に人助けや社会貢献を心がけることで、運勢は大きく向上します。`
    }
    // 5. 厳しい運勢の場合
    else if (badCount >= 3) {
      advice = `${name}${honorific}の御名は、現世において多くの試練を背負う、深い意味を持つ運勢です。

天格「${tenFortune}」、人格「${jinFortune}」、地格「${chiFortune}」の配置は、一見困難に見えますが、これは魂の成長のために選ばれた特別な道筋です。

このような運勢をお持ちの方は、人生の早い段階から様々な困難に直面しますが、それらは全て、あなたを強く美しい人格へと導くための神仏の深い配慮なのです。

【困難を乗り越える力】
・${gender === "female" ? "女性らしい直感力と包容力" : "男性らしい不屈の精神と行動力"}
・人の痛みを理解する深い共感力
・逆境に負けない強靭な精神力
・他者を救い導く使命感

外格「${gaiFortune}」、総格「${souFortune}」が示すように、人生の後半にかけて、これまでの苦労が大きな実りとなって現れます。

【開運への道筋】
1. 日々の善行を積み重ねる
2. 困っている人への手助けを惜しまない
3. 感謝の心を忘れない
4. 学び続ける姿勢を持つ
5. ${gender === "female" ? "女性らしい優しさと強さ" : "男性らしい責任感と決断力"}を発揮する

あなたの人生は、多くの人々に希望と勇気を与える、光り輝く存在となる宿命にあります。現在の困難は一時的なものであり、必ずや大きな成功と幸福が訪れることを、運勢は約束しています。

決して諦めることなく、一歩一歩着実に歩み続けてください。あなたの努力と善行は、必ず天に届き、運命を好転させる力となるでしょう。`
    }
    // 6. その他のケース
    else {
      const dominantLevel = Math.max(...levels)
      const dominantFortune = dominantLevel >= 4 ? "吉運" : dominantLevel >= 3 ? "安定運" : "注意運"

      advice = `${name}${honorific}の御名は、${dominantFortune}を基調とした、変化に富んだ運勢を示しています。

天格「${tenFortune}」による社会運、人格「${jinFortune}」による性格運、地格「${chiFortune}」による家庭運が、それぞれ異なる表情を見せ、人生の各段階において様々な経験をもたらします。

このような運勢をお持ちの方は、一つの分野に固執せず、多方面にわたって才能を発揮する可能性があります。${gender === "female" ? "女性として" : "男性として"}の多面的な魅力により、様々な場面で活躍されるでしょう。

外格「${gaiFortune}」は対人関係における柔軟性を表し、総格「${souFortune}」により、人生全体を通じて豊かな経験と学びを得られます。

【成功への鍵】
・時機を見極める洞察力を養う
・変化を恐れず、新しいことに挑戦する
・人との出会いを大切にする
・${gender === "female" ? "女性らしい感性と適応力" : "男性らしい決断力と実行力"}を活かす
・常に学び続ける姿勢を持つ

あなたの人生は、まさに変化に富んだドラマのようなものとなるでしょう。その中で得られる経験と知識は、かけがえのない財産となり、最終的には大きな成功と満足をもたらします。

柔軟性と適応力を武器に、人生の波を上手に乗りこなしていけば、必ずや素晴らしい未来が開かれるでしょう。`
    }

    return advice
  }

  // プランに基づくカテゴリ表示制御
  const getDisplayCategories = () => {
    if (!results.categories) return []

    if (currentPlan === "free") {
      // 無料プランでは総格のみ表示
      return results.categories.filter((cat: any) => cat.name === "総格")
    }

    // ベーシック・プレミアムプランでは全カテゴリ表示
    return results.categories
  }

  // デバッグ用ログ
  console.log("=== NameAnalysisResult デバッグ ===")
  console.log("results:", results)
  console.log("currentPlan:", currentPlan)
  console.log("canViewDetailedAnalysis:", canViewDetailedAnalysis)
  console.log("canViewRanking:", canViewRanking)

  const displayCategories = getDisplayCategories()
  
  // デバッグ用ログ追加
  console.log("displayCategories:", displayCategories)
  console.log("displayCategories.length:", displayCategories.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>「{name}」さんの姓名判断結果</CardTitle>
        <CardDescription>
          {currentPlan === "free" ? "基本鑑定" : "詳細鑑定（全ての格）"} - {gender === "male" ? "男性" : "女性"} -
          当姓名判断は、全て旧字体での鑑定となっております。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 総合スコア表示 */}
        {results.totalScore !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">総合運勢スコア</span>
              <span className="font-bold">{results.totalScore}点</span>
            </div>
            <Progress value={Math.min(100, (results.totalScore / 100) * 100)} className="h-2" />
          </div>
        )}


        {/* 五格表示 */}
        {displayCategories.length > 0 ? (
          <div className="space-y-4">
            {displayCategories.map((category: any, index: number) => {
              const strokeCount = getStrokeCount(category.name)

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">（{strokeCount}）</span>
                      {category.fortune && (
                        <Badge
                          className={`
${getBadgeVariant(category.fortune) === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
${getBadgeVariant(category.fortune) === "dark-pink" ? "bg-pink-700 hover:bg-pink-800 text-white" : ""}
${getBadgeVariant(category.fortune) === "light-pink" ? "bg-pink-200 hover:bg-pink-300 text-pink-800" : ""}
${getBadgeVariant(category.fortune) === "white" ? "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300" : ""}
${getBadgeVariant(category.fortune) === "gray" ? "bg-gray-400 hover:bg-gray-500 text-white" : ""}
${getBadgeVariant(category.fortune) === "dark-gray" ? "bg-gray-700 hover:bg-gray-800 text-white" : ""}
`}
                          variant={getBadgeVariant(category.fortune)}
                        >
                          {category.fortune}
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold">{calculateFortuneScore(category.fortune) || 0}点</span>
                  </div>
                  <Progress
                    value={Math.min(100, ((calculateFortuneScore(category.fortune) || 0) / 100) * 100)}
                    className="h-2"
                  />
                  {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                  {category.explanation && <p className="text-sm italic">{category.explanation}</p>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">🐛 デバッグ情報</h3>
            <div className="text-sm space-y-1">
              <div>currentPlan: {currentPlan}</div>
              <div>displayCategories.length: {displayCategories.length}</div>
              <div>results.categories: {results.categories ? '存在' : 'なし'}</div>
              {results.categories && (
                <div>results.categories.length: {results.categories.length}</div>
              )}
            </div>
          </div>
        )}

        {/* 無料プランでの五格制限表示 */}
        {currentPlan === "free" && displayCategories.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-700">詳細な五格分析</h3>
              <Badge variant="outline" className="border-blue-200 text-blue-600">
                ベーシック以上
              </Badge>
            </div>
            <div className="text-center py-4">
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="p-2 bg-white rounded border">
                  <Lock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-gray-500">天格</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <Lock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-gray-500">人格</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <Lock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-gray-500">地格</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <Lock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-gray-500">外格</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                天格・人格・地格・外格の詳細分析をご覧いただけます。
                <br />
                各格の運勢と詳しい解説をお楽しみください。
              </p>
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  ベーシックプランで五格分析を見る
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 詳細分析表示 */}
        {results.details && canViewDetailedAnalysis && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium mb-2">詳細分析</h3>
            <div className="grid grid-cols-2 gap-2">
              {results.details.map((detail: any, index: number) => {
                const displayValue = detail.value || "0画"

                return (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{detail.name}: </span>
                    <span>{displayValue}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 文字別画数表示 */}
        {results.characterDetails && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium mb-2">文字別画数</h3>
            <div className="grid grid-cols-2 gap-2">
              {results.characterDetails.map((detail: any, index: number) => {
                console.log(`=== 文字別画数デバッグ [${index}] ===`)
                console.log(`- character: "${detail.character}"`)
                console.log(`- strokes: ${detail.strokes}`)
                console.log(`- isDefault: ${detail.isDefault}`)
                console.log(`- isReisuu: ${detail.isReisuu}`)

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm flex items-center gap-1 cursor-help">
                          <span className="font-medium">{detail.name}: </span>
                          <span>
                            {detail.character} (
                            <span
                              className={detail.isDefault ? "text-red-500 font-bold" : ""}
                              style={detail.isDefault ? { color: "#ef4444", fontWeight: "bold" } : {}}
                            >
                              {detail.strokes}画
                            </span>
                            ){detail.isReisuu && <span className="text-red-600 font-bold"> ※霊数</span>}
                            {detail.isDefault && <span className="text-red-500 font-bold"> ※推定</span>}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {detail.isReisuu
                            ? "霊数：一字姓・一字名の場合に追加される「一」の画数"
                            : detail.isDefault
                              ? "この文字の画数データが見つからないため、推定値を使用しています"
                              : `この文字は${detail.strokes}画です`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        )}

        {/* 霊数情報表示 */}
        {results.reisuuInfo && (results.reisuuInfo.hasReisuuInLastName || results.reisuuInfo.hasReisuuInFirstName) && (
          <div className="mt-4 pt-4 border-t">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm font-medium">霊数ルールが適用されています</p>
                {results.reisuuInfo.hasReisuuInLastName && (
                  <p className="text-sm">• 一字姓のため、姓の上に霊数「一」（1画）を追加</p>
                )}
                {results.reisuuInfo.hasReisuuInFirstName && (
                  <p className="text-sm">• 一字名のため、名の下に霊数「一」（1画）を追加</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  ※霊数は天格・地格・外格の計算に含まれますが、総格の計算には含まれません
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* 推測マーク案内 */}
        {results.characterDetails && results.characterDetails.some((detail: any) => detail.isDefault) && (
          <div className="mt-4 pt-4 border-t">
            <Alert className="border-orange-200 bg-orange-50">
              <InfoIcon className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <p className="text-sm font-medium text-orange-800">※推定マークについて</p>
                <p className="text-sm text-orange-700 mt-1">
                  推測マークがついた文字は画数データベースに無い文字の場合があり、
                  <strong>正しく算出できていない可能性があります</strong>。
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  <strong>すぐに追加致しますので、お知らせ願えれば幸いです。</strong>
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-800 mb-2">📝 お知らせ方法：</p>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• お問い合わせフォームからご連絡ください</li>
                    <li>• 該当する文字名をお教えください</li>
                    <li>• 24時間以内にデータベースに追加いたします</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* 詳細アドバイス */}
        {results.advice && canViewDetailedAnalysis && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsAdviceOpen(!isAdviceOpen)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">詳細アドバイス</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{isAdviceOpen ? "閉じる" : "開く"}</span>
                {isAdviceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </Button>
            {isAdviceOpen && (
              <div className="text-sm whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg mt-2 animate-in slide-in-from-top-2 duration-200">
                {generateDetailedAdvice(results, name, gender)}
              </div>
            )}
          </div>
        )}

        {/* 無料プランでのアドバイス制限表示 */}
        {!canViewDetailedAnalysis && (
          <div className="mt-4 pt-4 border-t">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-700">詳細アドバイス</h3>
                <Badge variant="outline" className="border-blue-200 text-blue-600">
                  ベーシック以上
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                あなたの名前に込められた深い意味と、人生における開運のアドバイスをお読みいただけます。
              </p>
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  詳細アドバイスを読む
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 旧字体変換情報 */}
        {results.kanjiInfo && results.kanjiInfo.hasChanged && (
          <div className="mt-4 pt-4 border-t">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm font-medium">入力された名前には新字体が含まれています。旧字体で占いました。</p>
                {results.kanjiInfo.oldLastName && <p className="text-sm">姓: {results.kanjiInfo.oldLastName}</p>}
                {results.kanjiInfo.oldFirstName && <p className="text-sm">名: {results.kanjiInfo.oldFirstName}</p>}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* AI開運アドバイス（無料で利用可能） */}
        <div className="mt-6">
          <AIFortuneAdvisor 
            analysisData={{
              name,
              gender: gender as "male" | "female",
              categories: results.categories || [],
              totalScore: results.totalScore || 0,
              elements: results.elements
            }}
          />
        </div>

        {/* デバッグ情報表示（開発時のみ） */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2 text-red-600">🐛 デバッグ情報</h3>
            <div className="text-xs space-y-1">
              <div>プラン: {currentPlan}</div>
              <div>総合スコア: {results.totalScore}</div>
              <div>表示カテゴリ数: {displayCategories.length}</div>
              <div>詳細分析可能: {canViewDetailedAnalysis ? "Yes" : "No"}</div>
              <div>格付けランク可能: {canViewRanking ? "Yes" : "No"}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
