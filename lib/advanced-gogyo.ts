import { getCharStroke } from "./name-data-simple"
import {
  type NineStar,
  type FiveElement,
  yearToNineStar,
  yearToTenunStars,
  monthDayStars,
  getDateRangeIndex,
  strokeToElement,
} from "./gogyo-tables"

// 陰陽五行の算出結果の型定義
export interface GogyoResult {
  // 五行要素のカウント
  elements: {
    wood: number // 木
    fire: number // 火
    earth: number // 土
    metal: number // 金
    water: number // 水
  }
  // 優勢な要素と弱い要素
  dominantElement: "木" | "火" | "土" | "金" | "水"
  // 陰陽
  yinYang: "陰" | "陽"
  // 外運、内運、一生運
  externalLuck: number
  internalLuck: number
  lifeLuck: number
  // 生年月日から導き出された星
  birthStars: FiveElement[]
  // 名前から導き出された星
  nameStars: FiveElement[]
  // 九星情報
  nineStar?: NineStar
  // デバッグ情報
  debug?: {
    nameChars: Array<{ char: string; strokes: number; element: FiveElement }>
    dateRangeIndex?: number
    monthDayStarsUsed?: [FiveElement, FiveElement]
    tenunStarsUsed?: [FiveElement, FiveElement]
  }
}

// 陰陽五行を算出する関数
export function calculateGogyo(lastName: string, firstName: string, birthdate?: Date): GogyoResult {
  // 初期値を設定
  const elements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  }

  let birthStars: FiveElement[] = []
  let nineStar: NineStar | undefined
  let dateRangeIndexDebug: number | undefined
  let monthDayStarsUsed: [FiveElement, FiveElement] | undefined
  let tenunStarsUsed: [FiveElement, FiveElement] | undefined

  // 生年月日がある場合は生年月日から星を導出
  if (birthdate) {
    const { stars, star, dateRangeIndex, monthDayStarsForNineStar, tenunStars } = calculateBirthElements(birthdate)
    birthStars = stars
    nineStar = star
    dateRangeIndexDebug = dateRangeIndex
    monthDayStarsUsed = monthDayStarsForNineStar
    tenunStarsUsed = tenunStars

    console.log("=== calculateGogyo 生年月日要素デバッグ ===")
    console.log("生年月日:", birthdate)
    console.log("生年月日から導出した星（4つ）:", birthStars)
    console.log("生年月日から導出した星の数:", birthStars.length)

    // 生年月日から導出した星を五行要素にカウント（生年月日からの五行 = 4個）
    for (const star of birthStars) {
      console.log(`生年月日の星をカウント: ${star}`)
      countElementFromStar(star, elements)
    }
    
    console.log("生年月日要素カウント後:", elements)
    console.log("生年月日要素カウント後（詳細）:", {
      木: elements.wood,
      火: elements.fire,
      土: elements.earth,
      金: elements.metal,
      水: elements.water,
    })
  }

  // 名前から星を導出
  const { nameStars, nameCharsDebug } = calculateNameElements(lastName, firstName)

  console.log("=== calculateGogyo 名前要素デバッグ ===")
  console.log("名前から導出した星（5格）:", nameStars)
  console.log("名前の各文字の五行（デバッグ用）:", nameCharsDebug)

  // 5つの格から導出した星を五行要素にカウント（天格、人格、地格、外格、総格）
  // 姓名判断からの五行 = 5個（5つの格のみ）
  for (const star of nameStars) {
    countElementFromStar(star, elements)
  }
  
  console.log("名前要素カウント後（5格のみ）:", elements)
  console.log("詳細内訳:", {
    木: elements.wood,
    火: elements.fire,
    土: elements.earth,
    金: elements.metal,
    水: elements.water,
  })

  // 最終的な合計を確認
  const finalTotal = elements.wood + elements.fire + elements.earth + elements.metal + elements.water
  console.log("=== 最終的な五行カウント ===")
  console.log("生年月日要素数:", birthStars.length)
  console.log("名前要素数:", nameStars.length)
  console.log("合計要素数（期待値9）:", birthStars.length + nameStars.length)
  console.log("実際のカウント合計:", finalTotal)
  console.log("最終内訳:", {
    木: elements.wood,
    火: elements.fire,
    土: elements.earth,
    金: elements.metal,
    水: elements.water,
    合計: finalTotal,
  })

  // 優勢な要素と弱い要素を特定
  const elementArray = [
    { element: "木" as const, count: elements.wood },
    { element: "火" as const, count: elements.fire },
    { element: "土" as const, count: elements.earth },
    { element: "金" as const, count: elements.metal },
    { element: "水" as const, count: elements.water },
  ]

  elementArray.sort((a, b) => b.count - a.count)
  const dominantElement = elementArray[0].element
  const weakElement = elementArray[elementArray.length - 1].element

  // 陰陽を判定
  const yinYang = birthdate ? determineYinYang(birthdate) : "陽"

  // 外運、内運、一生運を計算
  const strokes = {
    lastName: calculateStrokeCount(lastName),
    firstName: calculateStrokeCount(firstName),
  }

  const socialLuck = calculateSocialLuck(strokes.lastName, strokes.firstName)
  const externalLuck = strokes.lastName + socialLuck // 外運 = 姓の上の文字 + 社会運
  const internalLuck = socialLuck + strokes.firstName // 内運 = 社会運 + 名前の下の文字
  const lifeLuck = strokes.lastName + strokes.firstName + socialLuck // 一生・晩年運

  console.log("=== calculateGogyo 最終結果 ===")
  console.log("最終要素:", elements)
  console.log("生年月日要素:", birthStars)
  console.log("名前要素:", nameStars)
  console.log("優勢要素:", dominantElement)
  console.log("弱い要素:", weakElement)

  return {
    elements,
    dominantElement,
    weakElement,
    yinYang,
    externalLuck,
    internalLuck,
    lifeLuck,
    birthStars,
    nameStars,
    nineStar,
    debug: {
      nameChars: nameCharsDebug,
      dateRangeIndex: dateRangeIndexDebug,
      monthDayStarsUsed,
      tenunStarsUsed,
    },
  }
}

