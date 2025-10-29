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

  // 2024年人気名前追加
  { kanji: "翔太", reading: "しょうた", meaning: "翔ける太陽" },
  { kanji: "大和", reading: "やまと", meaning: "大和の心" },
  { kanji: "健太", reading: "けんた", meaning: "健康で強い" },
  { kanji: "拓也", reading: "たくや", meaning: "開拓する" },
  { kanji: "直樹", reading: "なおき", meaning: "真っ直ぐな木" },
  { kanji: "慎吾", reading: "しんご", meaning: "慎み深い" },
  { kanji: "雄太", reading: "ゆうた", meaning: "雄々しい" },
  { kanji: "和也", reading: "かずや", meaning: "和やかな" },
  { kanji: "誠", reading: "まこと", meaning: "誠実な" },
  { kanji: "光", reading: "ひかる", meaning: "光る" },

  // 自然・季節系追加
  { kanji: "風太", reading: "ふうた", meaning: "風のように自由" },
  { kanji: "雪斗", reading: "ゆきと", meaning: "雪のように清らか" },
  { kanji: "雷", reading: "らい", meaning: "雷のように力強い" },
  { kanji: "雲", reading: "くも", meaning: "雲のように高く" },
  { kanji: "虹", reading: "にじ", meaning: "虹のように美しい" },
  { kanji: "星", reading: "ほし", meaning: "星のように輝く" },
  { kanji: "月", reading: "つき", meaning: "月のように清らか" },
  { kanji: "太陽", reading: "たいよう", meaning: "太陽のように明るい" },

  // 現代的な名前追加
  { kanji: "空", reading: "そら", meaning: "空のように広い心" },
  { kanji: "心", reading: "こころ", meaning: "心の優しさ" },
  { kanji: "愛", reading: "あい", meaning: "愛に満ちた" },
  { kanji: "希望", reading: "きぼう", meaning: "希望に満ちた" },
  { kanji: "未来", reading: "みらい", meaning: "未来に向かって" },
  { kanji: "夢", reading: "ゆめ", meaning: "夢を追いかける" },
  { kanji: "光", reading: "ひかり", meaning: "光のように明るい" },
  { kanji: "輝", reading: "かがやき", meaning: "輝き続ける" },

  // 伝統的な名前追加
  { kanji: "正一", reading: "しょういち", meaning: "正しい第一人者" },
  { kanji: "正二", reading: "しょうじ", meaning: "正しい第二人者" },
  { kanji: "正三", reading: "しょうぞう", meaning: "正しい第三人者" },
  { kanji: "正四", reading: "しょうし", meaning: "正しい第四人者" },
  { kanji: "正五", reading: "しょうご", meaning: "正しい第五人者" },
  { kanji: "正六", reading: "しょうろく", meaning: "正しい第六人者" },
  { kanji: "正七", reading: "しょうしち", meaning: "正しい第七人者" },
  { kanji: "正八", reading: "しょうはち", meaning: "正しい第八人者" },
  { kanji: "正九", reading: "しょうく", meaning: "正しい第九人者" },
  { kanji: "正十", reading: "しょうじゅう", meaning: "正しい第十人者" },

  // 季節の名前追加
  { kanji: "春一", reading: "はるいち", meaning: "春の第一人者" },
  { kanji: "夏一", reading: "なついち", meaning: "夏の第一人者" },
  { kanji: "秋一", reading: "あきいち", meaning: "秋の第一人者" },
  { kanji: "冬一", reading: "ふゆいち", meaning: "冬の第一人者" },
  { kanji: "春二", reading: "はるじ", meaning: "春の第二人者" },
  { kanji: "夏二", reading: "なつじ", meaning: "夏の第二人者" },
  { kanji: "秋二", reading: "あきじ", meaning: "秋の第二人者" },
  { kanji: "冬二", reading: "ふゆじ", meaning: "冬の第二人者" },

  // 数字の名前追加
  { kanji: "一", reading: "いち", meaning: "第一人者" },
  { kanji: "二", reading: "じ", meaning: "第二人者" },
  { kanji: "三", reading: "ぞう", meaning: "第三人者" },
  { kanji: "四", reading: "し", meaning: "第四人者" },
  { kanji: "五", reading: "ご", meaning: "第五人者" },
  { kanji: "六", reading: "ろく", meaning: "第六人者" },
  { kanji: "七", reading: "しち", meaning: "第七人者" },
  { kanji: "八", reading: "はち", meaning: "第八人者" },
  { kanji: "九", reading: "く", meaning: "第九人者" },
  { kanji: "十", reading: "じゅう", meaning: "第十人者" },
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

  // 2024年人気名前追加
  { kanji: "美月", reading: "みつき", meaning: "美しい月" },
  { kanji: "愛美", reading: "あいみ", meaning: "愛らしく美しい" },
  { kanji: "彩花", reading: "あやか", meaning: "彩りの花" },
  { kanji: "心美", reading: "ここみ", meaning: "心が美しい" },
  { kanji: "優花", reading: "ゆうか", meaning: "優しい花" },
  { kanji: "美咲", reading: "みさき", meaning: "美しく咲く" },
  { kanji: "愛菜", reading: "あいな", meaning: "愛の菜" },
  { kanji: "心愛", reading: "ここあ", meaning: "心に愛" },
  { kanji: "美空", reading: "みそら", meaning: "美しい空" },
  { kanji: "愛海", reading: "あいみ", meaning: "愛の海" },

  // 自然・季節系追加
  { kanji: "風花", reading: "ふうか", meaning: "風に舞う花" },
  { kanji: "雪菜", reading: "ゆきな", meaning: "雪のような菜" },
  { kanji: "雷花", reading: "らいか", meaning: "雷のような花" },
  { kanji: "雲", reading: "くも", meaning: "雲のように美しい" },
  { kanji: "虹", reading: "にじ", meaning: "虹のように美しい" },
  { kanji: "星", reading: "ほし", meaning: "星のように輝く" },
  { kanji: "月", reading: "つき", meaning: "月のように清らか" },
  { kanji: "太陽", reading: "たいよう", meaning: "太陽のように明るい" },

  // 現代的な名前追加
  { kanji: "空", reading: "そら", meaning: "空のように広い心" },
  { kanji: "心", reading: "こころ", meaning: "心の優しさ" },
  { kanji: "愛", reading: "あい", meaning: "愛に満ちた" },
  { kanji: "希望", reading: "きぼう", meaning: "希望に満ちた" },
  { kanji: "未来", reading: "みらい", meaning: "未来に向かって" },
  { kanji: "夢", reading: "ゆめ", meaning: "夢を追いかける" },
  { kanji: "光", reading: "ひかり", meaning: "光のように明るい" },
  { kanji: "輝", reading: "かがやき", meaning: "輝き続ける" },
  { kanji: "笑", reading: "えみ", meaning: "笑顔が美しい" },
  { kanji: "幸", reading: "さち", meaning: "幸せに満ちた" },

  // 伝統的な名前追加
  { kanji: "美一", reading: "みいち", meaning: "美しい第一人者" },
  { kanji: "美二", reading: "みじ", meaning: "美しい第二人者" },
  { kanji: "美三", reading: "みぞう", meaning: "美しい第三人者" },
  { kanji: "美四", reading: "みし", meaning: "美しい第四人者" },
  { kanji: "美五", reading: "みご", meaning: "美しい第五人者" },
  { kanji: "美六", reading: "みろく", meaning: "美しい第六人者" },
  { kanji: "美七", reading: "みしち", meaning: "美しい第七人者" },
  { kanji: "美八", reading: "みはち", meaning: "美しい第八人者" },
  { kanji: "美九", reading: "みく", meaning: "美しい第九人者" },
  { kanji: "美十", reading: "みじゅう", meaning: "美しい第十人者" },

  // 季節の名前追加
  { kanji: "春美", reading: "はるみ", meaning: "春のように美しい" },
  { kanji: "夏美", reading: "なつみ", meaning: "夏のように美しい" },
  { kanji: "秋美", reading: "あきみ", meaning: "秋のように美しい" },
  { kanji: "冬美", reading: "ふゆみ", meaning: "冬のように美しい" },
  { kanji: "春花", reading: "はるか", meaning: "春の花" },
  { kanji: "夏花", reading: "なつか", meaning: "夏の花" },
  { kanji: "秋花", reading: "あきか", meaning: "秋の花" },
  { kanji: "冬花", reading: "ふゆか", meaning: "冬の花" },

  // 数字の名前追加
  { kanji: "一美", reading: "いちみ", meaning: "第一の美しさ" },
  { kanji: "二美", reading: "じみ", meaning: "第二の美しさ" },
  { kanji: "三美", reading: "ぞうみ", meaning: "第三の美しさ" },
  { kanji: "四美", reading: "しみ", meaning: "第四の美しさ" },
  { kanji: "五美", reading: "ごみ", meaning: "第五の美しさ" },
  { kanji: "六美", reading: "ろくみ", meaning: "第六の美しさ" },
  { kanji: "七美", reading: "しちみ", meaning: "第七の美しさ" },
  { kanji: "八美", reading: "はちみ", meaning: "第八の美しさ" },
  { kanji: "九美", reading: "くみ", meaning: "第九の美しさ" },
  { kanji: "十美", reading: "じゅうみ", meaning: "第十の美しさ" },
]

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

  return uniqueCandidates.slice(0, maxResults)
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
