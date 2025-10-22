import { analyzeNameFortune } from "./name-data-simple"
import { calculateNameElements } from "./five-elements"
import { getYinYangArray } from "@/components/vertical-name-display"
import { analyzeSansaiConfiguration } from "./gogyo-sansai"
import { getInyoDetailedAnalysis } from "./inyo-analysis"

// 名前の格付けポイントを計算する関数
export function calculateNameRankingPoints(
  lastName: string,
  firstName: string,
  customFortuneData: Record<string, any>,
  gender: "male" | "female" = "male",
): {
  totalPoints: number
  powerRank: string
  powerLevel: number
  details: {
    category: string
    points: number
    description: string
  }[]
} {
  // 基本の姓名判断結果を取得（customFortuneDataを渡す）
  // 修正前
  // const basicResult = analyzeNameFortune(lastName, firstName, customFortuneData, gender)

  // 修正後
  const basicResult = analyzeNameFortune(lastName, firstName, gender, customFortuneData)

  // エラーハンドリング: basicResultが無効な場合のデフォルト値を設定
  if (!basicResult || !basicResult.categories || !Array.isArray(basicResult.categories)) {
    console.error("Basic result is invalid:", basicResult)
    return {
      totalPoints: 0,
      powerRank: "D",
      powerLevel: 1,
      details: [
        {
          category: "エラー",
          points: 0,
          description: "名前の分析でエラーが発生しました。データを確認してください。",
        },
      ],
    }
  }

  // 五行要素を計算
  const elements = calculateNameElements(lastName, firstName)

  // 陰陽配列を取得・分析
  const yinYangArray = getYinYangArray(lastName, firstName)
  const detailedInyoAnalysis = getInyoDetailedAnalysis(lastName, firstName, yinYangArray)

  // 五行三才の分析
  const tenCategory = basicResult.categories?.find((c: any) => c.name === "天格")
  const jinCategory = basicResult.categories?.find((c: any) => c.name === "人格")
  const chiCategory = basicResult.categories?.find((c: any) => c.name === "地格")

  const tenStrokes = tenCategory?.score || 0
  const jinStrokes = jinCategory?.score || 0
  const chiStrokes = chiCategory?.score || 0

  // 実際の画数を取得（strokeCountプロパティから）
  const tenStrokesActual = tenCategory?.strokeCount || 0
  const jinStrokesActual = jinCategory?.strokeCount || 0
  const chiStrokesActual = chiCategory?.strokeCount || 0

  const sansaiAnalysis = analyzeSansaiConfiguration(tenStrokesActual, jinStrokesActual, chiStrokesActual)

  // 各カテゴリのポイントを計算
  const fortunePoints = {
    category: "運勢パワー",
    points: calculateFortunePoints(basicResult, gender),
    description: "姓名判断における運勢の強さを数値化したポイントです",
  }

  const strokePoints = {
    category: "画数パワー",
    points: calculateStrokePoints(basicResult),
    description: "名前の画数と各格の吉凶から算出されるパワーポイントです",
  }

  const elementPoints = {
    category: "五行パワー",
    points: calculateElementPoints(elements),
    description: "名前に含まれる五行要素のバランスと強さを数値化したポイントです",
  }

  const balancePoints = {
    category: "バランスパワー",
    points: calculateBalancePoints(basicResult),
    description: "天格・人格・地格のバランスから算出される調和のポイントです",
  }

  // 新しい陰陽パワー（詳細分析版）
  const yinYangPoints = {
    category: "陰陽パワー",
    points: detailedInyoAnalysis.analysis.score,
    description: `陰陽配列: ${detailedInyoAnalysis.analysis.pattern} - ${detailedInyoAnalysis.analysis.description}`,
  }

  // 新しい五行三才パワー
  const sansaiPoints = {
    category: "三才パワー",
    points: sansaiAnalysis.score,
    description: `五行三才: ${sansaiAnalysis.tenGogyo}→${sansaiAnalysis.jinGogyo}→${sansaiAnalysis.chiGogyo} - ${sansaiAnalysis.description}`,
  }

  const rarityPoints = {
    category: "レア度パワー",
    points: calculateRarityPoints(lastName, firstName),
    description: "名前の珍しさや特殊性から算出されるユニークポイントです",
  }

  // 総合ポイントを計算（三才パワーを追加）
  const totalPoints =
    fortunePoints.points +
    strokePoints.points +
    elementPoints.points +
    balancePoints.points +
    yinYangPoints.points +
    sansaiPoints.points +
    rarityPoints.points

  // パワーランクを決定（上限を調整）
  const powerRank = determinePowerRank(totalPoints)
  const powerLevel = determinePowerLevel(totalPoints)

  return {
    totalPoints,
    powerRank,
    powerLevel,
    details: [fortunePoints, strokePoints, elementPoints, balancePoints, yinYangPoints, sansaiPoints, rarityPoints],
  }
}

