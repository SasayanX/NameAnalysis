"use client"

// 分割されたデータをインポート（正しいエクスポート形式に合わせて修正）
import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"

// CSVインポートデータのインポート
import { csvImportedData } from "./stroke-data/csv-imported-data"

// パフォーマンス最適化: 正規表現を事前定義
const REGEX_PATTERNS = {
  english: /[a-zA-Z]/,
  number: /[0-9]/,
  hiragana: /[\u3040-\u309F]/,
  katakana: /[\u30A0-\u30FF]/,
  kanji: /[\u4E00-\u9FAF]/,
}

// デバッグモードを一時的に有効化して問題を特定
const DEBUG_MODE = true // デバッグモードを有効化

// 全ての画数データを統合（優先順位：後から読み込まれるものが優先）
export const strokeCountData: Record<string, number> = {
  ...basicNumbersData,
  ...surnamesData,
  ...givenNamesData,
  ...commonKanjiData,
  ...hiraganaData,
  ...katakanaData,
  ...extendedKanjiData,
  ...csvImportedData, // CSVデータを最優先で統合
}

// 「々」を削除（特別処理するため）
delete strokeCountData["々"]

// 文字の画数を取得する関数（単一文字用）- 最適化版
export function getCharStroke(char: string): number {
  const stroke = strokeCountData[char]
  if (stroke === undefined) {
    return 0
  }
  return stroke
}

// 文字種別に応じたデフォルト値を取得する関数（最適化版）
function getDefaultStrokeByCharType(char: string): number {
  if (REGEX_PATTERNS.english.test(char)) {
    return 1
  }
  if (REGEX_PATTERNS.number.test(char)) {
    return 1
  }
  if (REGEX_PATTERNS.hiragana.test(char)) {
    return 3
  }
  if (REGEX_PATTERNS.katakana.test(char)) {
    return 3
  }
  if (REGEX_PATTERNS.kanji.test(char)) {
    return 10
  }
  return 1
}

// 文字の画数を取得する関数（コンテキスト付き - 「々」の特別処理対応）- 最適化版
export function getCharStrokeWithContext(
  char: string,
  fullText: string,
  position: number,
): {
  stroke: number
  isDefault: boolean
} {
  if (DEBUG_MODE) {
    console.log(`🔍 getCharStrokeWithContext: "${char}" (位置: ${position})`)
    console.log(`📊 strokeCountData["${char}"] =`, strokeCountData[char])
  }

  // 🚨 FORCED PROCESSING - 最優先で処理
  if (char === "假") {
    console.log(`🎯🔴 FORCED: "假" → 10画 (強制的にisDefault: true)`)
    return { stroke: 10, isDefault: true }
  }

  if (char === "省") {
    console.log(`🎯🔴 FORCED: "省" → 10画 (強制的にisDefault: true)`)
    return { stroke: 10, isDefault: true }
  }

  if (char === "々") {
    // 々は直前の漢字の画数と同じ
    if (position > 0) {
      const prevChar = fullText.charAt(position - 1)
      const prevStroke = strokeCountData[prevChar]
      if (prevStroke === undefined) {
        if (DEBUG_MODE) {
          console.log(`⚠️ 々の前の文字"${prevChar}"も画数データなし → デフォルト3画`)
        }
        return { stroke: 3, isDefault: true }
      }
      if (DEBUG_MODE) {
        console.log(`✅ 々 → 前の文字"${prevChar}"と同じ${prevStroke}画`)
      }
      return { stroke: prevStroke, isDefault: false }
    } else {
      if (DEBUG_MODE) {
        console.log(`⚠️ 々が先頭にある → デフォルト3画`)
      }
      return { stroke: 3, isDefault: true }
    }
  }

  const stroke = strokeCountData[char]

  if (stroke === undefined) {
    const defaultStroke = getDefaultStrokeByCharType(char)
    if (DEBUG_MODE) {
      console.log(`❌ "${char}"の画数データなし → デフォルト${defaultStroke}画 (isDefault: true)`)
    }
    return { stroke: defaultStroke, isDefault: true }
  }

  if (DEBUG_MODE) {
    console.log(`✅ "${char}" → ${stroke}画 (データあり)`)
  }
  return { stroke, isDefault: false }
}

