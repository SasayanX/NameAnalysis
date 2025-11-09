/**
 * Google Play Billing検出用の最小実装
 * アプリ起動時にDigital Goods APIの存在をチェックすることで、
 * Google Play Consoleで商品追加ができるようになります
 */
"use client"

declare global {
  interface Window {
    getDigitalGoodsService?: (serviceProvider: string) => Promise<DigitalGoodsService>
  }
}

interface DigitalGoodsService {
  getDetails: (itemIds: string[]) => Promise<ItemDetails[]>
  listPurchases: () => Promise<Purchase[]>
  purchase: (itemId: string) => Promise<Purchase>
}

interface ItemDetails {
  itemId: string
  title: string
  description: string
  price: string
  priceCurrencyCode: string
}

interface Purchase {
  itemId: string
  purchaseToken: string
  purchaseTime: number
}

const RETRY_ATTEMPTS = 5
const INITIAL_RETRY_DELAY_MS = 250

export class GooglePlayBillingDetector {
  private static service: DigitalGoodsService | null = null
  private static initializingPromise: Promise<boolean> | null = null

  /**
   * Digital Goods APIの初期化（最小限の実装）
   * アプリ起動時に呼び出すことで、Google PlayがBilling実装を検知します
   */
  static async initialize(): Promise<boolean> {
    if (this.service) {
      return true
    }

    if (this.initializingPromise) {
      return this.initializingPromise
    }

    this.initializingPromise = this.tryInitializeWithRetries()

    const result = await this.initializingPromise
    if (!result) {
      this.initializingPromise = null
    }

    return result
  }

  /**
   * TWA環境かどうかを判定
   */
  static isTWAEnvironment(): boolean {
    if (typeof window === "undefined") return false

    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent?.toLowerCase() ?? ""
      if (ua.includes("twa") || ua.includes("androidbrowserhelper") || ua.includes("bubblewrap")) {
        return true
      }
    }

    if (typeof document !== "undefined") {
      const referrer = document.referrer || ""
      if (referrer.startsWith("android-app://")) {
        return true
      }
    }

    if ("getDigitalGoodsService" in window) {
      return true
    }

    return false
  }

  /**
   * Digital Goods APIが利用可能かどうか
   */
  static isAvailable(): boolean {
    return this.service !== null
  }

  /**
   * サービスインスタンスを取得（実装時用）
   */
  static getService(): DigitalGoodsService | null {
    return this.service
  }

  /**
   * 商品情報を取得
   */
  static async getProductDetails(productIds: string[]): Promise<ItemDetails[]> {
    if (!this.service) {
      throw new Error('Digital Goods Service is not initialized')
    }

    try {
      const details = await this.service.getDetails(productIds)
      return details
    } catch (error) {
      console.error('[Google Play Billing] Failed to get product details:', error)
      throw error
    }
  }

  /**
   * 購入履歴を取得
   */
  static async getPurchases(): Promise<Purchase[]> {
    if (!this.service) {
      throw new Error('Digital Goods Service is not initialized')
    }

    try {
      const purchases = await this.service.listPurchases()
      return purchases
    } catch (error) {
      console.error('[Google Play Billing] Failed to get purchases:', error)
      throw error
    }
  }

  /**
   * 商品を購入
   */
  static async purchase(productId: string): Promise<Purchase> {
    if (!this.service) {
      throw new Error('Digital Goods Service is not initialized')
    }

    try {
      const purchase = await this.service.purchase(productId)
      console.log('[Google Play Billing] Purchase successful:', purchase)
      return purchase
    } catch (error) {
      console.error('[Google Play Billing] Purchase failed:', error)
      throw error
    }
  }

  private static async tryInitializeWithRetries(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false
    }

    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      if ("getDigitalGoodsService" in window) {
        try {
          const service = await window.getDigitalGoodsService!("https://play.google.com/billing")
          this.service = service
          console.log("[Google Play Billing] Digital Goods API initialized successfully")
          return true
        } catch (error) {
          console.warn("[Google Play Billing] Failed to initialize:", error)
        }
      } else if (attempt === 0 && this.isTWAEnvironment()) {
        console.log("[Google Play Billing] Digital Goods API not yet available, will retry")
      }

      if (attempt < RETRY_ATTEMPTS) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    console.warn("[Google Play Billing] Digital Goods API not available after retries")
    return false
  }
}

