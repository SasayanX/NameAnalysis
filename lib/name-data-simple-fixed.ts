import { customFortuneData } from "./fortune-data-custom"
import { getCharStrokeWithContext } from "./name-data-simple"

const DEBUG_MODE = true

// 基本画数を取得する関数（霊数は含めない）
export function getStrokeCount(character: string): number {
  // 「々」の場合は7画を返す
  if (character === "々") {
    return 7
  }
  
  // 既存のstrokeCountDataから基本画数を取得
  const result = getCharStrokeWithContext(character, character, 0)
  
  // 霊数が含まれている可能性があるので、基本画数を確認
  // 一文字の場合は霊数1が加算されている可能性がある
  let basicStroke = result.stroke
  
  // デバッグログ
  console.log(`🔍 getStrokeCount: "${character}" → ${basicStroke}画 (isDefault: ${result.isDefault})`)
  
  return basicStroke
}

// 霊数ルールを適用した画数計算（「々」は繰り返し文字として7画）
function calculateStrokesWithReisuu(text: string): { count: number; hasReisuu: boolean } {
  let total = 0
  let hasReisuu = false

  // まず全ての文字の画数を計算
  for (let i = 0; i < text.length; i++) {
    total += getStrokeCount(text[i])
  }
  
  // 一文字姓・一文字名の場合のみ霊数を追加
  if (text.length === 1) {
    total += 1 // 霊数1画を追加
    hasReisuu = true
  }

  return { count: total, hasReisuu }
}

// カスタムデータから吉凶を取得する関数（性別考慮）
function getFortuneFromCustomDataWithGender(
  strokeCount: number,
  customData: Record<string, any>,
  gender: string
): any {
  console.log(`🔍 getFortuneFromCustomDataWithGender呼び出し:`, {
    strokeCount,
    gender,
    customDataExists: !!customData,
    customDataKeys: customData ? Object.keys(customData).length : 0
  })

  const key = strokeCount.toString()
  const data = customData[key]

  console.log(`🔍 取得データ:`, {
    key,
    data,
    dataExists: !!data
  })

  if (!data) {
    console.log(`❌ 画数${strokeCount}のデータが見つかりません`)
    return null
  }

  // 性別に応じたデータを取得
  const genderData = data[gender] || data["male"] || data
  console.log(`✅ 性別${gender}のデータを取得:`, genderData)

  return genderData
}

