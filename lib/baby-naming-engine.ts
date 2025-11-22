// 赤ちゃん名付けエンジン - 完全版
import { analyzeNameFortune } from "./name-data-simple-fixed"
import { customFortuneData } from "./fortune-data-custom"
import { calculateNameRankingPoints } from "./name-ranking"
import babyNamesData from "@/data/baby-names.json"

export interface NamingRequest {
  lastName: string
  gender: "male" | "female"
  preferences?: {
    strictMode?: boolean
    avoidKyousu?: boolean
    minScore?: number
    allowSemiRecommended?: boolean
    flexibleMode?: boolean
  }
}

export interface BabyNameCandidate {
  kanji: string
  reading: string
  meaning: string
  totalScore: number
  powerLevel: number
  powerRank: string
  hasNoKyousu: boolean
  isGoodFortune: boolean
  fortuneAnalysis: {
    ten: number
    jin: number
    chi: number
    gai: number
    total: number
  }
  fortuneDetails: {
    tenFormat: number
    jinFormat: number
    chiFormat: number
    gaiFormat: number
    totalFormat: number
    tenFortune: string
    jinFortune: string
    chiFortune: string
    gaiFortune: string
    totalFortune: string
  }
  characteristics: string[]
  warnings?: string[]
  searchMode?: string
}

// JSONファイルから名前データを読み込み
const MALE_NAMES = babyNamesData.male || []
const FEMALE_NAMES = babyNamesData.female || []

// 名前生成関数
export function generateOptimalNames(request: NamingRequest, maxResults = 3): BabyNameCandidate[] {
  try {
    console.log("🚀 名前生成開始:", { request, maxResults })
    
    // 入力検証
    if (!request.lastName || !request.gender) {
      console.error("❌ 必須パラメータが不足:", request)
      return []
    }
    
    const candidates: BabyNameCandidate[] = []
    const namePool = request.gender === "male" ? MALE_NAMES : FEMALE_NAMES
    
    console.log(`📚 名前プール: ${namePool.length}個の候補`)

    console.log(`\n🎯 名前生成開始`)
    console.log(`   姓: ${request.lastName}`)
    console.log(`   性別: ${request.gender}`)
    console.log(`   候補数: ${namePool.length}個`)

    // 配列をシャッフル
    const shuffledNamePool = shuffleArray(namePool)

  for (const nameData of shuffledNamePool) {
    try {
      console.log(`🔍 分析中: ${nameData.kanji}`)
      
      const analysis = analyzeNameFortune(request.lastName, nameData.kanji, request.gender, customFortuneData)
      if (!analysis) {
        console.log(`⚠️ 分析失敗: ${nameData.kanji}`)
        continue
      }

      // 厳格モードの条件チェック
      if (request.preferences?.strictMode) {
        if (analysis.totalScore < 65) continue
        if (hasKyousu(analysis)) continue
      }

      // 名前ランキングポイントを計算
      let rankingResult
      try {
        console.log(`📊 ランキング計算中: ${nameData.kanji}`)
        rankingResult = calculateNameRankingPoints(
          request.lastName,
          nameData.kanji,
          customFortuneData,
          request.gender,
        )
        console.log(`✅ ランキング計算完了: ${nameData.kanji} - ${rankingResult.totalPoints}点`)
      } catch (error) {
        console.error(`❌ ランキング計算エラー: ${nameData.kanji}`, error)
        continue
      }

      // デバッグ: rankingResultを確認
      if (!rankingResult || rankingResult.totalPoints === undefined) {
        console.error(`❌ rankingResultが無効: ${nameData.kanji}`, rankingResult)
      } else {
        console.log(`✅ candidate作成: ${nameData.kanji} - totalScore: ${rankingResult.totalPoints}`)
      }

      const candidate: BabyNameCandidate = {
        kanji: nameData.kanji,
        reading: nameData.reading,
        meaning: nameData.meaning,
        totalScore: rankingResult?.totalPoints ?? 0,
        powerLevel: rankingResult?.powerLevel ?? 0,
        powerRank: rankingResult?.powerRank ?? "D",
        hasNoKyousu: !hasKyousu(analysis),
        isGoodFortune: (rankingResult?.totalPoints ?? 0) >= 65,
        searchMode: request.preferences?.strictMode ? "厳格モード" : "標準モード",
        fortuneAnalysis: {
          ten: analysis.categories?.find((c: any) => c.name === "天格")?.score || 0,
          jin: analysis.categories?.find((c: any) => c.name === "人格")?.score || 0,
          chi: analysis.categories?.find((c: any) => c.name === "地格")?.score || 0,
          gai: analysis.categories?.find((c: any) => c.name === "外格")?.score || 0,
          total: analysis.categories?.find((c: any) => c.name === "総格")?.score || 0,
        },
        fortuneDetails: {
          tenFormat: analysis.tenFormat || 0,
          jinFormat: analysis.jinFormat || 0,
          chiFormat: analysis.chiFormat || 0,
          gaiFormat: analysis.gaiFormat || 0,
          totalFormat: analysis.totalFormat || 0,
          tenFortune: analysis.categories?.find((c: any) => c.name === "天格")?.fortune || "",
          jinFortune: analysis.categories?.find((c: any) => c.name === "人格")?.fortune || "",
          chiFortune: analysis.categories?.find((c: any) => c.name === "地格")?.fortune || "",
          gaiFortune: analysis.categories?.find((c: any) => c.name === "外格")?.fortune || "",
          totalFortune: analysis.categories?.find((c: any) => c.name === "総格")?.fortune || "",
        },
        characteristics: generateCharacteristics(analysis) || [],
      }

      candidates.push(candidate)

      if (candidates.length >= maxResults * 3) break
    } catch (error) {
      console.error(`名前分析エラー: ${nameData.kanji}`, error)
      continue
    }
  }

  // スコア順でソート
  candidates.sort((a, b) => {
    if (request.preferences?.strictMode) {
      // 厳格モードでは凶数なしを最優先
      if (a.hasNoKyousu !== b.hasNoKyousu) {
        return a.hasNoKyousu ? -1 : 1
      }
    }
    return b.totalScore - a.totalScore
  })

  const uniqueCandidates = candidates.filter(
    (candidate, index, self) => index === self.findIndex((c) => c.kanji === candidate.kanji),
  )

  console.log(`\n📋 最終候補: ${uniqueCandidates.length}個`)
  uniqueCandidates.slice(0, 5).forEach((c, i) => {
    console.log(`${i + 1}. ${c.kanji}（${c.reading}）- ${c.totalScore}点`)
  })

  // 上位候補からランダムに選択する（ランダム性を確保）
  // 上位30個または候補全体のうち、スコアが一定以上の候補から選択
  const minScore = 50 // 最低スコアフィルター（任意で調整可能）
  const qualifiedCandidates = uniqueCandidates.filter(c => c.totalScore >= minScore)
  
  let candidatesToSelectFrom: BabyNameCandidate[]
  if (qualifiedCandidates.length >= maxResults * 3) {
    // 十分な候補がある場合、上位（maxResults * 3）個から選択
    candidatesToSelectFrom = qualifiedCandidates.slice(0, maxResults * 3)
  } else if (qualifiedCandidates.length >= maxResults) {
    // 最低限の候補がある場合、それらから選択
    candidatesToSelectFrom = qualifiedCandidates
  } else {
    // 候補が少ない場合、全体から選択
    candidatesToSelectFrom = uniqueCandidates.slice(0, maxResults * 3)
  }
  
  // ランダムにシャッフルして選択
  const shuffled = shuffleArray(candidatesToSelectFrom)
  
  return shuffled.slice(0, maxResults)
  } catch (error) {
    console.error("❌ 名前生成エラー:", error)
    console.error("エラー詳細:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      request
    })
    return []
  }
}

