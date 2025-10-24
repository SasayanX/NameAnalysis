// 六星占術の計算アルゴリズム
export type SixStar = "水星" | "金星" | "木星" | "火星" | "土星" | "天王星"
export type SixStarType = "+" | "-"

// 六星占術の星の特性データ
export const sixStarData: Record<
  SixStar,
  {
    element: string
    personality: string
    strength: string
    weakness: string
    healthRisk: string
    luckyColor: string
  }
> = {
  水星: {
    element: "水",
    personality: "知性的で冷静、適応力が高い",
    strength: "柔軟性と知性",
    weakness: "優柔不断になりがち",
    healthRisk: "腎臓、膀胱系の不調",
    luckyColor: "青、黒",
  },
  金星: {
    element: "金",
    personality: "社交的で調和を好む、芸術的センスがある",
    strength: "人間関係の構築力",
    weakness: "依存的になることがある",
    healthRisk: "肺、大腸系の不調",
    luckyColor: "白、金",
  },
  木星: {
    element: "木",
    personality: "成長志向で寛大、理想主義的",
    strength: "成長力と包容力",
    weakness: "現実視点の欠如",
    healthRisk: "肝臓、胆嚢系の不調",
    luckyColor: "緑、青緑",
  },
  火星: {
    element: "火",
    personality: "情熱的で行動力がある、リーダーシップがある",
    strength: "行動力と決断力",
    weakness: "短気になりやすい",
    healthRisk: "心臓、循環器系の不調",
    luckyColor: "赤、オレンジ",
  },
  土星: {
    element: "土",
    personality: "堅実で責任感が強い、忍耐強い",
    strength: "忍耐力と実行力",
    weakness: "柔軟性に欠けることがある",
    healthRisk: "消化器系、脾臓の不調",
    luckyColor: "黄、茶",
  },
  天王星: {
    element: "天",
    personality: "独創的で革新的、直感力が高い",
    strength: "創造性と独自性",
    weakness: "協調性に欠けることがある",
    healthRisk: "神経系、自律神経の不調",
    luckyColor: "紫、シルバー",
  },
}

// 生年月日から六星占術の星を計算する関数（この関数は使用しないが、型定義のために残す）
export function calculateSixStar(birthdate: Date): { star: SixStar; type: SixStarType } {
  // 実際の計算は lib/six-star.ts で行う
  return { star: "水星", type: "+" }
}

