// パフォーマンス最適化ユーティリティ

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private calculationCache = new Map<string, any>()
  private maxCacheSize = 100
  private performanceMetrics = new Map<string, number[]>()

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // 計算結果のキャッシュ（LRU方式）
  cacheResult(key: string, result: any): void {
    if (this.calculationCache.size >= this.maxCacheSize) {
      // 最も古いエントリを削除
      const firstKey = this.calculationCache.keys().next().value
      this.calculationCache.delete(firstKey)
    }
    this.calculationCache.set(key, {
      result,
      timestamp: Date.now(),
    })
  }

  getCachedResult(key: string): any | null {
    const cached = this.calculationCache.get(key)
    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5分間有効
      return cached.result
    }
    this.calculationCache.delete(key)
    return null
  }

  // パフォーマンス測定
  measurePerformance<T>(label: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const duration = end - start

    if (!this.performanceMetrics.has(label)) {
      this.performanceMetrics.set(label, [])
    }
    this.performanceMetrics.get(label)!.push(duration)

    // 遅い処理を警告
    if (duration > 100) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`)
    }

    return result
  }

  // メモリクリーンアップ
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.calculationCache.entries()) {
      if (now - value.timestamp > 300000) {
        this.calculationCache.delete(key)
      }
    }
  }

  // パフォーマンス統計
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    for (const [label, times] of this.performanceMetrics.entries()) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const max = Math.max(...times)
      stats[label] = {
        avg: avg.toFixed(2),
        max: max.toFixed(2),
        count: times.length,
      }
    }
    return {
      cacheSize: this.calculationCache.size,
      operations: stats,
    }
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance()

// 定期的なクリーンアップ
if (typeof window !== "undefined") {
  setInterval(() => {
    performanceOptimizer.cleanup()
  }, 60000) // 1分ごと
}
