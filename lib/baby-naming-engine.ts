// 赤ちゃん名付けエンジン - 完全版
import { analyzeNameFortune } from "./name-data-simple-fixed"
import { customFortuneData } from "./fortune-data-custom"
import { calculateNameRankingPoints } from "./name-ranking"

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

// 🔥 男性名前候補（画数データ確認済み）
const MALE_NAMES = [
  // 2021-2025年人気ランキング上位
  { kanji: "碧", reading: "あお", meaning: "美しい青緑色" },
  { kanji: "蓮", reading: "れん", meaning: "蓮の花のように清らか" },
  { kanji: "陽翔", reading: "はると", meaning: "太陽のように翔ける" },
  { kanji: "湊", reading: "みなと", meaning: "人が集まる港" },
  { kanji: "蒼", reading: "あおい", meaning: "蒼い空のように広い" },
  { kanji: "樹", reading: "いつき", meaning: "大樹のように成長" },
  { kanji: "大翔", reading: "ひろと", meaning: "大きく翔ける" },
  { kanji: "悠真", reading: "ゆうま", meaning: "ゆったりと真っ直ぐ" },
  { kanji: "結翔", reading: "ゆいと", meaning: "結ばれて翔ける" },
  { kanji: "律", reading: "りつ", meaning: "規律正しい" },

  // 伝統的な名前
  { kanji: "太郎", reading: "たろう", meaning: "長男" },
  { kanji: "一郎", reading: "いちろう", meaning: "第一の男子" },
  { kanji: "次郎", reading: "じろう", meaning: "次男" },
  { kanji: "三郎", reading: "さぶろう", meaning: "三男" },

  // 自然系の名前
  { kanji: "海斗", reading: "かいと", meaning: "海のように広い心" },
  { kanji: "大地", reading: "だいち", meaning: "大きな大地" },
  { kanji: "春太", reading: "はるた", meaning: "春のように暖かい" },
  { kanji: "夏樹", reading: "なつき", meaning: "夏の木" },
  { kanji: "秋人", reading: "あきと", meaning: "秋のように実り豊か" },
  { kanji: "冬馬", reading: "とうま", meaning: "冬のように清らか" },

  // 現代的な名前
  { kanji: "奏", reading: "かなで", meaning: "音楽を奏でる" },
  { kanji: "廉", reading: "れん", meaning: "清廉な" },
  { kanji: "凛", reading: "りん", meaning: "凛々しい" },
  { kanji: "翼", reading: "つばさ", meaning: "大きな翼" },
  { kanji: "颯", reading: "はやて", meaning: "颯爽とした" },

  // 力強い名前
  { kanji: "剛", reading: "つよし", meaning: "剛強な" },
  { kanji: "勇", reading: "いさむ", meaning: "勇敢な" },
  { kanji: "健", reading: "けん", meaning: "健康な" },
  { kanji: "強", reading: "つよし", meaning: "強い" },

  // 知性的な名前
  { kanji: "智", reading: "さとし", meaning: "智恵のある" },
  { kanji: "学", reading: "まなぶ", meaning: "学問を愛する" },
  { kanji: "賢", reading: "けん", meaning: "賢い" },
  { kanji: "聡", reading: "さとし", meaning: "聡明な" },
]

