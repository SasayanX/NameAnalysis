// 陰陽五行の要素タイプ
export type FiveElement = "木" | "火" | "土" | "金" | "水"
export type YinYang = "陰" | "陽"

// 五行の相生相剋関係
export const fiveElementRelations = {
  // 相生関係（A生B）
  generates: {
    木: "火", // 木は火を生む
    火: "土", // 火は土を生む
    土: "金", // 土は金を生む
    金: "水", // 金は水を生む
    水: "木", // 水は木を生む
  },
  // 相剋関係（A剋B）
  controls: {
    木: "土", // 木は土を剋す
    土: "水", // 土は水を剋す
    水: "火", // 水は火を剋す
    火: "金", // 火は金を剋す
    金: "木", // 金は木を剋す
  },
}

// 五行の健康関連データ
export const fiveElementHealth: Record<
  FiveElement,
  {
    organs: string[]
    symptoms: string[]
    recommendations: string[]
    foods: string[]
    colors: string[]
  }
> = {
  木: {
    organs: ["肝臓", "胆嚢", "目", "筋肉"],
    symptoms: ["頭痛", "目の疲れ", "筋肉の緊張", "イライラ"],
    recommendations: ["ストレッチ", "森林浴", "深呼吸", "緑茶"],
    foods: ["緑の野菜", "酸味のある食べ物", "玄米", "ハーブティー"],
    colors: ["緑", "青緑"],
  },
  火: {
    organs: ["心臓", "小腸", "舌", "血管"],
    symptoms: ["動悸", "不眠", "精神的興奮", "顔の紅潮"],
    recommendations: ["適度な運動", "瞑想", "早寝早起き", "笑うこと"],
    foods: ["苦味のある食べ物", "赤い果物", "玄米", "ハーブティー"],
    colors: ["赤", "ピンク", "オレンジ"],
  },
  土: {
    organs: ["脾臓", "胃", "口", "筋肉"],
    symptoms: ["消化不良", "食欲不振", "疲労感", "心配しすぎ"],
    recommendations: ["規則正しい食事", "軽い運動", "十分な休息", "瞑想"],
    foods: ["甘味のある食べ物", "黄色の野菜と果物", "雑穀", "ハーブティー"],
    colors: ["黄色", "オレンジ", "茶色"],
  },
  金: {
    organs: ["肺", "大腸", "鼻", "皮膚"],
    symptoms: ["呼吸器の問題", "便秘", "皮膚の乾燥", "悲しみ"],
    recommendations: ["深呼吸", "有酸素運動", "規則正しい生活", "瞑想"],
    foods: ["辛味のある食べ物", "白い食べ物", "根菜類", "ハーブティー"],
    colors: ["白", "シルバー", "ゴールド"],
  },
  水: {
    organs: ["腎臓", "膀胱", "耳", "骨"],
    symptoms: ["腰痛", "耳鳴り", "疲労感", "恐怖感"],
    recommendations: ["十分な水分摂取", "適度な休息", "温かい食事", "瞑想"],
    foods: ["塩味のある食べ物", "黒い食べ物", "豆類", "ハーブティー"],
    colors: ["黒", "青", "紺"],
  },
}

