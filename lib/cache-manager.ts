// キャッシュ管理とメモリ最適化
export class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private maxSize = 1000 // 最大キャッシュサイズ

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // キャッシュに保存
  set(key: string, data: any, ttl = 300000): void {
    // デフォルト5分
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  // キャッシュから取得
  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // TTL チェック
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // キャッシュをクリア
  clear(): void {
    this.cache.clear()
  }

  // 期限切れのキャッシュを削除
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // キャッシュ統計
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // 実装は省略
    }
  }
}

// グローバルインスタンス
export const cacheManager = CacheManager.getInstance()

// 定期的なクリーンアップ
if (typeof window !== "undefined") {
  setInterval(() => {
    cacheManager.cleanup()
  }, 60000) // 1分ごと
}