// 霊数を考慮した名前の画数配列を取得する関数（最適化版）
export function getNameStrokesWithReisuuArray(
  lastName: string,
  firstName: string,
): {
  lastNameStrokes: number[]
  firstNameStrokes: number[]
  hasReisuuInLastName: boolean
  hasReisuuInFirstName: boolean
} {
  if (DEBUG_MODE) {
    console.log(`🔍 霊数計算開始: 姓="${lastName}", 名="${firstName}"`)
  }

  const lastNameChars = Array.from(lastName)
  const firstNameChars = Array.from(firstName)

  // 基本の画数配列を計算
  const baseLastNameStrokes = lastNameChars.map((char, i) => {
    const { stroke } = getCharStrokeWithContext(char, lastName, i)
    return stroke
  })

  const baseFirstNameStrokes = firstNameChars.map((char, i) => {
    const { stroke } = getCharStrokeWithContext(char, firstName, i)
    return stroke
  })

  // 霊数の追加判定
  const hasReisuuInLastName = lastNameChars.length === 1
  const hasReisuuInFirstName = firstNameChars.length === 1

  // 霊数を考慮した最終的な画数配列
  const lastNameStrokes = hasReisuuInLastName
    ? [1, ...baseLastNameStrokes] // 姓の上に霊数「一」（1画）を追加
    : baseLastNameStrokes

  const firstNameStrokes = hasReisuuInFirstName
    ? [...baseFirstNameStrokes, 1] // 名の下に霊数「一」（1画）を追加
    : baseFirstNameStrokes

  if (DEBUG_MODE) {
    console.log(`✅ 霊数計算完了:`)
    console.log(`  姓の画数: [${lastNameStrokes.join(", ")}] (霊数: ${hasReisuuInLastName ? "あり" : "なし"})`)
    console.log(`  名の画数: [${firstNameStrokes.join(", ")}] (霊数: ${hasReisuuInFirstName ? "あり" : "なし"})`)
  }

  return {
    lastNameStrokes,
    firstNameStrokes,
    hasReisuuInLastName,
    hasReisuuInFirstName,
  }
}

// 名前の総画数を計算する関数（霊数考慮）
export function calculateTotalStrokes(name: string): number {
  return calculateNameStrokes(name) // 「々」の特別処理を含む関数を使用
}

// 名前の画数を計算する関数（々の特別処理を含む）- 最適化版
export function calculateNameStrokes(name: string): number {
  let total = 0
  const chars = Array.from(name)

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const { stroke } = getCharStrokeWithContext(char, name, i)
    total += stroke
  }

  return total
}

// アドバイステンプレート（メモリ効率化）
const ADVICE_TEMPLATES = {
  excellent:
    "🌟 **全体的な運勢について**\nあなたのお名前は非常に優れたバランスを持っており、人生において多くの幸運に恵まれる暗示があります。",
  good: "⭐ **全体的な運勢について**\nあなたのお名前は安定した運勢を示しており、努力次第で着実に成果を上げることができます。",
  moderate:
    "💫 **全体的な運勢について**\nあなたのお名前は変化に富んだ運勢を示しています。困難もありますが、それを乗り越える力も同時に備わっています。",
  challenging:
    "🌱 **全体的な運勢について**\nあなたのお名前は試練を通じて成長する運勢を示しています。困難に直面することもありますが、それは魂を磨くための大切な経験です。",
}

