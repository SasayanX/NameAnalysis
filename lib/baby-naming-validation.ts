// 赤ちゃん名付け入力検証ライブラリ
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export function validateNamingInput(lastName: string, gender: "male" | "female"): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 必須項目チェック
  if (!lastName || lastName.trim().length === 0) {
    errors.push("苗字を入力してください")
  }

  // 苗字の長さチェック
  if (lastName && lastName.trim().length > 10) {
    errors.push("苗字が長すぎます（10文字以内で入力してください）")
  }

  // 苗字の文字種チェック
  if (lastName && lastName.trim().length > 0) {
    const invalidChars = lastName.match(/[^ぁ-んァ-ヶー一-龯々〆〤]/g)
    if (invalidChars) {
      errors.push(`使用できない文字が含まれています: ${invalidChars.join(", ")}`)
    }
  }

  // 苗字の一般的でない文字チェック
  if (lastName && lastName.includes("々")) {
    if (lastName.indexOf("々") === 0) {
      errors.push("「々」は苗字の最初には使用できません")
    }
  }

  // 警告とアドバイス
  if (lastName && lastName.trim().length === 1) {
    warnings.push("一文字の苗字は珍しいため、名前とのバランスを考慮します")
  }

  if (lastName && lastName.trim().length >= 4) {
    warnings.push("長い苗字のため、名前は短めの候補を優先します")
  }

  // 提案
  if (errors.length === 0) {
    suggestions.push("より良い結果を得るために、季節の好みや読み方の好みを設定できます")
    suggestions.push("生成された名前は必ず声に出して読んでみることをおすすめします")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

export function validatePreferences(preferences: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // 好みの読み方チェック
  if (preferences.preferredReadings && preferences.preferredReadings.length > 0) {
    for (const reading of preferences.preferredReadings) {
      if (reading.length > 10) {
        warnings.push(`読み方「${reading}」が長すぎます`)
      }
      const invalidChars = reading.match(/[^ぁ-んー]/g)
      if (invalidChars) {
        errors.push(`読み方「${reading}」に使用できない文字が含まれています`)
      }
    }
  }

  // 避けたい読み方チェック
  if (preferences.avoidReadings && preferences.avoidReadings.length > 0) {
    for (const reading of preferences.avoidReadings) {
      if (reading.length > 10) {
        warnings.push(`避けたい読み方「${reading}」が長すぎます`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}
