import { getCharStroke, calculateNameStrokes } from "./name-data-simple"
import { DataSource, tagDataSource } from "./data-policy"

// 運勢を取得する関数（カスタムデータを使用）
export function getFortuneCustom(strokeCount: number, customFortuneData: Record<string, any>): any {
  // strokeCountをキーとしてcustomFortuneDataから運勢情報を取得
  if (customFortuneData[strokeCount]) {
    return customFortuneData[strokeCount]
  }

  // 登録されていない画数の場合は、近い画数の運勢を返す
  const availableStrokes = Object.keys(customFortuneData)
    .map(Number)
    .sort((a, b) => a - b)

  if (availableStrokes.length === 0) {
    return { 運勢: "不明", 説明: "情報がありません" }
  }

  // 最も近い画数を探す
  let closest = availableStrokes[0]
  let minDiff = Math.abs(strokeCount - closest)

  for (const stroke of availableStrokes) {
    const diff = Math.abs(strokeCount - stroke)
    if (diff < minDiff) {
      minDiff = diff
      closest = stroke
    }
  }

  // 最も近い画数の運勢を返す（ただし、差が5以上ある場合は「不明」とする）
  if (minDiff <= 5) {
    const fortune = customFortuneData[closest]
    return {
      運勢: fortune.運勢,
      説明: `(${closest}画に近い) ${fortune.説明}`,
    }
  }

  return { 運勢: "不明", 説明: "この画数の情報は現在登録されていません。" }
}

// スコアを計算する関数
function calculateScore(fortune: any): number {
  // 運勢に基づいてスコアを計算
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
    case "中凶":
      return 30
    default:
      return 50 // 不明な場合は中間的なスコア
  }
}

// アドバイスを生成する関数
function generateAdvice(tenFortune: any, jinFortune: any, chiFortune: any, gaiFortune: any, totalFortune: any): string {
  let advice = ""

  // 各運勢からアドバイスを生成
  if (tenFortune["運勢"] === "凶" || tenFortune["運勢"] === "大凶") {
    advice += "社会的な成功のためには、周囲との協調を心がけましょう。 "
  }
  if (jinFortune["運勢"] === "凶" || jinFortune["運勢"] === "大凶") {
    advice += "内面的な成長のために、自己分析を深め、精神的なバランスを取りましょう。 "
  }
  if (chiFortune["運勢"] === "凶" || chiFortune["運勢"] === "大凶") {
    advice += "家庭環境を大切にし、家族とのコミュニケーションを密にしましょう。 "
  }
  if (gaiFortune["運勢"] === "凶" || gaiFortune["運勢"] === "大凶") {
    advice += "対人関係においては、相手の立場を理解し、思いやりを持って接することが大切です。 "
  }
  if (totalFortune["運勢"] === "凶" || totalFortune["運勢"] === "大凶") {
    advice += "人生全体を通して、困難に立ち向かう勇気と、変化に対応する柔軟性を持ちましょう。 "
  }

  if (advice === "") {
    advice = "全体的に良好な運勢です。この調子で積極的に行動しましょう。"
  }

  return advice
}