// 姓名判断のメイン関数
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>,
): any {
  console.log(`🔍 analyzeNameFortune呼び出し:`, {
    lastName,
    firstName,
    gender,
    customDataExists: !!customFortuneData
  })

  // 霊数ルールを適用した画数計算
  const lastNameResult = calculateStrokesWithReisuu(lastName)
  const firstNameResult = calculateStrokesWithReisuu(firstName)

  const lastNameCount = lastNameResult.count
  const firstNameCount = firstNameResult.count

  console.log(`📊 画数計算結果:`, {
    lastName: `${lastName} → ${lastNameCount}画`,
    firstName: `${firstName} → ${firstNameCount}画`,
    lastNameHasReisuu: lastNameResult.hasReisuu,
    firstNameHasReisuu: firstNameResult.hasReisuu
  })

  // 五格の計算（正しいロジック）
  const tenFormat = lastNameCount  // 天格：姓の画数の合計
  const chiFormat = firstNameCount  // 地格：名の画数の合計
  
  // 人格：姓の最後の文字 + 名の最初の文字
  const lastCharStroke = getStrokeCount(lastName[lastName.length - 1])
  const firstCharStroke = firstName.length > 0 ? getStrokeCount(firstName[0]) : 1
  const jinFormat = lastCharStroke + firstCharStroke

  // 総格：姓と名の基本画数の合計（霊数は含めない）
  // 天格・地格ではなく、文字の基本画数を直接計算
  let totalFormat = 0
  console.log(`🔍 総格計算開始:`, { lastName, firstName })
  
  for (let i = 0; i < lastName.length; i++) {
    const char = lastName[i]
    const stroke = getStrokeCount(char)
    totalFormat += stroke
    console.log(`  ${char}: ${stroke}画`)
  }
  
  for (let i = 0; i < firstName.length; i++) {
    const char = firstName[i]
    const stroke = getStrokeCount(char)
    totalFormat += stroke
    console.log(`  ${char}: ${stroke}画`)
  }
  
  console.log(`✅ 総格計算結果: ${totalFormat}画`)
  
  // 外格：総格 - 人格
  const gaiFormat = totalFormat - jinFormat

  console.log(`📊 五格計算結果:`, {
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat
  })

  // カスタムデータを使用するかどうか
  const fortuneData = customFortuneData || customFortuneData

  // 各格の運勢を取得
  const tenFortune = getFortuneFromCustomDataWithGender(tenFormat, fortuneData, gender)
  const jinFortune = getFortuneFromCustomDataWithGender(jinFormat, fortuneData, gender)
  const chiFortune = getFortuneFromCustomDataWithGender(chiFormat, fortuneData, gender)
  const gaiFortune = getFortuneFromCustomDataWithGender(gaiFormat, fortuneData, gender)
  const totalFortune = getFortuneFromCustomDataWithGender(totalFormat, fortuneData, gender)

  // categories配列を生成（UIコンポーネント用）
  const categories = [
    {
      name: "天格",
      strokeCount: tenFormat,
      fortune: tenFortune?.運勢 || "不明",
      score: tenFortune?.点数 || 0,
      description: tenFortune?.説明 || "天格の説明がありません",
      explanation: tenFortune?.詳細 || ""
    },
    {
      name: "人格", 
      strokeCount: jinFormat,
      fortune: jinFortune?.運勢 || "不明",
      score: jinFortune?.点数 || 0,
      description: jinFortune?.説明 || "人格の説明がありません",
      explanation: jinFortune?.詳細 || ""
    },
    {
      name: "地格",
      strokeCount: chiFormat, 
      fortune: chiFortune?.運勢 || "不明",
      score: chiFortune?.点数 || 0,
      description: chiFortune?.説明 || "地格の説明がありません",
      explanation: chiFortune?.詳細 || ""
    },
    {
      name: "外格",
      strokeCount: gaiFormat,
      fortune: gaiFortune?.運勢 || "不明", 
      score: gaiFortune?.点数 || 0,
      description: gaiFortune?.説明 || "外格の説明がありません",
      explanation: gaiFortune?.詳細 || ""
    },
    {
      name: "総格",
      strokeCount: totalFormat,
      fortune: totalFortune?.運勢 || "不明",
      score: totalFortune?.点数 || 0, 
      description: totalFortune?.説明 || "総格の説明がありません",
      explanation: totalFortune?.詳細 || ""
    }
  ]

  // 文字別詳細情報
  const characterDetails = []

  // 姓の文字別情報
  for (let i = 0; i < lastName.length; i++) {
    const char = lastName[i]
    const result = getCharStrokeWithContext(char, lastName, i)
    characterDetails.push({
      name: "姓",
      character: char,
      strokes: result.stroke,
      isDefault: result.isDefault,
      isReisuu: lastNameResult.hasReisuu && i === 0
    })
  }

  // 名の文字別情報
  for (let i = 0; i < firstName.length; i++) {
    const char = firstName[i]
    const result = getCharStrokeWithContext(char, firstName, i)
    characterDetails.push({
      name: "名",
      character: char,
      strokes: result.stroke,
      isDefault: result.isDefault,
      isReisuu: firstNameResult.hasReisuu && i === firstName.length - 1
    })
  }

  const result = {
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
    categories, // UIコンポーネント用のcategories配列を追加
    characterDetails,
    reisuuInfo: {
      hasReisuuInLastName: lastNameResult.hasReisuu,
      hasReisuuInFirstName: firstNameResult.hasReisuu
    }
  }

  console.log(`✅ 姓名判断完了:`, result)
  return result
}