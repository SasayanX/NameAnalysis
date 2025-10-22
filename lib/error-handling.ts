// エラーハンドリングの統一
export class AnalysisError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "AnalysisError"
  }
}

export class ValidationError extends AnalysisError {
  constructor(message: string, field?: string) {
    super("VALIDATION_ERROR", message, { field })
  }
}

export class DataError extends AnalysisError {
  constructor(message: string, data?: any) {
    super("DATA_ERROR", message, { data })
  }
}

export class CalculationError extends AnalysisError {
  constructor(message: string, calculation?: string) {
    super("CALCULATION_ERROR", message, { calculation })
  }
}

// エラーハンドリングのヘルパー関数
export function handleError(error: unknown): AnalysisError {
  if (error instanceof AnalysisError) {
    return error
  }

  if (error instanceof Error) {
    return new AnalysisError("UNKNOWN_ERROR", error.message)
  }

  return new AnalysisError("UNKNOWN_ERROR", "An unknown error occurred")
}

// ログ機能
export function logError(error: AnalysisError, context?: string) {
  console.error(`[${error.code}] ${context || "Error"}:`, error.message, error.details)
}
