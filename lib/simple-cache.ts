// 段階1: シンプルなメモリキャッシュ（最もリスクが低い）
class SimpleCache {
  private cache = new Map<string, { value: any; expiry: number }>()
  private maxSize = 100 // 最大100エントリ

  set(key: string, value: any, ttlMs = 300000): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    })
  }

  get(key: string): any {
    const item = this.cache.get(key)
    if (!item) return null

    // 期限切れチェック
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const simpleCache = new SimpleCache()
