import { customFortuneData as defaultFortuneData } from "./fortune-data-custom"
import { getCharStrokeWithContext } from "./name-data-simple"
import { getCharStrokeWithContextServer } from "./stroke-count-server"

const DEBUG_MODE = false // デバッグログ（必要に応じて有効化）

// キャッシュ機能
const strokeCache = new Map<string, number>()
const MAX_CACHE_SIZE = 1000

// キャッシュをクリアする関数
function clearCache() {
  if (strokeCache.size > MAX_CACHE_SIZE) {
    strokeCache.clear()
  }
}

// 基本画数を取得する関数（霊数は含めない）- 統合版
export function getStrokeCount(character: string): number {
  try {
    console.log(`🔍 getStrokeCount呼び出し: "${character}"`)
    
    // 入力値の検証
    if (!character || character.length !== 1) {
      console.warn(`不正な文字です: "${character}"`)
      return 1 // デフォルト値
    }
    
    // キャッシュから取得を試行
    if (strokeCache.has(character)) {
      const cached = strokeCache.get(character)!
      console.log(`  → キャッシュから取得: ${cached}画`)
      return cached
    }
    
    // サーバーサイドではstroke-count-serverを使用、クライアントサイドではname-data-simpleを使用
    // 実行環境に応じて適切な関数を選択
    let result
    try {
      // まずサーバーサイド関数を試行
      if (typeof window === 'undefined') {
        // サーバーサイド
        result = getCharStrokeWithContextServer(character, character, 0)
      } else {
        // クライアントサイド
        result = getCharStrokeWithContext(character, character, 0)
      }
    } catch (error) {
      // フォールバック: サーバーサイド関数を使用
      result = getCharStrokeWithContextServer(character, character, 0)
    }
    console.log(`  → getCharStrokeWithContext結果: ${result.stroke}画 (isDefault: ${result.isDefault})`)
    
    // 結果の検証
    if (typeof result.stroke !== 'number' || result.stroke < 0) {
      console.warn(`❌ 不正な画数です: "${character}" → ${result.stroke} (デフォルト値1を返します)`)
      return 1 // デフォルト値
    }
    
    // キャッシュに保存
    strokeCache.set(character, result.stroke)
    clearCache() // 必要に応じてキャッシュをクリア
    
    return result.stroke
  } catch (error) {
    console.error(`❌ 画数取得エラー: "${character}"`, error)
    return 1 // エラー時のデフォルト値
  }
}

  // 霊数ルールを適用した画数計算（「々」は繰り返し文字として7画）
function calculateStrokesWithReisuu(text: string): { count: number; hasReisuu: boolean } {
  try {
    // 入力値の検証
    if (!text || typeof text !== 'string') {
      console.warn(`不正なテキストです: "${text}"`)
      return { count: 1, hasReisuu: false }
    }
    
  let total = 0
    let hasReisuu = false

    // まず全ての文字の画数を計算（日本語文字を正しく分割するためArray.fromを使用）
    console.log(`🔍 calculateStrokesWithReisuu: "${text}" の画数計算開始`)
    const chars = Array.from(text) // Unicode文字単位で分割
    console.log(`  → 文字分割結果: [${chars.join(', ')}] (${chars.length}文字)`)
    for (const char of chars) {
      const stroke = getStrokeCount(char)
      console.log(`  ${char}: ${stroke}画 (getStrokeCount結果)`)
      total += stroke
    }

    // 一文字姓・一文字名の場合のみ霊数を追加
    if (chars.length === 1) {
      total += 1 // 霊数1画を追加
      hasReisuu = true
      console.log(`  → 一字のため霊数1画を追加: ${total}画`)
    }

    console.log(`✅ calculateStrokesWithReisuu: "${text}" → ${total}画 (hasReisuu: ${hasReisuu})`)

    // 結果の検証
    if (total <= 0) {
      console.warn(`不正な総画数です: "${text}" → ${total}`)
      return { count: 1, hasReisuu: false }
    }

    return { count: total, hasReisuu }
  } catch (error) {
    console.error(`霊数計算エラー: "${text}"`, error)
    return { count: 1, hasReisuu: false }
  }
}

// カスタムデータから吉凶を取得する関数（性別考慮）
function getFortuneFromCustomDataWithGender(
  strokeCount: number,
  customData: Record<string, any> | undefined,
  gender: string
): any {
  if (DEBUG_MODE) {
    console.log(`🔍 getFortuneFromCustomDataWithGender呼び出し:`, {
      strokeCount,
      gender,
      customDataExists: !!customData,
      customDataKeys: customData ? Object.keys(customData).length : 0
    })
  }

  // customDataがundefinedまたはnullの場合はnullを返す
  if (!customData) {
    if (DEBUG_MODE) console.log(`❌ customDataが設定されていません`)
    return null
  }

  const key = strokeCount.toString()
  const data = customData[key]

  if (DEBUG_MODE) {
    console.log(`🔍 取得データ:`, {
      key,
      data,
      dataExists: !!data
    })
  }

  if (!data) {
    if (DEBUG_MODE) console.log(`❌ 画数${strokeCount}のデータが見つかりません`)
    return null
  }

  // 性別に応じたデータを取得
  const genderData = data[gender] || data["male"] || data
  if (DEBUG_MODE) console.log(`✅ 性別${gender}のデータを取得:`, genderData)

  return genderData
}