// 凶数チェック関数（大凶・中凶のみを除外、凶は許容）
function hasKyousu(analysis: any): boolean {
  if (!analysis.categories) return false

  return analysis.categories.some((category: any) => {
    const fortune = category.fortune || ""
    // 大凶と中凶のみを除外（凶は許容）
    return fortune.includes("大凶") || fortune.includes("中凶")
  })
}

// 特徴生成関数
function generateCharacteristics(analysis: any): string[] {
  const characteristics = []
  
  // totalScoreが存在しない場合は空配列を返す
  const totalScore = analysis?.totalScore ?? 0

  if (totalScore >= 90) {
    characteristics.push("非常に優秀", "指導力がある", "成功運が強い")
  } else if (totalScore >= 80) {
    characteristics.push("優秀", "協調性がある", "安定した運勢")
  } else if (totalScore >= 70) {
    characteristics.push("良好", "努力家", "堅実な運勢")
  } else if (totalScore >= 60) {
    characteristics.push("普通", "バランスが良い", "平穏な運勢")
  } else {
    characteristics.push("個性的", "独特な魅力", "変化に富む運勢")
  }

  return characteristics.slice(0, 6)
}

// 配列シャッフル関数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 名前数取得関数
export function getNameCount(): { male: number; female: number; total: number } {
  return {
    male: MALE_NAMES.length,
    female: FEMALE_NAMES.length,
    total: MALE_NAMES.length + FEMALE_NAMES.length,
  }
}
