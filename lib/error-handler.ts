export class ComponentError extends Error {
  constructor(
    message: string,
    public component: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = "ComponentError"
  }
}

export function safeExecute<T>(fn: () => T, fallback: T, errorMessage?: string): T {
  try {
    return fn()
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error)
    }
    return fallback
  }
}

export function safeParseStarPerson(starPerson: string | undefined, fallback = "木星人-"): string {
  return safeExecute(
    () => {
      if (!starPerson || typeof starPerson !== "string") {
        return fallback
      }
      return starPerson
    },
    fallback,
    `Failed to parse star person: ${starPerson}`,
  )
}

// 新しいユーティリティ関数を追加
export function validateProps<T>(props: T, requiredFields: (keyof T)[]): boolean {
  return requiredFields.every((field) => props[field] !== undefined && props[field] !== null)
}

export function safeStringify(obj: any, fallback = "{}"): string {
  return safeExecute(() => JSON.stringify(obj), fallback, "Failed to stringify object")
}