// 名前から五行の要素を計算する関数
export function calculateNameElements(
  lastName: string,
  firstName: string,
): {
  woodCount: number
  fireCount: number
  earthCount: number
  metalCount: number
  waterCount: number
  dominantElement: FiveElement
  weakElement: FiveElement
} {
  // 漢字と五行の対応表（簡易版）
  const characterToElement: Record<string, FiveElement> = {
    // 木の性質を持つ漢字
    木: "木",
    林: "木",
    森: "木",
    竹: "木",
    松: "木",
    柳: "木",
    杉: "木",
    桜: "木",
    梅: "木",
    植: "木",
    葉: "木",
    菜: "木",
    草: "木",
    花: "木",
    芽: "木",
    // 火の性質を持つ漢字
    火: "火",
    灯: "火",
    炎: "火",
    焔: "火",
    燃: "火",
    照: "火",
    明: "火",
    陽: "火",
    日: "火",
    夏: "火",
    赤: "火",
    丹: "火",
    朱: "火",
    暖: "火",
    熱: "火",
    // 土の性質を持つ漢字
    土: "土",
    地: "土",
    岩: "土",
    山: "土",
    岡: "土",
    野: "土",
    原: "土",
    田: "土",
    畑: "土",
    石: "土",
    砂: "土",
    塚: "土",
    城: "土",
    壁: "土",
    // 金の性質を持つ漢字
    金: "金",
    銀: "金",
    鉄: "金",
    銅: "金",
    鈴: "金",
    鐘: "金",
    針: "金",
    剣: "金",
    刀: "金",
    鋼: "金",
    鎌: "金",
    鏡: "金",
    鉱: "金",
    // 水の性質を持つ漢字
    水: "水",
    川: "水",
    河: "水",
    海: "水",
    湖: "水",
    池: "水",
    泉: "水",
    滝: "水",
    雨: "水",
    波: "水",
    流: "水",
    湯: "水",
    潮: "水",
    沢: "水",
    清: "水",
  }

  // 各要素のカウントを初期化
  let woodCount = 0
  let fireCount = 0
  let earthCount = 0
  let metalCount = 0
  let waterCount = 0

  // 姓名の各文字について五行要素をカウント
  const fullName = lastName + firstName
  for (const char of fullName) {
    const element = characterToElement[char]
    if (element) {
      switch (element) {
        case "木":
          woodCount++
          break
        case "火":
          fireCount++
          break
        case "土":
          earthCount++
          break
        case "金":
          metalCount++
          break
        case "水":
          waterCount++
          break
      }
    } else {
      // 未登録の文字は画数から推定（簡易的な方法）
      const stroke = getCharStroke(char)
      if (stroke % 5 === 0) earthCount++
      else if (stroke % 5 === 1) woodCount++
      else if (stroke % 5 === 2) fireCount++
      else if (stroke % 5 === 3) metalCount++
      else if (stroke % 5 === 4) waterCount++
    }
  }

  // 最も多い要素と最も少ない要素を特定
  const counts = [
    { element: "木" as FiveElement, count: woodCount },
    { element: "火" as FiveElement, count: fireCount },
    { element: "土" as FiveElement, count: earthCount },
    { element: "金" as FiveElement, count: metalCount },
    { element: "水" as FiveElement, count: waterCount },
  ]

  counts.sort((a, b) => b.count - a.count)

  const dominantElement = counts[0].element
  const weakElement = counts[counts.length - 1].element

  // デバッグ情報を出力
  console.log("Five Elements Calculation:")
  console.log(`Name: ${lastName} ${firstName}`)
  console.log(
    `Wood: ${woodCount}, Fire: ${fireCount}, Earth: ${earthCount}, Metal: ${metalCount}, Water: ${waterCount}`,
  )
  console.log(`Dominant: ${dominantElement}, Weak: ${weakElement}`)

  return {
    woodCount,
    fireCount,
    earthCount,
    metalCount,
    waterCount,
    dominantElement,
    weakElement,
  }
}

// 日付から陰陽五行の日運を計算する関数
export function calculateDailyFiveElements(date: Date = new Date()): {
  dayElement: FiveElement
  dayYinYang: YinYang
  healthAdvice: string
  luckyColors: string[]
  recommendedFoods: string[]
} {
  // 日付から五行の要素を計算（簡易版）
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const elements: FiveElement[] = ["木", "火", "土", "金", "水"]
  const dayElement = elements[dayOfYear % 5]

  // 陰陽の計算（簡易版）
  const dayYinYang: YinYang = dayOfYear % 2 === 0 ? "陽" : "陰"

  // 健康アドバイスを生成
  const elementData = fiveElementHealth[dayElement]
  const healthIndex = dayOfYear % elementData.recommendations.length

  const healthAdvice = `今日は${dayElement}の気が${dayYinYang}で巡ります。${elementData.organs.join("・")}に気を配りましょう。${elementData.recommendations[healthIndex]}がおすすめです。`

  return {
    dayElement,
    dayYinYang,
    healthAdvice,
    luckyColors: elementData.colors,
    recommendedFoods: elementData.foods,
  }
}