// アドバイスを生成する関数（最適化版）
function generateAdvice(
  tenFortune: any,
  jinFortune: any,
  chiFortune: any,
  gaiFortune: any,
  totalFortune: any,
  lastName: string,
  firstName: string,
  gender = "male",
  tenFormat: number,
  jinFormat: number,
  chiFormat: number,
  gaiFormat: number,
  totalFormat: number,
): string {
  const fullName = lastName + firstName
  const genderText = gender === "male" ? "男性" : gender === "female" ? "女性" : ""

  // 各格の運勢を分析
  const fortunes = {
    天格: { fortune: tenFortune, strokes: tenFormat, score: calculateScore(tenFortune) },
    人格: { fortune: jinFortune, strokes: jinFormat, score: calculateScore(jinFortune) },
    地格: { fortune: chiFortune, strokes: chiFormat, score: calculateScore(chiFortune) },
    外格: { fortune: gaiFortune, strokes: gaiFormat, score: calculateScore(gaiFortune) },
    総格: { fortune: totalFortune, strokes: totalFormat, score: calculateScore(totalFortune) },
  }

  // 最も良い格と悪い格を特定
  const sortedByScore = Object.entries(fortunes).sort((a, b) => b[1].score - a[1].score)
  const bestCategory = sortedByScore[0]
  const worstCategory = sortedByScore[sortedByScore.length - 1]
  const secondBest = sortedByScore[1]

  // 基本的な運勢の傾向を分析
  const averageScore = Object.values(fortunes).reduce((sum, f) => sum + f.score, 0) / 5
  const scoreVariance = Object.values(fortunes).reduce((sum, f) => sum + Math.pow(f.score - averageScore, 2), 0) / 5

  let advice = ""

  // 導入部分 - より親身で温かい挨拶
  advice += `🌸 **${fullName}さんへの詳細鑑定結果**\n\n`
  advice += `${fullName}さん、この度はご相談いただき、ありがとうございます。あなたのお名前を心を込めて詳しく拝見させていただきました。`
  if (genderText) {
    advice += `${genderText}として生まれ持った運勢と、ご両親が込められた愛情深いお名前の力を、五格すべてから総合的に分析いたします。`
  }
  advice += `\n\n`

  // 全体的な運勢の傾向分析（より詳細に）
  advice += `📊 **あなたの運勢の全体像**\n`
  if (averageScore >= 75) {
    advice += `あなたのお名前は非常に優れたバランスを持っており、人生において多くの幸運に恵まれる暗示があります。特に注目すべきは、五格のうち${Math.round(sortedByScore.filter(([_, data]) => data.score >= 70).length)}つの格が良好な運勢を示していることです。`
  } else if (averageScore >= 60) {
    advice += `あなたのお名前は安定した運勢を示しており、努力次第で着実に成果を上げることができます。バランスの取れた運勢配置により、人生の各段階で適切な成長を遂げられるでしょう。`
  } else if (averageScore >= 45) {
    advice += `あなたのお名前は変化に富んだ運勢を示しています。困難もありますが、それを乗り越える力も同時に備わっています。人生の波を上手に乗りこなすことで、大きな成長を遂げられる方です。`
  } else {
    advice += `あなたのお名前は試練を通じて成長する運勢を示しています。困難に直面することもありますが、それは魂を磨くための大切な経験です。逆境を乗り越えた時の成長は、他の人には得られない深い人間性をもたらします。`
  }

  // 運勢のバランス分析
  if (scoreVariance > 400) {
    advice += `\n\nあなたの運勢は起伏に富んでおり、人生に大きなドラマがある方です。${bestCategory[0]}（${bestCategory[1].score}点）が特に優秀で、これがあなたの人生の大きな武器となります。一方で、${worstCategory[0]}（${worstCategory[1].score}点）については慎重な配慮が必要ですが、これもあなたの個性の一部として受け入れることで、バランスの取れた人格を形成できます。`
  } else {
    advice += `\n\nあなたの運勢は全体的にバランスが取れており、安定した人生を歩める方です。極端な浮き沈みは少なく、着実に目標に向かって進んでいける運勢配置となっています。`
  }
  advice += `\n\n`

  // 各格の詳細分析（簡略化）
  advice += `🔍 **五格それぞれの詳細分析とアドバイス**\n\n`

  // 人格（最重要）
  advice += `**👤 人格運（${jinFormat}画・${jinFortune.運勢}）- あなたの本質と才能**\n`
  advice += `人格はあなたの核となる性格や才能を表す、最も重要な格です。\n`

  if (jinFortune.運勢.includes("大吉")) {
    advice += `あなたは生まれながらにして優れた人格的魅力を持っています。${jinFortune.説明 || ""}\n`
    advice += `✨ **具体的なアドバイス**: この素晴らしい人格運を活かし、リーダーシップを発揮することで、多くの人を導き、自身も大きな成功を収めることができるでしょう。`
  } else if (jinFortune.運勢.includes("吉")) {
    advice += `あなたは安定した人格的基盤を持っています。${jinFortune.説明 || ""}\n`
    advice += `✨ **具体的なアドバイス**: この良好な人格運を基に、継続的な努力を重ねることで、着実に目標を達成できます。`
  } else if (jinFortune.運勢.includes("凶")) {
    advice += `人格面では慎重な歩みが必要ですが、これは決して悪いことではありません。${jinFortune.説明 || ""}\n`
    advice += `✨ **具体的なアドバイス**: 内面を深く見つめ、精神的な成長を遂げることで、他の人にはない深い洞察力や共感力を身につけることができます。`
  }
  advice += `\n\n`

  // 総格（人生全体）
  advice += `**🌍 総格運（${totalFormat}画・${totalFortune.運勢}）- 人生全体の流れと最終的な到達点**\n`
  advice += `総格はあなたの人生全体の流れと、最終的にどのような人生を歩むかを示します。\n`

  if (totalFortune.運勢.includes("大吉")) {
    advice += `あなたの人生は全体的に非常に恵まれた流れにあります。${totalFortune.説明 || ""}\n`
    advice += `🎯 **人生設計のアドバイス**: 特に中年期以降、大きな飛躍が期待できます。この幸運を当然と思わず、感謝の気持ちを忘れずに、周囲への貢献も心がけてください。`
  } else if (totalFortune.運勢.includes("吉")) {
    advice += `あなたの人生は安定した成長を続ける運勢にあります。${totalFortune.説明 || ""}\n`
    advice += `🎯 **人生設計のアドバイス**: 急激な変化よりも、着実な積み重ねが成功への鍵となります。長期的な視点を持ち、コツコツと努力を続けることが大切です。`
  } else if (totalFortune.運勢.includes("凶")) {
    advice += `人生において試練が多い運勢ですが、それは大きな成長のチャンスでもあります。${totalFortune.説明 || ""}\n`
    advice += `🎯 **人生設計のアドバイス**: 困難に直面した時こそ、あなたの真の力が発揮されます。諦めずに前進し続けることで、最終的には大きな成果を得られるでしょう。`
  }
  advice += `\n\n`

  // 締めくくりのメッセージ（簡略化）
  advice += `💝 **${fullName}さんへの最終メッセージ**\n\n`
  advice += `${fullName}さん、この詳細な鑑定を通じて、あなたのお名前に込められた素晴らしい可能性をお伝えできたでしょうか。\n\n`

  advice += `あなたの最大の強みは「${bestCategory[0]}運」にあります。この${bestCategory[1].score}点という高い運勢を活かし、自信を持って人生を歩んでください。`

  if (worstCategory[1].score <= 50) {
    advice += `一方で「${worstCategory[0]}運」については注意が必要ですが、これも含めてあなたの個性です。完璧な人などいません。課題があるからこそ、成長の余地があり、人生に深みが生まれるのです。`
  }

  advice += `\n\n運勢は固定されたものではありません。あなたの行動と心がけ次第で、必ず良い方向に導くことができます。この鑑定結果を参考に、自分らしい人生を歩んでください。\n\n`

  advice += `🌸 **鑑定師より愛を込めて** 🌸`

  return advice
}

