import { safeExecute } from "./error-handler"

// 安全な配列操作
export function safeMap<T, U>(
  array: T[] | undefined | null,
  mapFn: (item: T, index: number) => U,
  fallback: U[] = [],
): U[] {
  return safeExecute(
    () => {
      if (!Array.isArray(array)) return fallback
      return array.map(mapFn)
    },
    fallback,
    "Failed to map array",
  )
}

// 安全なオブジェクトアクセス
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  return safeExecute(
    () => {
      const keys = path.split(".")
      let result = obj
      for (const key of keys) {
        if (result == null) return fallback
        result = result[key]
      }
      return result ?? fallback
    },
    fallback,
    `Failed to get property: ${path}`,
  )
}

// 安全なクラス名生成
export function safeClassName(...classes: (string | undefined | null | false)[]): string {
  return safeExecute(() => classes.filter(Boolean).join(" "), "", "Failed to generate className")
}