// 運勢パワーを計算する関数 - 総合運勢スコアをそのまま返す
export function calculateFortunePoints(result: any, gender = "male"): number {
  console.log("=== 運勢パワー計算詳細デバッグ ===")
  console.log("入力データ全体:", JSON.stringify(result, null, 2))
  console.log("result.totalScore:", result.totalScore)
  console.log("typeof result.totalScore:", typeof result.totalScore)
  console.log("性別:", gender)

  if (!result) {
    console.error("結果データがnullまたはundefinedです")
    return 0
  }

  if (typeof result.totalScore !== "number") {
    console.error("totalScoreが数値ではありません:", result.totalScore)
    return 0
  }

  // 詳細鑑定の総合運勢スコアをそのまま運勢パワーとして使用
  const fortunePoints = result.totalScore

  console.log("詳細鑑定の総合運勢スコア:", result.totalScore, "点")
  console.log("運勢パワー（そのまま代入）:", fortunePoints, "点")

  return fortunePoints
}

// 画数ポイントを計算する関数を大幅に修正
function calculateStrokePoints(result: any) {
  console.log("=== 画数パワー計算詳細 ===")
  console.log("入力データ:", result)

  let points = 30 // 基本点を50から30に下げる
  console.log("基本点:", points)

  // 各格の吉凶に基づくポイント配分を厳しく調整
  const fortunePoints = {
    大吉: 8,
    中吉: 5,
    吉: 3,
    凶: -15, // -4から-15に大幅強化
    中凶: -20, // -6から-20に大幅強化
    大凶: -25, // -8から-25に大幅強化
  }

  // 各格の吉凶を評価してポイントを加算
  let totalFortunePoints = 0
  result.categories.forEach((category: any) => {
    console.log(`${category.name}: ${category.fortune}`)
    // 各格の運勢を判定
    for (const [fortune, pointValue] of Object.entries(fortunePoints)) {
      if (category.fortune.includes(fortune)) {
        totalFortunePoints += pointValue as number
        console.log(category.name + "で" + fortune + ": " + (pointValue > 0 ? "+" : "") + pointValue + "ポイント")
        break
      }
    }
  })

  // 5格の吉凶ポイントを基本点に加算（スケーリングを調整）
  points += totalFortunePoints * 3 // 5から3に調整

  // 低スコア格がある場合の追加減点を画数パワーにも適用（大幅強化）
  const lowScoreCategories = result.categories.filter((category: any) => {
    const fortuneText = category?.fortune || category?.description || ""
    return fortuneText.includes("凶")
  })

  if (lowScoreCategories.length > 0) {
    const lowScorePenalty = lowScoreCategories.length * 20 // 8から20に大幅強化
    points -= lowScorePenalty
    console.log(
      "画数パワー: 低スコア格" + lowScoreCategories.length + "個による追加減点: -" + lowScorePenalty + "ポイント",
    )
  }

  // 特定の強い画数にボーナスポイント（ボーナスを抑制）
  const powerfulStrokes = [1, 3, 5, 8, 11, 16, 21, 23, 24, 31, 33, 36, 37, 41, 45, 47, 52]

  // 総格の画数を取得（totalFormatプロパティまたは総格カテゴリから）
  let totalStroke = 0
  if (result.totalFormat) {
    totalStroke = result.totalFormat
  } else {
    const totalCategory = result.categories.find((c: any) => c.name === "総格")
    if (totalCategory && totalCategory.strokeCount) {
      totalStroke = totalCategory.strokeCount
    }
  }

  if (totalStroke > 0) {
    // 強い画数の場合はボーナス（ただし凶数がある場合は半減）
    if (powerfulStrokes.includes(totalStroke)) {
      const bonus = lowScoreCategories.length > 0 ? 3 : 6 // 10から6/3に削減
      points += bonus
      console.log("強い画数ボーナス: +" + bonus + "ポイント")
    }

    // 画数が多いほど若干ボーナス（最大5点に削減）
    const lengthBonus = Math.min(5, Math.floor(totalStroke / 10)) // /6から/10に調整、上限も5に削減
    points += lengthBonus
    console.log("画数長さボーナス: +" + lengthBonus + "ポイント")
  }

  console.log("画数パワー最終計算: " + points + "ポイント")

  return Math.max(0, Math.min(100, points))
}

