// メモリ使用量最適化
export class MemoryOptimizer {
  private static instance: MemoryOptimizer
  private weakCache = new WeakMap()
  private cleanupInterval: NodeJS.Timeout | null = null

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer()
    }
    return MemoryOptimizer.instance
  }

  constructor() {
    this.startCleanupTimer()
  }

  // WeakMapを使用した軽量キャッシュ
  setWeakCache(key: object, value: any): void {
    this.weakCache.set(key, value)
  }

  getWeakCache(key: object): any {
    return this.weakCache.get(key)
  }

  // メモリクリーンアップタイマー
  private startCleanupTimer(): void {
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.performCleanup()
      }, 60000) // 1分ごと
    }
  }

  // メモリクリーンアップ実行
  private performCleanup(): void {
    // ガベージコレクションの提案（ブラウザが対応している場合）
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        ;(window as any).gc()
      } catch (error) {
        // ガベージコレクションが利用できない場合は無視
      }
    }

    // メモリ使用量をチェック
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024

      if (usedMB > 100) {
        // 100MB以上の場合
        console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`)
        // 必要に応じて追加のクリーンアップ処理
      }
    }
  }

  // クリーンアップタイマーを停止
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

export const memoryOptimizer = MemoryOptimizer.getInstance()