// generateHealthAdvice関数を修正して、プランに応じた表示を制御します

// 関数のシグネチャを変更して、isPremiumとisProパラメータを追加
export function generateHealthAdvice(
  nameElements: ReturnType<typeof calculateNameElements>,
  birthdate: Date,
  isPremium = false,
  isPro = false,
): {
  generalAdvice: string
  weeklyHealthForecast: string[]
  balanceAdvice: string
} {
  const { dominantElement, weakElement } = nameElements

  // 支配的な要素に基づくアドバイス
  const dominantData = fiveElementHealth[dominantElement]
  const weakData = fiveElementHealth[weakElement]

  // 一般的なアドバイス
  const generalAdvice = `あなたは${dominantElement}の気が強く、${dominantData.organs.join("・")}の機能が活発です。一方で${weakElement}の気が弱く、${weakData.organs.join("・")}をケアする必要があります。`

  // バランスを整えるアドバイス - プロプランでは表示しない、プレミアムプランでのみ表示
  let balanceAdvice = ""
  if (isPremium) {
    const balanceElement = fiveElementRelations.generates[weakElement]
    const balanceData = fiveElementHealth[balanceElement as FiveElement]
    balanceAdvice = `バランスを整えるには、${balanceElement}の気を高める${balanceData.recommendations.join("・")}を取り入れ、${balanceData.foods.join("・")}を食べると良いでしょう。`
  } else if (isPro) {
    // プロプランでは「〇の気を高める」アドバイスを表示しない
    balanceAdvice = "バランスを整えるためのアドバイスはプレミアムプランでご利用いただけます。"
  } else {
    // 通常プランでは一般的なアドバイスを表示
    balanceAdvice = "バランスを整えるためのアドバイスは会員登録後にご利用いただけます。"
  }

  // 週間健康予測
  const today = new Date()
  const weeklyHealthForecast = []

  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)

    const dayOfYear = Math.floor(
      (forecastDate.getTime() - new Date(forecastDate.getFullYear(), 0, 0).getTime()) / 86400000,
    )
    const dayElement = elements[dayOfYear % 5]

    let healthRisk = ""

    // プロプランでは「〇の気を高める」アドバイスを表示しない
    if (isPro && !isPremium) {
      healthRisk = "健康リスクの詳細はプレミアムプランでご確認いただけます。"
    } else if (isPremium) {
      if (fiveElementRelations.controls[dayElement as FiveElement] === dominantElement) {
        healthRisk = `${dominantData.organs[dayOfYear % dominantData.organs.length]}に負担がかかりやすい日です。`
      } else if (fiveElementRelations.controls[dominantElement] === dayElement) {
        healthRisk = `${fiveElementHealth[dayElement as FiveElement].organs[0]}の調子が良くなる日です。`
      } else {
        healthRisk = "特に注意すべき健康リスクはありません。"
      }
    } else {
      healthRisk = "健康リスクの詳細は会員登録後にご確認いただけます。"
    }

    const dayName = ["日", "月", "火", "水", "木", "金", "土"][forecastDate.getDay()]
    weeklyHealthForecast.push(`${i + 1}日後(${dayName}): ${healthRisk}`)
  }

  return {
    generalAdvice,
    weeklyHealthForecast,
    balanceAdvice,
  }
}

// 五行の要素の配列（関数内で使用）
const elements: FiveElement[] = ["木", "火", "土", "金", "水"]

// getCharStroke関数のインポート（既存の関数を使用）
import { getCharStroke } from "./name-data-simple"