// 五行要素ポイントを計算
function calculateElementPoints(elements: any) {
  let points = 50 // 基本点

  // 優勢な要素が「火」または「木」の場合はボーナス
  if (elements.dominantElement === "火" || elements.dominantElement === "木") {
    points += 15
  }

  // 要素のバランスを評価
  const totalElements =
    elements.woodCount + elements.fireCount + elements.earthCount + elements.metalCount + elements.waterCount

  // 最も多い要素の割合が高すぎる場合は減点
  const maxElementCount = Math.max(
    elements.woodCount,
    elements.fireCount,
    elements.earthCount,
    elements.metalCount,
    elements.waterCount,
  )
  const maxElementRatio = maxElementCount / totalElements

  if (maxElementRatio > 0.5) {
    points -= Math.floor((maxElementRatio - 0.5) * 100)
  }

  // 要素の総数が多いほどボーナス（上限を35に増加）
  points += Math.min(35, totalElements * 2)

  // 完璧なバランス（各要素が均等）の場合は特別ボーナス
  const elementCounts = [
    elements.woodCount,
    elements.fireCount,
    elements.earthCount,
    elements.metalCount,
    elements.waterCount,
  ]
  const nonZeroCounts = elementCounts.filter((count) => count > 0)

  if (nonZeroCounts.length >= 4) {
    // 4つ以上の要素がある場合
    const variance = calculateVariance(nonZeroCounts)
    if (variance <= 1) {
      // 分散が小さい（バランスが良い）場合
      points += 15 // 完璧バランスボーナス
    }
  }

  return Math.max(0, Math.min(100, points))
}

// 分散を計算するヘルパー関数を追加
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2))
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
}

// バランスポイントを計算
function calculateBalancePoints(result: any) {
  let points = 50 // 基本点

  // 天格、人格、地格のバランスを評価
  const tenCategory = result.categories.find((c: any) => c.name === "天格")
  const jinCategory = result.categories.find((c: any) => c.name === "人格")
  const chiCategory = result.categories.find((c: any) => c.name === "地格")

  if (tenCategory && jinCategory && chiCategory) {
    // スコアの差が小さいほどバランスが良い
    const maxScore = Math.max(tenCategory.score, jinCategory.score, chiCategory.score)
    const minScore = Math.min(tenCategory.score, jinCategory.score, chiCategory.score)
    const scoreDiff = maxScore - minScore

    // 差が小さいほどボーナス
    points += Math.max(0, 30 - scoreDiff / 2)

    // 全体的にスコアが高い場合もボーナス
    const avgScore = (tenCategory.score + jinCategory.score + chiCategory.score) / 3
    points += Math.min(20, avgScore / 5)
  }

  return Math.max(0, Math.min(100, points))
}

