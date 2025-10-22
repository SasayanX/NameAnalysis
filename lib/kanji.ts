import { strokeCountData } from "@/lib/name-data-simple"

/**
 * 文字の画数を取得する基本関数
 */
export function getCharStroke(char: string): number {
  if (!char || char.length !== 1) {
    return 1 // デフォルト値
  }

  return strokeCountData[char] || 1
}

/**
 * コンテキスト付きで文字の画数を取得する関数
 */
export function getCharStrokeWithContext(
  char: string,
  fullName: string,
  position: number,
): { stroke: number; isDefault: boolean } {
  if (!char || char.length !== 1) {
    return { stroke: 1, isDefault: true }
  }

  const stroke = strokeCountData[char]

  if (stroke !== undefined) {
    return { stroke, isDefault: false }
  }

  // デフォルト値を返す
  return { stroke: 1, isDefault: true }
}

/**
 * 複数文字の画数を一括取得
 */
export function getMultipleCharStrokes(chars: string[]): number[] {
  return chars.map((char) => getCharStroke(char))
}

/**
 * 文字が登録されているかチェック
 */
export function isCharRegistered(char: string): boolean {
  return strokeCountData[char] !== undefined
}