// 今日の運勢を計算する関数
export function calculateDailyFortune(sixStar: { star: SixStar; type: SixStarType }): {
  luckScore: number
  healthScore: number
  relationshipScore: number
  advice: string
} {
  // 今日の日付を基に運勢を計算
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

  // 星ごとの基本運勢値（0-100）
  const baseScores: Record<SixStar, number> = {
    水星: 70,
    金星: 75,
    木星: 80,
    火星: 65,
    土星: 60,
    天王星: 85,
  }

  // +/-による変動
  const typeModifier = sixStar.type === "+" ? 5 : -5

  // 日付による変動（-20〜+20）
  const dailyVariation = Math.sin(dayOfYear * 0.1) * 20

  // 基本スコアに日付変動と+/-変動を加える
  const baseScore = baseScores[sixStar.star] + dailyVariation + typeModifier

  // 各分野のスコアを計算（確定的なロジックを使用）
  // 日付と星の組み合わせで一貫した結果を生成
  const luckVariation = Math.sin(dayOfYear * 0.3 + (sixStar.star === "水星" ? 0 : sixStar.star === "金星" ? 1 : sixStar.star === "木星" ? 2 : sixStar.star === "火星" ? 3 : sixStar.star === "土星" ? 4 : 5)) * 8
  const healthVariation = Math.sin(dayOfYear * 0.4 + (sixStar.star === "水星" ? 1 : sixStar.star === "金星" ? 2 : sixStar.star === "木星" ? 3 : sixStar.star === "火星" ? 4 : sixStar.star === "土星" ? 5 : 0)) * 8
  const relationshipVariation = Math.sin(dayOfYear * 0.5 + (sixStar.star === "水星" ? 2 : sixStar.star === "金星" ? 3 : sixStar.star === "木星" ? 4 : sixStar.star === "火星" ? 5 : sixStar.star === "土星" ? 0 : 1)) * 8
  
  const luckScore = Math.min(100, Math.max(1, Math.round(baseScore + luckVariation)))
  const healthScore = Math.min(100, Math.max(1, Math.round(baseScore + healthVariation)))
  const relationshipScore = Math.min(100, Math.max(1, Math.round(baseScore + relationshipVariation)))

  // アドバイスを生成
  let advice = ""
  if (luckScore > 80) {
    advice = "今日はチャンスの日です。新しいことに挑戦してみましょう。"
  } else if (luckScore > 60) {
    advice = "安定した一日になりそうです。計画通りに進めましょう。"
  } else if (luckScore > 40) {
    advice = "平凡な一日です。無理せず着実に進めましょう。"
  } else {
    advice = "慎重に行動した方が良い日です。重要な決断は避けましょう。"
  }

  // 健康アドバイスを追加
  if (healthScore < 50) {
    advice += ` ${sixStarData[sixStar.star].healthRisk}に注意し、休息を十分取りましょう。`
  }

  // +/-による追加アドバイス
  if (sixStar.type === "+") {
    advice += " プラスの気が強い日なので、積極的な行動が吉です。"
  } else {
    advice += " マイナスの気が強い日なので、慎重な判断が吉です。"
  }

  return {
    luckScore,
    healthScore,
    relationshipScore,
    advice,
  }
}

// 相性を計算する関数
export function calculateCompatibility(
  star1: { star: SixStar; type: SixStarType },
  star2: { star: SixStar; type: SixStarType },
): {
  score: number
  description: string
} {
  // 星同士の相性表（簡易版）
  const compatibilityMatrix: Record<SixStar, Record<SixStar, number>> = {
    水星: { 水星: 80, 金星: 60, 木星: 90, 火星: 40, 土星: 70, 天王星: 85 },
    金星: { 水星: 60, 金星: 75, 木星: 65, 火星: 80, 土星: 50, 天王星: 70 },
    木星: { 水星: 90, 金星: 65, 木星: 70, 火星: 60, 土星: 85, 天王星: 55 },
    火星: { 水星: 40, 金星: 80, 木星: 60, 火星: 65, 土星: 45, 天王星: 75 },
    土星: { 水星: 70, 金星: 50, 木星: 85, 火星: 45, 土星: 60, 天王星: 65 },
    天王星: { 水星: 85, 金星: 70, 木星: 55, 火星: 75, 土星: 65, 天王星: 90 },
  }

  // +/-の相性
  const typeCompatibility = star1.type === star2.type ? 10 : -5

  // 相性スコアを取得
  const score = Math.min(100, Math.max(0, compatibilityMatrix[star1.star][star2.star] + typeCompatibility))

  // 相性の説明を生成
  let description = ""
  if (score >= 85) {
    description = "非常に相性が良く、互いに高め合える関係です。"
  } else if (score >= 70) {
    description = "良好な相性で、協力することで多くを達成できます。"
  } else if (score >= 55) {
    description = "普通の相性です。互いの違いを尊重することで関係が深まります。"
  } else if (score >= 40) {
    description = "やや相性に課題があります。コミュニケーションを大切にしましょう。"
  } else {
    description = "相性に注意が必要です。互いの違いを理解する努力が必要でしょう。"
  }

  // +/-の説明を追加
  if (star1.type === star2.type) {
    description += ` お互い${star1.type}タイプなので、考え方や行動パターンが似ています。`
  } else {
    description += " +タイプと-タイプの組み合わせなので、互いに補完し合える関係です。"
  }

  return { score, description }
}