// 生年月日から五行要素を導出する関数
function calculateBirthElements(birthdate: Date): {
  stars: FiveElement[]
  star: NineStar
  dateRangeIndex: number
  monthDayStarsForNineStar: [FiveElement, FiveElement]
  tenunStars: [FiveElement, FiveElement]
} {
  const year = birthdate.getFullYear()
  const month = birthdate.getMonth() + 1
  const day = birthdate.getDate()

  // 節分（2月3日）以前は前年の運勢を適用
  let adjustedYear = year
  if (month === 1 || (month === 2 && day <= 3)) {
    adjustedYear = year - 1
  }

  // 年から九星を取得
  const nineStar = yearToNineStar[adjustedYear] || "五黄土星" // デフォルト値

  console.log("=== calculateBirthElements デバッグ ===")
  console.log(`生年月日: ${year}年${month}月${day}日`)
  console.log(`調整後年: ${adjustedYear}`)
  console.log(`九星: ${nineStar}`)

  // 天運から星を導出（年から直接取得）
  const tenunStars = yearToTenunStars[adjustedYear] || ["土星", "土星"] // デフォルト値
  console.log(`天運早見表から取得: ${tenunStars[0]}, ${tenunStars[1]}`)

  // 月日から星を導出
  const dateRangeIndex = getDateRangeIndex(month, day)
  console.log(`日付範囲インデックス: ${dateRangeIndex} (${month}月${day}日)`)

  // 月日早見表から星を取得
  const monthDayStarsForNineStar = monthDayStars[dateRangeIndex]?.[nineStar] || ["水星", "木星"] // デフォルト値
  console.log(`月日早見表から取得 (${nineStar}): ${monthDayStarsForNineStar[0]}, ${monthDayStarsForNineStar[1]}`)

  // 4つの星を配列にまとめる（天運早見表から2つ + 月日早見表から2つ）
  const stars: FiveElement[] = [...tenunStars, ...monthDayStarsForNineStar]
  console.log(`最終的な生年月日要素 (4つ): ${stars.join(", ")}`)

  return {
    stars,
    star: nineStar,
    dateRangeIndex,
    monthDayStarsForNineStar,
    tenunStars,
  }
}

