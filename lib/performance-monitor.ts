// パフォーマンス監視とメモリ最適化
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private memoryUsage: number[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 処理時間を測定
  measureTime<T>(label: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const duration = end - start

    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)

    // 開発環境でのみログ出力
    if (process.env.NODE_ENV === "development" && duration > 10) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`)
    }

    return result
  }

  // メモリ使用量を記録
  recordMemoryUsage(): void {
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory
      this.memoryUsage.push(memory.usedJSHeapSize)

      // 最新の100件のみ保持
      if (this.memoryUsage.length > 100) {
        this.memoryUsage = this.memoryUsage.slice(-100)
      }
    }
  }

  // 統計情報を取得
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    for (const [label, times] of this.metrics.entries()) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const max = Math.max(...times)
      const min = Math.min(...times)

      stats[label] = { avg: avg.toFixed(2), max: max.toFixed(2), min: min.toFixed(2), count: times.length }
    }

    return stats
  }

  // メトリクスをクリア
  clear(): void {
    this.metrics.clear()
    this.memoryUsage = []
  }
}

// グローバルインスタンス
export const performanceMonitor = PerformanceMonitor.getInstance()

// 使用例のヘルパー関数
export function withPerformanceMonitoring<T>(label: string, fn: () => T): T {
  return performanceMonitor.measureTime(label, fn)
}
