// 陰陽配列の詳細分析ロジック

// 陰陽配列のパターンを判定する関数
export function analyzeInyoPattern(inyoArray: Array<"陽" | "陰">): {
  pattern: string
  judgment: "大吉" | "吉" | "中吉" | "普通" | "凶" | "大凶"
  score: number
  description: string
  isAlternating: boolean
  hasBadPattern: boolean
  patternDetails: string[]
} {
  const length = inyoArray.length
  let score = 50 // 基本点
  let judgment: "大吉" | "吉" | "中吉" | "普通" | "凶" | "大凶" = "普通"
  let description = ""
  const patternDetails: string[] = []

  // 配列を文字列に変換（○=陽、●=陰）
  const patternString = inyoArray.map((inyo) => (inyo === "陽" ? "○" : "●")).join("")

  // 交互配列かどうかをチェック
  let isAlternating = true
  for (let i = 1; i < length; i++) {
    if (inyoArray[i] === inyoArray[i - 1]) {
      isAlternating = false
      break
    }
  }

  // 大凶配列のパターンをチェック
  const badPatterns = [
    "○●●○",
    "●○○●", // 4文字の大凶パターン
    "○●●●○",
    "●○○○●", // 5文字の大凶パターン
    "○○●●○○",
    "●●○○●●", // 6文字の大凶パターン
  ]

  const hasBadPattern = badPatterns.some((pattern) => patternString.includes(pattern))

  // 連続する陰陽の数をカウント
  let maxConsecutive = 1
  let currentConsecutive = 1
  for (let i = 1; i < length; i++) {
    if (inyoArray[i] === inyoArray[i - 1]) {
      currentConsecutive++
    } else {
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      currentConsecutive = 1
    }
  }
  maxConsecutive = Math.max(maxConsecutive, currentConsecutive)

  // 姓と名の境界での陰陽関係をチェック（4文字以上の場合）
  let surnameLastInyo = ""
  let givenFirstInyo = ""
  if (length >= 4) {
    // 一般的に姓2文字、名2文字と仮定
    const surnameLength = Math.floor(length / 2)
    surnameLastInyo = inyoArray[surnameLength - 1]
    givenFirstInyo = inyoArray[surnameLength]
  }

  // 判定ロジック
  if (hasBadPattern) {
    score = 10
    judgment = "大凶"
    description = "大凶配列パターンが含まれています。運勢に大きな制約が生じる可能性があります。"
    patternDetails.push("大凶配列パターンを検出")
  } else if (isAlternating) {
    score = 100
    judgment = "大吉"
    description = "完璧な交互配列です。陰陽のバランスが最高で、運勢が強く発揮されます。"
    patternDetails.push("完璧な交互配列")
  } else if (maxConsecutive >= 4) {
    score = 20
    judgment = "大凶"
    description = "同じ陰陽が4つ以上連続しており、バランスが大きく崩れています。"
    patternDetails.push(`${maxConsecutive}連続の同一陰陽`)
  } else if (maxConsecutive === 3) {
    score = 30
    judgment = "凶"
    description = "同じ陰陽が3つ連続しており、バランスが崩れています。"
    patternDetails.push("3連続の同一陰陽")
  } else if (maxConsecutive === 2) {
    // 2連続の場合は他の要素も考慮
    if (surnameLastInyo && givenFirstInyo && surnameLastInyo !== givenFirstInyo) {
      score = 75
      judgment = "吉"
      description = "2連続はありますが、姓と名の境界で陰陽が変わっており、比較的良好です。"
      patternDetails.push("姓名境界で陰陽変化")
    } else {
      score = 60
      judgment = "中吉"
      description = "2連続の陰陽がありますが、許容範囲内です。"
      patternDetails.push("2連続の同一陰陽")
    }
  }

  // 全て同じ陰陽の場合
  const allSame = inyoArray.every((inyo) => inyo === inyoArray[0])
  if (allSame) {
    score = 5
    judgment = "大凶"
    description = "全て同じ陰陽で、極めて不安定な配列です。"
    patternDetails.push("全て同一陰陽")
  }

  return {
    pattern: patternString,
    judgment,
    score,
    description,
    isAlternating,
    hasBadPattern,
    patternDetails,
  }
}

// 陰陽配列の詳細情報を取得する関数
export function getInyoDetailedAnalysis(
  lastName: string,
  firstName: string,
  inyoArray: Array<"陽" | "陰">,
): {
  analysis: ReturnType<typeof analyzeInyoPattern>
  surnamePattern: string
  givenPattern: string
  boundaryAnalysis: string
} {
  const analysis = analyzeInyoPattern(inyoArray)

  // 姓と名の長さを推定
  const totalLength = lastName.length + firstName.length
  const surnameLength = lastName.length

  const surnameInyo = inyoArray.slice(0, surnameLength)
  const givenInyo = inyoArray.slice(surnameLength)

  const surnamePattern = surnameInyo.map((inyo) => (inyo === "陽" ? "○" : "●")).join("")
  const givenPattern = givenInyo.map((inyo) => (inyo === "陽" ? "○" : "●")).join("")

  // 姓名境界の分析
  let boundaryAnalysis = ""
  if (surnameLength > 0 && givenInyo.length > 0) {
    const lastSurnameInyo = surnameInyo[surnameInyo.length - 1]
    const firstGivenInyo = givenInyo[0]

    if (lastSurnameInyo !== firstGivenInyo) {
      boundaryAnalysis = "姓の最後と名の最初で陰陽が変化しており、良好です。"
    } else {
      boundaryAnalysis = "姓の最後と名の最初が同じ陰陽で、やや単調です。"
    }
  }

  return {
    analysis,
    surnamePattern,
    givenPattern,
    boundaryAnalysis,
  }
}