// スコアを計算する関数
function calculateScore(fortune: any): number {
  switch (fortune["運勢"]) {
    case "大吉":
      return 100
    case "吉":
      return 80
    case "中吉":
      return 60
    case "凶":
      return 40
    case "大凶":
      return 20
    default:
      return 50
  }
}

// 運勢データを取得する関数
function getFortuneFromCustomDataWithGender(
  strokes: number,
  customFortuneData: Record<string, any>,
  gender: string,
): any {
  const key = String(strokes)
  let fortune = customFortuneData[key]

  console.log(`🔍 getFortuneFromCustomDataWithGender: ${key}画`, {
    key,
    fortune,
    hasData: !!fortune,
    customFortuneDataKeys: Object.keys(customFortuneData).slice(0, 10)
  })

  if (!fortune) {
    console.warn(`⚠️ ${key}画の吉凶データが見つかりません`)
    return { 運勢: "不明", 説明: "" }
  }

  // 性別固有の調整
  if (gender === "female" && fortune.female) {
    fortune = fortune.female
  }

  return fortune
}

// analyzeNameFortune関数 - 霊数ルールを組み込み（メイン関数）- 最適化版
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>, // オプショナルに変更
): any {
  try {
    console.log(`🎯 analyzeNameFortune開始: "${lastName} ${firstName}" (${gender})`)
    console.log(`🔍 customFortuneData提供状況:`, !!customFortuneData)
    console.log(`🔍 customFortuneData型:`, typeof customFortuneData)
    if (customFortuneData) {
      console.log(`🔍 customFortuneData件数:`, Object.keys(customFortuneData).length)
      console.log(`🔍 customFortuneData先頭5件:`, Object.keys(customFortuneData).slice(0, 5))
    } else {
      console.log(`⚠️ customFortuneDataがundefinedまたはnullです`)
    }

  // customFortuneDataが提供されていない場合、カスタムデータをインポート
  if (!customFortuneData) {
    console.log("⚠️ customFortuneDataが提供されていません。インポートを試行します。")
    try {
      // カスタムデータをインポート
      const { customFortuneData: importedData } = require("./fortune-data-custom")
      customFortuneData = importedData
      console.log("✅ カスタムデータをインポートしました:", Object.keys(customFortuneData).length, "件")
    } catch (error) {
      console.error("カスタムデータのインポートに失敗:", error)
      // デフォルトの運勢データを使用
      customFortuneData = {
        // 基本的な運勢データ（簡易版）
        "1": { 運勢: "大吉", 説明: "独立心旺盛で、リーダーシップを発揮します。" },
        "2": { 運勢: "凶", 説明: "協調性はありますが、優柔不断な面があります。" },
        "3": { 運勢: "大吉", 説明: "明るく積極的で、人気者になります。" },
        "4": { 運勢: "凶", 説明: "真面目ですが、苦労が多い傾向があります。" },
        "5": { 運勢: "大吉", 説明: "バランス感覚に優れ、安定した人生を送ります。" },
      "6": { 運勢: "大吉", 説明: "責任感が強く、家族思いです。" },
      "7": { 運勢: "吉", 説明: "独立心があり、専門分野で成功します。" },
      "8": { 運勢: "大吉", 説明: "意志が強く、困難を乗り越える力があります。" },
      "9": { 運勢: "凶", 説明: "頭脳明晰ですが、変化の多い人生になります。" },
      "10": { 運勢: "凶", 説明: "波乱万丈な人生ですが、最終的には成功します。" },
    }

    // 11-81画までの基本的なデフォルト値を生成
    for (let i = 11; i <= 81; i++) {
      if (!customFortuneData[i.toString()]) {
        const mod = i % 10
        if ([1, 3, 5, 6, 8].includes(mod)) {
          customFortuneData[i.toString()] = { 運勢: "吉", 説明: "良好な運勢です。" }
        } else if ([2, 4, 9].includes(mod)) {
          customFortuneData[i.toString()] = { 運勢: "凶", 説明: "注意が必要な運勢です。" }
        } else {
          customFortuneData[i.toString()] = { 運勢: "中吉", 説明: "普通の運勢です。" }
        }
      }
    }
  }

  // 空白を削除
  lastName = lastName.trim()
  firstName = firstName.trim()

  // 霊数を考慮した画数配列を取得
  const { lastNameStrokes, firstNameStrokes, hasReisuuInLastName, hasReisuuInFirstName } =
    getNameStrokesWithReisuuArray(lastName, firstName)

  // 姓と名の画数を計算（霊数含む）
  const lastNameCount = lastNameStrokes.reduce((sum, stroke) => sum + stroke, 0)
  const firstNameCount = firstNameStrokes.reduce((sum, stroke) => sum + stroke, 0)

  // 各格の計算（ExcalVBAプログラム準拠）
  // 天格（先祖・姓運）= 姓の画数の合計（霊数含む）
  const tenFormat = lastNameCount

  // 地格（基礎運）= 名の画数の合計（霊数含む）
  const chiFormat = firstNameCount

  // 総格（一生・晩年運）= 天格 + 地格
  const totalFormat = tenFormat + chiFormat

  // 人格（社会運）= の最後の文字 + 名の最初の文字（霊数除外）
  const lastCharOfLastName = lastName.charAt(lastName.length - 1)
  const firstCharOfFirstName = firstName.charAt(0)
  const { stroke: lastCharStroke } = getCharStrokeWithContext(lastCharOfLastName, lastName, firstName.length - 1)
  const { stroke: firstCharStroke } = getCharStrokeWithContext(firstCharOfFirstName, firstName, 0)
  const jinFormat = lastCharStroke + firstCharStroke

  // 外格（仕事・周囲運）の計算（ExcalVBAプログラム準拠）
  let gaiFormat: number

  if (hasReisuuInLastName && hasReisuuInFirstName) {
    // 両方とも1文字の場合：外格 = 霊数 + 霊数 = 2画
    gaiFormat = 2
  } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
    // 姓1文字・名複数文字の場合：外格 = 霊数 + 名の最初の文字を除外した残り
    const nameWithoutFirst = Array.from(firstName).slice(1)
    const remainingStrokes = nameWithoutFirst.reduce((sum, char, i) => {
      const { stroke } = getCharStrokeWithContext(char, firstName, i + 1)
      return sum + stroke
    }, 0)
    gaiFormat = 1 + remainingStrokes
  } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
    // 姓複数文字・名1文字の場合：外格 = 姓の最後の文字を除外した残り + 霊数
    const lastNameWithoutLast = Array.from(lastName).slice(0, -1)
    const remainingStrokes = lastNameWithoutLast.reduce((sum, char, i) => {
      const { stroke } = getCharStrokeWithContext(char, lastName, i)
      return sum + stroke
    }, 0)
    gaiFormat = remainingStrokes + 1
  } else {
    // 通常の場合（複数字姓・複数字名）：外格 = 姓の最初の文字を除外 + 名の最初の文字を除外
    const lastNameWithoutFirst = Array.from(lastName).slice(1)
    const firstNameWithoutFirst = Array.from(firstName).slice(1)
    
    const lastNameRemainingStrokes = lastNameWithoutFirst.reduce((sum, char, i) => {
      const { stroke } = getCharStrokeWithContext(char, lastName, i + 1)
      return sum + stroke
    }, 0)
    
    const firstNameRemainingStrokes = firstNameWithoutFirst.reduce((sum, char, i) => {
      const { stroke } = getCharStrokeWithContext(char, firstName, i + 1)
      return sum + stroke
    }, 0)
    
    gaiFormat = lastNameRemainingStrokes + firstNameRemainingStrokes
  }

  // 外格が0以下になった場合の安全チェック
  if (gaiFormat <= 0) {
    gaiFormat = 2 // 一字姓・一字名の場合は最低2画
  }

  // 各格の吉凶を取得（カスタムデータを使用）
  console.log("🔍 吉凶データ取得デバッグ:", {
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat,
    customFortuneData16: customFortuneData["16"],
    customFortuneData23: customFortuneData["23"],
    customFortuneData31: customFortuneData["31"],
    customFortuneData24: customFortuneData["24"],
    customFortuneData47: customFortuneData["47"]
  })
  
  const tenFortune = getFortuneFromCustomDataWithGender(tenFormat, customFortuneData, gender)
  const jinFortune = getFortuneFromCustomDataWithGender(jinFormat, customFortuneData, gender)
  const chiFortune = getFortuneFromCustomDataWithGender(chiFormat, customFortuneData, gender)
  const gaiFortune = getFortuneFromCustomDataWithGender(gaiFormat, customFortuneData, gender)
  const totalFortune = getFortuneFromCustomDataWithGender(totalFormat, customFortuneData, gender)
  
  console.log("🔍 取得された吉凶データ:", {
    tenFortune,
    jinFortune,
    chiFortune,
    gaiFortune,
    totalFortune
  })

  // スコアの計算
  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  // 総合スコアの計算（人格と総格を重視）
  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

  // characterDetailsで霊数情報も含める（デバッグ強化版）
  const characterDetails = []

  // 姓の文字詳細（霊数含む）
  if (hasReisuuInLastName) {
    characterDetails.push({
      name: "姓の霊数",
      character: "一",
      strokes: 1,
      isReisuu: true,
      isDefault: false,
    })
  }

  const lastNameChars = Array.from(lastName)
  lastNameChars.forEach((char, i) => {
    const { stroke, isDefault } = getCharStrokeWithContext(char, lastName, i)
    if (DEBUG_MODE) {
      console.log(`📝 姓の${i + 1}文字目: "${char}" → ${stroke}画 (isDefault: ${isDefault})`)
    }
    characterDetails.push({
      name: "姓の" + (i + 1) + "文字目",
      character: char,
      strokes: stroke,
      isReisuu: false,
      isDefault: isDefault,
    })
  })

  // 名の文字詳細（霊数含む）
  const firstNameChars = Array.from(firstName)
  firstNameChars.forEach((char, i) => {
    const { stroke, isDefault } = getCharStrokeWithContext(char, firstName, i)
    if (DEBUG_MODE) {
      console.log(`📝 名の${i + 1}文字目: "${char}" → ${stroke}画 (isDefault: ${isDefault})`)
    }
    characterDetails.push({
      name: "名の" + (i + 1) + "文字目",
      character: char,
      strokes: stroke,
      isReisuu: false,
      isDefault: isDefault,
    })
  })

  if (hasReisuuInFirstName) {
    characterDetails.push({
      name: "名の霊数",
      character: "一",
      strokes: 1,
      isReisuu: true,
      isDefault: false,
    })
  }

  if (DEBUG_MODE) {
    console.log(`🎯 characterDetails生成完了:`, characterDetails)
  }

  // 結果オブジェクトを構築
  const result = {
    totalScore: overallScore,
    categories: [
      {
        name: "天格",
        score: tenScore,
        description: "社会的な成功や対外的な印象を表します",
        fortune: tenFortune["運勢"] || "不明",
        explanation: tenFortune["説明"] || "",
        strokeCount: tenFormat,
      },
      {
        name: "人格",
        score: jinScore,
        description: "性格や才能、人生の中心的な運勢を表します",
        fortune: jinFortune["運勢"] || "不明",
        explanation: jinFortune["説明"] || "",
        strokeCount: jinFormat,
      },
      {
        name: "地格",
        score: chiScore,
        description: "家庭環境や若年期の運勢を表します",
        fortune: chiFortune["運勢"] || "不明",
        explanation: chiFortune["説明"] || "",
        strokeCount: chiFormat,
      },
      {
        name: "外格",
        score: gaiScore,
        description: "社会的な人間関係や外部からの影響を表します",
        fortune: gaiFortune["運勢"] || "不明",
        explanation: gaiFortune["説明"] || "",
        strokeCount: gaiFormat,
      },
      {
        name: "総格",
        score: totalScore,
        description: "人生全体の総合的な運勢を表します",
        fortune: totalFortune["運勢"] || "不明",
        explanation: totalFortune["説明"] || "",
        strokeCount: totalFormat,
      },
    ],
    characterDetails: characterDetails,
    advice: generateAdvice(
      tenFortune,
      jinFortune,
      chiFortune,
      gaiFortune,
      totalFortune,
      lastName,
      firstName,
      gender,
      tenFormat,
      jinFormat,
      chiFormat,
      gaiFormat,
      totalFormat,
    ),
    ten: {
      運勢: tenFortune["運勢"] || "不明",
      説明: tenFortune["説明"] || "",
    },
    jin: {
      運勢: jinFortune["運勢"] || "不明",
      説明: jinFortune["説明"] || "",
    },
    chi: {
      運勢: chiFortune["運勢"] || "不明",
      説明: chiFortune["説明"] || "",
    },
    gai: {
      運勢: gaiFortune["運勢"] || "不明",
      説明: gaiFortune["説明"] || "",
    },
    total: {
      運勢: totalFortune["運勢"] || "不明",
      説明: totalFortune["説明"] || "",
    },
    tenFormat: tenFormat,
    jinFormat: jinFormat,
    chiFormat: chiFormat,
    gaiFormat: gaiFormat,
    totalFormat: totalFormat,
  }

  if (DEBUG_MODE) {
    console.log(`🎯 analyzeNameFortune完了:`, result)
  }

  return result
  } catch (error) {
    console.error("❌ analyzeNameFortune関数でエラーが発生しました:", error)
    console.error("❌ エラーの詳細:", {
      lastName,
      firstName,
      gender,
      customFortuneDataProvided: !!customFortuneData,
      errorMessage: error.message,
      errorStack: error.stack
    })
    throw error
  }
}
