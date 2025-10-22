// 計算処理の安全化
import { CalculationError, ValidationError } from "./error-handling"
import { validateStrokeCount } from "./validation"
import { strokeCountData } from "./name-data-simple"

// 安全な画数取得
export function safeGetCharStroke(char: string, context?: string): number {
  try {
    if (!char || char.length !== 1) {
      throw new ValidationError(`不正な文字です: "${char}"`)
    }

    const stroke = strokeCountData[char]
    if (stroke === undefined) {
      console.warn(`画数データが見つかりません: "${char}" (${context || "unknown context"})`)

      // 文字種別に応じたデフォルト値
      if (/[a-zA-Z]/.test(char)) return 1
      if (/[0-9]/.test(char)) return 1
      if (/[\u3040-\u309F]/.test(char)) return 3 // ひらがな
      if (/[\u30A0-\u30FF]/.test(char)) return 3 // カタカナ
      if (/[\u4E00-\u9FAF]/.test(char)) return 10 // 漢字

      return 1 // その他
    }

    return validateStrokeCount(stroke, `文字"${char}"`)
  } catch (error) {
    throw new CalculationError(`画数取得エラー: ${char}`, context)
  }
}

// 安全な画数計算（「々」対応）
export function safeCalculateNameStrokes(name: string): number {
  try {
    if (!name || typeof name !== "string") {
      throw new ValidationError("名前が不正です")
    }

    let total = 0
    const chars = Array.from(name.trim())

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]

      if (char === "々") {
        // 々は直前の漢字の画数と同じ
        if (i > 0) {
          const prevChar = chars[i - 1]
          const prevStroke = safeGetCharStroke(prevChar, `${name}の${i}文字目`)
          total += prevStroke
        } else {
          total += 3 // デフォルト値
        }
      } else {
        const stroke = safeGetCharStroke(char, `${name}の${i + 1}文字目`)
        total += stroke
      }
    }

    return validateStrokeCount(total, `名前"${name}"の総画数`)
  } catch (error) {
    throw new CalculationError(`名前の画数計算エラー: ${name}`)
  }
}

// 安全な格計算
export function safeCalculateFormats(
  lastNameStrokes: number[],
  firstNameStrokes: number[],
  hasReisuuInLastName: boolean,
  hasReisuuInFirstName: boolean,
): {
  tenFormat: number
  jinFormat: number
  chiFormat: number
  gaiFormat: number
  totalFormat: number
} {
  try {
    // 基本検証
    if (!Array.isArray(lastNameStrokes) || !Array.isArray(firstNameStrokes)) {
      throw new ValidationError("画数配列が不正です")
    }

    if (lastNameStrokes.length === 0 || firstNameStrokes.length === 0) {
      throw new ValidationError("画数配列が空です")
    }

    // 各画数の検証
    lastNameStrokes.forEach((stroke, i) => validateStrokeCount(stroke, `姓の${i + 1}文字目`))
    firstNameStrokes.forEach((stroke, i) => validateStrokeCount(stroke, `名の${i + 1}文字目`))

    // 天格・地格の計算
    const tenFormat = lastNameStrokes.reduce((sum, stroke) => sum + stroke, 0)
    const chiFormat = firstNameStrokes.reduce((sum, stroke) => sum + stroke, 0)

    // 人格の計算（霊数除外）
    const lastCharStroke = hasReisuuInLastName
      ? lastNameStrokes[lastNameStrokes.length - 1]
      : lastNameStrokes[lastNameStrokes.length - 1]
    const firstCharStroke = hasReisuuInFirstName ? firstNameStrokes[0] : firstNameStrokes[0]

    const jinFormat = lastCharStroke + firstCharStroke

    // 総格の計算（霊数除外）
    const actualLastNameTotal = hasReisuuInLastName
      ? lastNameStrokes.slice(1).reduce((sum, stroke) => sum + stroke, 0)
      : tenFormat
    const actualFirstNameTotal = hasReisuuInFirstName
      ? firstNameStrokes.slice(0, -1).reduce((sum, stroke) => sum + stroke, 0)
      : chiFormat

    const totalFormat = actualLastNameTotal + actualFirstNameTotal

    // 外格の計算
    let gaiFormat: number

    if (hasReisuuInLastName && hasReisuuInFirstName) {
      gaiFormat = 2 // 霊数 + 霊数
    } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
      gaiFormat = 1 + firstNameStrokes[firstNameStrokes.length - 1]
    } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
      gaiFormat = lastNameStrokes[0] + 1
    } else {
      gaiFormat = tenFormat + chiFormat - jinFormat
    }

    // 外格の最小値チェック
    if (gaiFormat <= 0) {
      gaiFormat = 2
    }

    // 結果の検証
    const results = { tenFormat, jinFormat, chiFormat, gaiFormat, totalFormat }
    Object.entries(results).forEach(([key, value]) => {
      validateStrokeCount(value, key)
    })

    return results
  } catch (error) {
    throw new CalculationError("格の計算でエラーが発生しました")
  }
}