// 特定の文字に対する特別なマッピング
const specialCharToElement: Record<string, FiveElement | undefined> = {
  // 例：特定の文字を常に特定の五行に割り当てる場合
  火: "火星",
  水: "水星",
  木: "木星",
  金: "金星",
  土: "土星",
  // 5画の漢字で特別にマッピングするもの
  王: "金星", // 王は金の性質
  玉: "金星", // 玉は金の性質
  石: "土星", // 石は土の性質
  田: "土星", // 田は土の性質
  白: "金星", // 白は金の性質
  生: "木星", // 生は木の性質
  正: "金星", // 正は金の性質
  四: "水星", // 四は水の性質
  左: "木星", // 左は木の性質
  右: "金星", // 右は金の性質
  平: "土星", // 平は土の性質
  央: "土星", // 央は土の性質
  北: "水星", // 北は水の性質
  古: "土星", // 古は土の性質
  半: "金星", // 半は金の性質
  市: "木星", // 市は木の性質
  広: "土星", // 広は土の性質
}

// 画数から五行を導出する改良版マッピング
export function improvedStrokeToElement(char: string, strokes: number): FiveElement {
  // 特定の文字に対する特別なマッピングがあればそれを使用
  if (specialCharToElement[char]) {
    return specialCharToElement[char]!
  }

  // 特定の漢字と五行の対応表（拡張版）
  const characterToElement: Record<string, FiveElement> = {
    // 木の性質を持つ漢字
    木: "木星",
    林: "木星",
    森: "木星",
    竹: "木星",
    松: "木星",
    柳: "木星",
    杉: "木星",
    桜: "木星",
    梅: "木星",
    植: "木星",
    葉: "木星",
    菜: "木星",
    草: "木星",
    花: "木星",
    芽: "木星",
    // 火の性質を持つ漢字
    火: "火星",
    灯: "火星",
    炎: "火星",
    焔: "火星",
    燃: "火星",
    照: "火星",
    明: "火星",
    陽: "火星",
    日: "火星",
    夏: "火星",
    赤: "火星",
    丹: "火星",
    朱: "火星",
    暖: "火星",
    熱: "火星",
    // 土の性質を持つ漢字
    土: "土星",
    地: "土星",
    岩: "土星",
    山: "土星",
    岡: "土星",
    野: "土星",
    原: "土星",
    田: "土星",
    畑: "土星",
    石: "土星",
    砂: "土星",
    塚: "土星",
    城: "土星",
    壁: "土星",
    // 金の性質を持つ漢字
    金: "金星",
    銀: "金星",
    鉄: "金星",
    銅: "金星",
    鈴: "金星",
    鐘: "金星",
    針: "金星",
    剣: "金星",
    刀: "金星",
    鋼: "金星",
    鎌: "金星",
    鏡: "金星",
    鉱: "金星",
    // 水の性質を持つ漢字
    水: "水星",
    川: "水星",
    河: "水星",
    海: "水星",
    湖: "水星",
    池: "水星",
    泉: "水星",
    滝: "水星",
    雨: "水星",
    波: "水星",
    流: "水星",
    湯: "水星",
    潮: "水星",
    沢: "水星",
    清: "水星",
  }

  // 特定の漢字に対応がある場合はそれを使用
  if (characterToElement[char]) {
    return characterToElement[char]
  }

  // 通常のマッピングを使用
  return strokeToElement(strokes)
}