// analyzeNameFortuneCustom関数（カスタムデータを使用）
export function analyzeNameFortuneCustom(
  lastName: string,
  firstName: string,
  customFortuneData: Record<string, any>,
  gender = "male",
): any {
  console.log(`姓名判断開始: 姓=${lastName}, 名=${firstName}, 性別=${gender}`)

  // 空白を削除
  lastName = lastName.trim()
  firstName = firstName.trim()

  // 姓と名の画数を計算
  const lastNameCount = calculateNameStrokes(lastName)
  const firstNameCount = calculateNameStrokes(firstName)

  // 霊数の判定
  const hasReisuuInLastName = lastName.length === 1
  const hasReisuuInFirstName = firstName.length === 1

  console.log(`=== 霊数判定（Custom関数）===`)
  console.log(`姓「${lastName}」(${lastName.length}文字): ${hasReisuuInLastName ? "霊数あり" : "霊数なし"}`)
  console.log(`名「${firstName}」(${firstName.length}文字): ${hasReisuuInFirstName ? "霊数あり" : "霊数なし"}`)

  // 各格の計算（霊数ルール適用）
  // 天格 = 姓の画数の合計（霊数含む）
  const tenFormat = hasReisuuInLastName ? lastNameCount + 1 : lastNameCount

  // 地格 = 名の画数の合計（霊数含む）
  const chiFormat = hasReisuuInFirstName ? firstNameCount + 1 : firstNameCount

  // 総格 = 全ての画数の合計（霊数除外）
  const totalFormat = lastNameCount + firstNameCount

  // 人格 = 姓の最後の文字と名の最初の文字の画数の合計（霊数除外）
  const lastCharOfLastName = lastName.charAt(lastName.length - 1)
  const firstCharOfFirstName = firstName.charAt(0)
  const jinFormat = getCharStroke(lastCharOfLastName) + getCharStroke(firstCharOfFirstName)

  console.log(`=== 各格計算結果（Custom関数・霊数適用）===`)
  console.log(`天格: ${tenFormat}画 (姓${lastNameCount}画${hasReisuuInLastName ? " + 霊数1画" : ""})`)
  console.log(`地格: ${chiFormat}画 (名${firstNameCount}画${hasReisuuInFirstName ? " + 霊数1画" : ""})`)
  console.log(`人格: ${jinFormat}画 (霊数除外)`)
  console.log(`総格: ${totalFormat}画 (霊数除外)`)

  // 外格の計算（完全修正版）
  let gaiFormat: number

  console.log(`=== 外格計算開始（Custom関数・完全修正版）===`)

  if (hasReisuuInLastName && hasReisuuInFirstName) {
    // 両方とも一字の場合：外格 = 霊数 + 霊数 = 2画
    gaiFormat = 2
    console.log(`✅ 一字姓・一字名の外格: 霊数1画 + 霊数1画 = ${gaiFormat}画`)
  } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
    // 一字姓・複数字名の場合：外格 = 霊数 + 名の最後の文字
    const lastCharOfFirstName = firstName.charAt(firstName.length - 1)
    const lastCharStroke = getCharStroke(lastCharOfFirstName)
    gaiFormat = 1 + lastCharStroke
    console.log(
      `✅ 一字姓・複数字名の外格: 霊数1画 + 名の最後の文字「${lastCharOfFirstName}」${lastCharStroke}画 = ${gaiFormat}画`,
    )
  } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
    // 複数字姓・一字名の場合：外格 = 姓の最初の文字 + 霊数
    const firstCharOfLastName = lastName.charAt(0)
    const firstCharStroke = getCharStroke(firstCharOfLastName)
    gaiFormat = firstCharStroke + 1
    console.log(
      `✅ 複数字姓・一字名の外格: 姓の最初の文字「${firstCharOfLastName}」${firstCharStroke}画 + 霊数1画 = ${gaiFormat}画`,
    )
  } else {
    // 通常の場合（複数字姓・複数字名）：外格 = 天格 + 地格 - 人格
    gaiFormat = tenFormat + chiFormat - jinFormat
    console.log(`✅ 通常の外格: 天格${tenFormat}画 + 地格${chiFormat}画 - 人格${jinFormat}画 = ${gaiFormat}画`)
  }

  // 外格が0以下になった場合の安全チェック
  if (gaiFormat <= 0) {
    console.error(`❌ 外格が${gaiFormat}画になりました。最小値2画に修正します。`)
    gaiFormat = 2
  }

  console.log(`=== 外格計算完了（Custom関数）: ${gaiFormat}画 ===`)

  // 各格の吉凶を取得（カスタムデータを使用）
  const tenFortune = getFortuneCustom(tenFormat, customFortuneData)
  const jinFortune = getFortuneCustom(jinFormat, customFortuneData)
  const chiFortune = getFortuneCustom(chiFormat, customFortuneData)
  const gaiFortune = getFortuneCustom(gaiFormat, customFortuneData)
  const totalFortune = getFortuneCustom(totalFormat, customFortuneData)

  // スコアの計算
  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  // 総合スコアの計算（人格と総格を重視）
  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

  // 結果を返す
  const result = {
    totalScore: overallScore,
    categories: [
      {
        name: "天格",
        score: tenScore,
        description: "社会的な成功や対外的な印象を表します",
        fortune: tenFortune["運勢"] || "不明",
        explanation: tenFortune["説明"] || "",
      },
      {
        name: "人格",
        score: jinScore,
        description: "性格や才能、人生の中心的な運勢を表します",
        fortune: jinFortune["運勢"] || "不明",
        explanation: jinFortune["説明"] || "",
      },
      {
        name: "地格",
        score: chiScore,
        description: "家庭環境や若年期の運勢を表します",
        fortune: chiFortune["運勢"] || "不明",
        explanation: chiFortune["説明"] || "",
      },
      {
        name: "外格",
        score: gaiScore,
        description: "対人関係や社会との関わり方を表します",
        fortune: gaiFortune["運勢"] || "不明",
        explanation: gaiFortune["説明"] || "",
      },
      {
        name: "総格",
        score: totalScore,
        description: "人生全体の運勢を総合的に表します",
        fortune: totalFortune["運勢"] || "不明",
        explanation: totalFortune["説明"] || "",
      },
    ],
    details: [
      { name: "姓の画数", value: `${lastNameCount}画` },
      { name: "名の画数", value: `${firstNameCount}画` },
      { name: "天格", value: `${tenFormat}画` },
      { name: "人格", value: `${jinFormat}画` },
      { name: "地格", value: `${chiFormat}画` },
      { name: "外格", value: `${gaiFormat}画` },
      { name: "総格", value: `${totalFormat}画` },
    ],
    advice: generateAdvice(tenFortune, jinFortune, chiFortune, gaiFortune, totalFortune),
  }

  console.log("分析結果:", {
    lastNameCount,
    firstNameCount,
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat,
    tenFortune,
    jinFortune,
    chiFortune,
    gaiFortune,
    totalFortune,
  })

  return result
}

// カスタムデータを使用した姓名判断の実装
function analyzeNameFortuneWithCustomData(
  lastName: string,
  firstName: string,
  customFortuneData: Record<string, any>,
  gender = "male",
): any {
  return analyzeNameFortuneCustom(lastName, firstName, customFortuneData, gender)
}

// カスタムデータを使用する姓名判断関数
export function analyzeNameFortune(lastName: string, firstName: string, gender = "male") {
  // ブラウザ環境でのみ実行
  if (typeof window === "undefined") {
    throw new Error("この関数はクライアントサイドでのみ使用できます")
  }

  // ローカルストレージからカスタムデータを取得
  let fortuneData: Record<string, any> = {}
  try {
    const savedData = localStorage.getItem("fortuneData")
    if (savedData) {
      fortuneData = JSON.parse(savedData)
    }
  } catch (e) {
    console.error("Failed to parse saved fortune data:", e)
  }

  // カスタムデータが空の場合はエラー
  if (Object.keys(fortuneData).length === 0) {
    throw new Error("吉凶データが見つかりません。データをインポートしてください。")
  }

  // カスタムデータを使用して姓名判断を行う
  const result = analyzeNameFortuneWithCustomData(lastName, firstName, fortuneData, gender)
  tagDataSource(result, DataSource.USER_PROVIDED) // データソースを記録
  return result
}