// 姓名判断のメイン関数
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>,
): any {
  if (DEBUG_MODE) {
    console.log(`🔍 analyzeNameFortune呼び出し:`, {
      lastName,
      firstName,
      gender,
      customDataExists: !!customFortuneData
    })
  }
  // 入力の正規化（undefined/非文字列/空白を防御）
  lastName = (typeof lastName === 'string' ? lastName : '').trim()
  firstName = (typeof firstName === 'string' ? firstName : '').trim()

  // 霊数ルールを適用した画数計算
  const lastNameResult = calculateStrokesWithReisuu(lastName)
  const firstNameResult = calculateStrokesWithReisuu(firstName)

  const lastNameCount = lastNameResult.count
  const firstNameCount = firstNameResult.count

  if (DEBUG_MODE) {
    console.log(`📊 画数計算結果:`, {
      lastName: `${lastName} → ${lastNameCount}画`,
      firstName: `${firstName} → ${firstNameCount}画`,
      lastNameHasReisuu: lastNameResult.hasReisuu,
      firstNameHasReisuu: firstNameResult.hasReisuu
    })
  }

  // 五格の計算（正しいロジック）
  const tenFormat = lastNameCount  // 天格：姓の画数の合計
  const chiFormat = firstNameCount  // 地格：名の画数の合計
  
  // 人格：姓の最後の文字 + 名の最初の文字（防御）
  const lastNameChars = Array.from(lastName) // Unicode文字単位で分割
  const firstNameChars = Array.from(firstName) // Unicode文字単位で分割
  const lastNameLastChar = lastNameChars.length > 0 ? lastNameChars[lastNameChars.length - 1] : ''
  const firstNameFirstChar = firstNameChars.length > 0 ? firstNameChars[0] : ''
  const lastCharStroke = lastNameLastChar ? getStrokeCount(lastNameLastChar) : 1
  const firstCharStroke = firstNameFirstChar ? getStrokeCount(firstNameFirstChar) : 1
  const jinFormat = lastCharStroke + firstCharStroke

  console.log(`🔍 人格計算: 姓の最後"${lastNameLastChar || '（なし）'}"(${lastCharStroke}画) + 名の最初"${firstNameFirstChar || '（なし）'}"(${firstCharStroke}画) = ${jinFormat}画`)

  // 総格：姓と名の基本画数の合計（霊数は含めない）
  // 天格・地格ではなく、文字の基本画数を直接計算
  // lastNameCharsとfirstNameCharsは既に上で宣言済み
  let totalFormat = 0
  console.log(`🔍 総格計算開始:`, { lastName, firstName })
  
  for (const char of lastNameChars) {
    const stroke = getStrokeCount(char)
    totalFormat += stroke
    console.log(`  姓の${char}: ${stroke}画`)
  }
  
  for (const char of firstNameChars) {
    const stroke = getStrokeCount(char)
    totalFormat += stroke
    console.log(`  名の${char}: ${stroke}画`)
  }
  
  console.log(`✅ 総格計算結果: ${totalFormat}画`)
  
  // 外格の計算（正しいロジック）
  let gaiFormat
  console.log(`🔍 外格計算開始: 姓${lastName.length}文字, 名${firstName.length}文字`)
  
  if (lastNameChars.length === 1 && firstNameChars.length === 1) {
    // 一字姓・一字名の場合：外格 = 霊数 + 霊数 = 2画
    gaiFormat = 2
    console.log(`🔍 外格計算: 一字姓・一字名 → 霊数1画 + 霊数1画 = ${gaiFormat}画`)
  } else if (lastNameChars.length === 1 && firstNameChars.length > 1) {
    // 一字姓・複数字名の場合：外格 = 霊数 + 名の最後の文字
    const lastCharOfFirstName = firstNameChars[firstNameChars.length - 1]
    const lastCharStroke = getStrokeCount(lastCharOfFirstName)
    gaiFormat = 1 + lastCharStroke
    console.log(`🔍 外格計算: 一字姓・複数字名 → 霊数1画 + 名の最後「${lastCharOfFirstName}」${lastCharStroke}画 = ${gaiFormat}画`)
  } else if (lastNameChars.length > 1 && firstNameChars.length === 1) {
    // 複数字姓・一字名の場合：外格 = 姓の最初の文字 + 霊数
    const firstCharOfLastName = lastNameChars[0]
    const firstCharStroke = getStrokeCount(firstCharOfLastName)
    gaiFormat = firstCharStroke + 1
    console.log(`🔍 外格計算: 複数字姓・一字名 → 姓の最初「${firstCharOfLastName}」${firstCharStroke}画 + 霊数1画 = ${gaiFormat}画`)
  } else {
    // 通常の場合（複数字姓・複数字名）：外格 = 天格 + 地格 - 人格
    gaiFormat = tenFormat + chiFormat - jinFormat
    console.log(`🔍 外格計算: 通常 → 天格${tenFormat}画 + 地格${chiFormat}画 - 人格${jinFormat}画 = ${gaiFormat}画`)
  }

  console.log(`📊 五格計算結果:`, {
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat
  })

  // カスタムデータを使用するかどうか（パラメータが渡されていない場合はインポートしたデフォルトデータを使用）
  const fortuneData = customFortuneData || defaultFortuneData

  // 各格の運勢を取得
  const tenFortune = getFortuneFromCustomDataWithGender(tenFormat, fortuneData, gender)
  const jinFortune = getFortuneFromCustomDataWithGender(jinFormat, fortuneData, gender)
  const chiFortune = getFortuneFromCustomDataWithGender(chiFormat, fortuneData, gender)
  const gaiFortune = getFortuneFromCustomDataWithGender(gaiFormat, fortuneData, gender)
  const totalFortune = getFortuneFromCustomDataWithGender(totalFormat, fortuneData, gender)

  // スコア計算関数（運勢からスコアを計算）
  const calculateScore = (fortune: any): number => {
    if (!fortune || !fortune.運勢) return 50
    switch (fortune.運勢) {
      case "大吉":
        return 100
      case "中吉":
        return 80
      case "吉":
        return 60
      case "凶":
        return 40
      case "中凶":
        return 20
      case "大凶":
        return 0
      default:
        return 50
    }
  }

  // 各格のスコアを計算
  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  // categories配列を生成（UIコンポーネント用）
  const categories = [
    {
      name: "天格",
      strokeCount: tenFormat,
      fortune: tenFortune?.運勢 || "不明",
      score: tenScore,
      description: tenFortune?.説明 || "天格の説明がありません",
      explanation: tenFortune?.詳細 || ""
    },
    {
      name: "人格", 
      strokeCount: jinFormat,
      fortune: jinFortune?.運勢 || "不明",
      score: jinScore,
      description: jinFortune?.説明 || "人格の説明がありません",
      explanation: jinFortune?.詳細 || ""
    },
    {
      name: "地格",
      strokeCount: chiFormat, 
      fortune: chiFortune?.運勢 || "不明",
      score: chiScore,
      description: chiFortune?.説明 || "地格の説明がありません",
      explanation: chiFortune?.詳細 || ""
    },
    {
      name: "外格",
      strokeCount: gaiFormat,
      fortune: gaiFortune?.運勢 || "不明", 
      score: gaiScore,
      description: gaiFortune?.説明 || "外格の説明がありません",
      explanation: gaiFortune?.詳細 || ""
    },
    {
      name: "総格",
      strokeCount: totalFormat,
      fortune: totalFortune?.運勢 || "不明",
      score: totalScore, 
      description: totalFortune?.説明 || "総格の説明がありません",
      explanation: totalFortune?.詳細 || ""
    }
  ]

  // 文字別詳細情報
  const characterDetails = []

  // 姓の文字別情報
  for (let i = 0; i < lastName.length; i++) {
    const char = lastName[i]
    const stroke = getStrokeCount(char)
    characterDetails.push({
      name: "姓",
      character: char,
      strokes: stroke,
      isDefault: false, // getStrokeCountは常にfalse
      isReisuu: lastNameResult.hasReisuu && i === 0
    })
  }

  // 名の文字別情報
  for (let i = 0; i < firstName.length; i++) {
    const char = firstName[i]
    const stroke = getStrokeCount(char)
    characterDetails.push({
      name: "名",
      character: char,
      strokes: stroke,
      isDefault: false, // getStrokeCountは常にfalse
      isReisuu: firstNameResult.hasReisuu && i === firstName.length - 1
    })
  }

  // 総合スコアを計算（各格のスコアから）
  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

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
    },
    totalScore: overallScore, // 総合スコアを追加
  }

  console.log(`✅ 姓名判断完了:`, {
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat,
    totalScore: overallScore,
    categories: categories.map((c: any) => ({
      name: c.name,
      strokeCount: c.strokeCount,
      fortune: c.fortune,
    })),
  })
  return result
}