// 名前から五行要素を導出する関数を修正
function calculateNameElements(
  lastName: string,
  firstName: string,
): {
  nameStars: FiveElement[]
  nameCharsDebug: Array<{ char: string; strokes: number; element: FiveElement }>
} {
  // 各文字の画数と五行を記録（デバッグ用）
  const nameCharsDebug: Array<{ char: string; strokes: number; element: FiveElement }> = []

  // 姓と名の画数を計算
  let lastNameStrokes = 0
  let firstNameStrokes = 0

  // 姓の各文字の画数を計算
  for (const char of lastName) {
    const strokes = getCharStroke(char)
    lastNameStrokes += strokes
    nameCharsDebug.push({ char, strokes, element: improvedStrokeToElement(char, strokes) })
  }

  // 名の各文字の画数を計算
  for (const char of firstName) {
    const strokes = getCharStroke(char)
    firstNameStrokes += strokes
    nameCharsDebug.push({ char, strokes, element: improvedStrokeToElement(char, strokes) })
  }

  // 天格（姓運/先祖運）：姓の画数
  const tenFormat = lastNameStrokes

  // 人格（社会運）：姓の最後の文字と名の最初の文字の画数の合計
  const lastCharOfLastName = lastName.charAt(lastName.length - 1)
  const firstCharOfFirstName = firstName.charAt(0)
  const jinFormat = getCharStroke(lastCharOfLastName) + getCharStroke(firstCharOfFirstName)

  // 地格（基礎運）：名の画数
  const chiFormat = firstNameStrokes

  // 外格（仕事周囲運）：総格から人格を引いた数
  const totalFormat = lastNameStrokes + firstNameStrokes
  const gaiFormat = totalFormat - jinFormat

  // 総格（一生晩年運）：姓名の合計画数
  const sogoFormat = totalFormat

  // 各格から五行を導出
  const tenElement = strokeToElement(tenFormat)
  const jinElement = strokeToElement(jinFormat)
  const chiElement = strokeToElement(chiFormat)
  const gaiElement = strokeToElement(gaiFormat)
  const sogoElement = strokeToElement(sogoFormat)

  // 5つの格から導出された五行を配列にまとめる
  const nameStars: FiveElement[] = [tenElement, jinElement, chiElement, gaiElement, sogoElement]

  // デバッグ情報を出力
  console.log("Advanced Gogyo Calculation:")
  console.log(`Name: ${lastName} ${firstName}`)
  console.log(`Ten: ${tenFormat} (${tenElement}), Jin: ${jinFormat} (${jinElement}), Chi: ${chiFormat} (${chiElement})`)
  console.log(`Gai: ${gaiFormat} (${gaiElement}), Sogo: ${sogoFormat} (${sogoElement})`)

  return { nameStars, nameCharsDebug }
}

// 星を五行要素としてカウントする関数
function countElementFromStar(star: FiveElement, elements: any): void {
  switch (star) {
    case "木星":
      elements.wood++
      break
    case "火星":
      elements.fire++
      break
    case "土星":
      elements.earth++
      break
    case "金星":
      elements.metal++
      break
    case "水星":
      elements.water++
      break
  }
}

// 名前の画数を計算する関数
function calculateStrokeCount(name: string): number {
  let total = 0
  for (const char of name) {
    total += getCharStroke(char)
  }
  return total
}

// 社会運を計算する関数
function calculateSocialLuck(lastNameStrokes: number, firstNameStrokes: number): number {
  // 社会運 = 姓名の合計から導出
  return (lastNameStrokes + firstNameStrokes) % 30 || 30
}

// 陰陽を判定する関数
function determineYinYang(birthdate: Date): "陰" | "陽" {
  const year = birthdate.getFullYear()
  // 干支に基づく陰陽判定（簡易版）
  return year % 2 === 0 ? "陽" : "陰"
}
