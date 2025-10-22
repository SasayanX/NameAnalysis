// JSXの安全なレンダリングのためのユーティリティ
export class SafeJSXRenderer {
  // 特殊文字を安全にエスケープ
  static escapeSpecialChars(text: string): string {
    if (typeof text !== "string") return String(text)

    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/&/g, "&amp;")
  }

  // JSX内で安全に使用できる文字列を生成
  static safeString(text: string): string {
    if (typeof text !== "string") return String(text)

    // 特殊文字が含まれている場合は文字列リテラルとして返す
    if (/[<>{}"`']/.test(text)) {
      return `{'${text.replace(/'/g, "\\'")}'}`
    }

    return text
  }

  // 数値の安全な表示
  static safeNumber(num: number | string): string {
    const numValue = typeof num === "string" ? Number.parseFloat(num) : num
    return isNaN(numValue) ? "0" : String(numValue)
  }

  // 配列の安全な結合
  static safeJoin(arr: any[], separator = ", "): string {
    if (!Array.isArray(arr)) return ""
    return arr
      .filter((item) => item != null)
      .map(String)
      .join(separator)
  }
}

// JSX内で使用する安全な文字列生成関数
export function jsx(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings[0]

  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const safeValue = typeof value === "string" ? SafeJSXRenderer.safeString(value) : String(value)

    result += safeValue + strings[i + 1]
  }

  return result
}
