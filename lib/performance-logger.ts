// 本番環境対応のパフォーマンスロガー

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceLogger {
  private static instance: PerformanceLogger
  private metrics: Map<string, PerformanceMetric> = new Map()
  private completedMetrics: PerformanceMetric[] = []

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger()
    }
    return PerformanceLogger.instance
  }

  // パフォーマンス測定開始
  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    }
    this.metrics.set(name, metric)
  }

  // パフォーマンス測定終了
  end(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Performance metric "${name}" not found`)
      }
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    }

    this.completedMetrics.push(completedMetric)
    this.metrics.delete(name)

    // 本番環境では重要なメトリクスのみログ出力
    if (process.env.NODE_ENV === "production" && duration > 1000) {
      this.logSlowOperation(completedMetric)
    } else if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  // 遅い操作のログ出力
  private logSlowOperation(metric: PerformanceMetric): void {
    const logData = {
      operation: metric.name,
      duration: metric.duration,
      metadata: metric.metadata,
      timestamp: new Date().toISOString()
    }

    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === "production") {
      // TODO: 外部ログサービス（例：Sentry、DataDog）への送信
      console.warn("Slow operation detected:", logData)
    }
  }

  // メトリクス統計の取得
  getStats(): {
    totalOperations: number
    averageDuration: number
    slowOperations: PerformanceMetric[]
    operationBreakdown: Record<string, { count: number; avgDuration: number }>
  } {
    const totalOperations = this.completedMetrics.length
    const totalDuration = this.completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0

    const slowOperations = this.completedMetrics.filter(m => (m.duration || 0) > 1000)

    const operationBreakdown: Record<string, { count: number; avgDuration: number }> = {}
    this.completedMetrics.forEach(metric => {
      if (!operationBreakdown[metric.name]) {
        operationBreakdown[metric.name] = { count: 0, avgDuration: 0 }
      }
      operationBreakdown[metric.name].count++
      operationBreakdown[metric.name].avgDuration += metric.duration || 0
    })

    // 平均値を計算
    Object.keys(operationBreakdown).forEach(name => {
      const breakdown = operationBreakdown[name]
      breakdown.avgDuration = breakdown.avgDuration / breakdown.count
    })

    return {
      totalOperations,
      averageDuration,
      slowOperations,
      operationBreakdown
    }
  }

  // メトリクスのクリア
  clear(): void {
    this.metrics.clear()
    this.completedMetrics = []
  }

  // 非同期操作の測定
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata)
    try {
      const result = await operation()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  // 同期操作の測定
  measure<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata)
    try {
      const result = operation()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }
}

export const performanceLogger = PerformanceLogger.getInstance()

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const startMeasurement = (name: string, metadata?: Record<string, any>) => {
    performanceLogger.start(name, metadata)
  }

  const endMeasurement = (name: string) => {
    return performanceLogger.end(name)
  }

  const measureAsync = async <T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return performanceLogger.measureAsync(name, operation, metadata)
  }

  const measure = <T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T => {
    return performanceLogger.measure(name, operation, metadata)
  }

  const getStats = () => {
    return performanceLogger.getStats()
  }

  return {
    startMeasurement,
    endMeasurement,
    measureAsync,
    measure,
    getStats
  }
}