// 🔥 女性名前候補（画数データ確認済み）
const FEMALE_NAMES = [
  // 2021-2025年人気ランキング上位
  { kanji: "紬", reading: "つむぎ", meaning: "紬のように美しい" },
  { kanji: "翠", reading: "すい", meaning: "翠のように美しい緑" },
  { kanji: "凛", reading: "りん", meaning: "凛々しい" },
  { kanji: "陽葵", reading: "ひまり", meaning: "太陽のような葵" },
  { kanji: "芽依", reading: "めい", meaning: "芽のように成長" },
  { kanji: "葵", reading: "あおい", meaning: "葵の花" },
  { kanji: "心陽", reading: "こはる", meaning: "心の太陽" },
  { kanji: "陽菜", reading: "ひな", meaning: "太陽の菜" },
  { kanji: "美咲", reading: "みさき", meaning: "美しく咲く" },
  { kanji: "桜", reading: "さくら", meaning: "桜の花" },

  // 伝統的な名前
  { kanji: "愛子", reading: "あいこ", meaning: "愛される子" },
  { kanji: "恵子", reading: "けいこ", meaning: "恵まれた子" },
  { kanji: "美子", reading: "よしこ", meaning: "美しい子" },
  { kanji: "花子", reading: "はなこ", meaning: "花のような子" },

  // 花・植物系
  { kanji: "梅", reading: "うめ", meaning: "梅の花" },
  { kanji: "菊", reading: "きく", meaning: "菊の花" },
  { kanji: "蘭", reading: "らん", meaning: "蘭の花" },
  { kanji: "椿", reading: "つばき", meaning: "椿の花" },
  { kanji: "牡丹", reading: "ぼたん", meaning: "牡丹の花" },
  { kanji: "薔薇", reading: "ばら", meaning: "薔薇の花" },

  // 現代的な名前
  { kanji: "愛花", reading: "あいか", meaning: "愛の花" },
  { kanji: "音羽", reading: "おとは", meaning: "音の羽" },
  { kanji: "希子", reading: "きこ", meaning: "希望の子" },
  { kanji: "未来", reading: "みらい", meaning: "未来" },
  { kanji: "夢", reading: "ゆめ", meaning: "夢" },

  // 美しい名前
  { kanji: "美月", reading: "みつき", meaning: "美しい月" },
  { kanji: "美星", reading: "みほし", meaning: "美しい星" },
  { kanji: "美空", reading: "みそら", meaning: "美しい空" },
  { kanji: "美海", reading: "みうみ", meaning: "美しい海" },

  // 優雅な名前
  { kanji: "雅", reading: "みやび", meaning: "雅やか" },
  { kanji: "麗", reading: "うらら", meaning: "麗しい" },
  { kanji: "華", reading: "はな", meaning: "華やか" },
  { kanji: "優", reading: "ゆう", meaning: "優しい" },
]

// 名前生成関数
export function generateOptimalNames(request: NamingRequest, maxResults = 3): BabyNameCandidate[] {
  const candidates: BabyNameCandidate[] = []
  const namePool = request.gender === "male" ? MALE_NAMES : FEMALE_NAMES

  console.log(`\n🎯 名前生成開始`)
  console.log(`   姓: ${request.lastName}`)
  console.log(`   性別: ${request.gender}`)
  console.log(`   候補数: ${namePool.length}個`)

  // 配列をシャッフル
  const shuffledNamePool = shuffleArray(namePool)

  for (const nameData of shuffledNamePool) {
    try {
      const analysis = analyzeNameFortune(request.lastName, nameData.kanji, request.gender, customFortuneData)
      if (!analysis) continue

      // 厳格モードの条件チェック
      if (request.preferences?.strictMode) {
        if (analysis.totalScore < 65) continue
        if (hasKyousu(analysis)) continue
      }

      // 名前ランキングポイントを計算
      const rankingResult = calculateNameRankingPoints(
        request.lastName,
        nameData.kanji,
        customFortuneData,
        request.gender,
      )

      const candidate: BabyNameCandidate = {
        kanji: nameData.kanji,
        reading: nameData.reading,
        meaning: nameData.meaning,
        totalScore: analysis.totalScore,
        powerLevel: rankingResult.powerLevel,
        powerRank: rankingResult.powerRank,
        hasNoKyousu: !hasKyousu(analysis),
        isGoodFortune: analysis.totalScore >= 65,
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
        characteristics: generateCharacteristics(analysis),
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

  return uniqueCandidates.slice(0, maxResults)
}

// 凶数チェック関数
function hasKyousu(analysis: any): boolean {
  if (!analysis.categories) return false

  return analysis.categories.some((category: any) => {
    const fortune = category.fortune || ""
    return fortune.includes("凶") || fortune.includes("大凶")
  })
}

// 特徴生成関数
function generateCharacteristics(analysis: any): string[] {
  const characteristics = []

  if (analysis.totalScore >= 90) {
    characteristics.push("非常に優秀", "指導力がある", "成功運が強い")
  } else if (analysis.totalScore >= 80) {
    characteristics.push("優秀", "協調性がある", "安定した運勢")
  } else if (analysis.totalScore >= 70) {
    characteristics.push("良好", "努力家", "堅実な運勢")
  } else if (analysis.totalScore >= 60) {
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