// レア度ポイントを計算する関数
function calculateRarityPoints(lastName: string, firstName: string) {
  let points = 50 // 基本点

  // 名前の長さによるボーナス（珍しい長さほど高得点）
  const fullNameLength = lastName.length + firstName.length

  if (fullNameLength <= 2) {
    points += 25 // 非常に短い名前
  } else if (fullNameLength >= 6) {
    points += 15 // 長い名前
  }

  // 特別な漢字（龍・竜・虎）が含まれているかチェック
  const specialKanji = ["龍", "竜", "虎"]
  let hasSpecialKanji = false

  for (const char of lastName + firstName) {
    if (specialKanji.includes(char)) {
      hasSpecialKanji = true
      break
    }
  }

  // 特別な漢字が含まれている場合は+25点
  if (hasSpecialKanji) {
    points += 25
  }

  // 珍しい漢字が含まれているかチェック
  const rareKanji = ["璃", "瑠", "凛", "煌", "翔", "颯", "蓮", "陽", "碧", "蒼", "葵", "澪", "遥", "凪", "詩", "奏"]
  let rareKanjiCount = 0

  for (const char of lastName + firstName) {
    if (rareKanji.includes(char) && !specialKanji.includes(char)) {
      rareKanjiCount++
    }
  }

  // 珍しい漢字が含まれているとボーナス
  points += rareKanjiCount * 10

  // デバッグ出力を追加
  console.log("Rarity points calculation:")
  console.log("- Base points: 50")
  console.log(
    "- Name length (" + fullNameLength + "): " + (fullNameLength <= 2 ? "+25" : fullNameLength >= 6 ? "+15" : "+0"),
  )
  console.log("- Special kanji (龍/竜/虎): " + (hasSpecialKanji ? "+25" : "+0"))
  console.log("- Rare kanji count (" + rareKanjiCount + "): +" + rareKanjiCount * 10)
  console.log("- Total rarity points: " + points)

  return Math.max(0, Math.min(100, points))
}

// パワーランクを決定する関数（三才パワー追加により上限を調整）
function determinePowerRank(totalPoints: number): string {
  if (totalPoints >= 600) return "SSS" // 上限を100ポイント上げる
  if (totalPoints >= 550) return "SS"
  if (totalPoints >= 500) return "S"
  if (totalPoints >= 450) return "A+"
  if (totalPoints >= 400) return "A"
  if (totalPoints >= 350) return "B+"
  if (totalPoints >= 300) return "B"
  if (totalPoints >= 250) return "C"
  return "D"
}

// パワーレベルを決定する関数（1〜10のスケール）
function determinePowerLevel(totalPoints: number): number {
  if (totalPoints >= 600) return 10 // 天下無双
  if (totalPoints >= 550) return 9 // 無敵
  if (totalPoints >= 500) return 8 // 最強
  if (totalPoints >= 450) return 7 // 一流
  if (totalPoints >= 400) return 6 // 優秀
  if (totalPoints >= 350) return 5 // 良好
  if (totalPoints >= 300) return 4 // 普通
  if (totalPoints >= 250) return 3 // 平凡
  if (totalPoints >= 200) return 2 // 苦労
  return 1 // 困難
}

// 星レベルに対応する運勢説明を取得する関数を追加
export function getStarLevelDescription(starLevel: number): { title: string; description: string } {
  switch (starLevel) {
    case 10:
      return {
        title: "天下無双",
        description: "最高の運勢。歴史に名を残すような偉業を成し遂げる可能性があり、後世に語り継がれる存在となります。",
      }
    case 9:
      return {
        title: "無敵",
        description: "極めて強い運勢。困難を乗り越え、大きな成功を収める力があり、多くの人に影響を与えます。",
      }
    case 8:
      return {
        title: "最強",
        description: "非常に強い運勢。多くの分野で卓越した才能を発揮し、時代を牽引する存在となれます。",
      }
    case 7:
      return {
        title: "一流",
        description: "卓越した運勢。社会的成功を収める可能性が高く、専門分野で頭角を現すでしょう。",
      }
    case 6:
      return {
        title: "優秀",
        description: "優れた運勢。才能と運に恵まれ、周囲からの信頼も厚く、リーダーシップを発揮できます。",
      }
    case 5:
      return {
        title: "良好",
        description: "良い運勢。多くの場面で幸運に恵まれ、順調な人生を歩める可能性が高いです。",
      }
    case 4:
      return {
        title: "普通",
        description: "平均以上の運勢。安定した人生を送れる可能性があります。堅実な歩みで着実に成果を上げられます。",
      }
    case 3:
      return {
        title: "平凡",
        description: "一般的な運勢。努力次第で運気を高められます。地道な積み重ねが成功への鍵となります。",
      }
    case 2:
      return {
        title: "苦労",
        description: "苦労の多い運勢。努力と忍耐が必要ですが、その経験が将来の糧となり、人格を磨く機会となります。",
      }
    case 1:
      return {
        title: "困難",
        description: "厳しい運勢。多くの試練が待ち受けていますが、それを乗り越えることで真の強さを身につけられます。",
      }
    default:
      return {
        title: "平凡",
        description: "一般的な運勢。努力次第で運気を高められます。",
      }
  }
}
