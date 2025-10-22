// エラー回復とフォールバック機能
export class ErrorRecovery {
  private static instance: ErrorRecovery
  private errorCount: Map<string, number> = new Map()
  private maxRetries = 3

  static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery()
    }
    return ErrorRecovery.instance
  }

  // エラー回復付きの関数実行
  async executeWithRecovery<T>(
    operation: () => T | Promise<T>,
    fallback: () => T | Promise<T>,
    operationName: string,
  ): Promise<T> {
    const errorKey = `error_${operationName}`
    const currentErrors = this.errorCount.get(errorKey) || 0

    try {
      const result = await operation()
      // 成功時はエラーカウントをリセット
      this.errorCount.delete(errorKey)
      return result
    } catch (error) {
      console.error(`Error in ${operationName}:`, error)

      // エラーカウントを増加
      this.errorCount.set(errorKey, currentErrors + 1)

      // 最大リトライ回数を超えた場合はフォールバックを実行
      if (currentErrors >= this.maxRetries) {
        console.warn(`Max retries exceeded for ${operationName}, using fallback`)
        return await fallback()
      }

      // リトライ
      return this.executeWithRecovery(operation, fallback, operationName)
    }
  }

  // エラー統計を取得
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const [key, count] of this.errorCount.entries()) {
      stats[key] = count
    }
    return stats
  }

  // エラーカウントをリセット
  reset(): void {
    this.errorCount.clear()
  }
}

// グローバルインスタンス
export const errorRecovery = ErrorRecovery.getInstance()
