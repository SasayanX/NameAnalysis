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

export class GooglePlayBillingDetector {
  private static initialized = false
  private static service: DigitalGoodsService | null = null

  /**
   * Digital Goods APIの初期化（最小限の実装）
   * アプリ起動時に呼び出すことで、Google PlayがBilling実装を検知します
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.service !== null
    }

    if (typeof window === 'undefined') {
      return false
    }

    // TWA環境でのみ利用可能
    if (!('getDigitalGoodsService' in window)) {
      console.log('[Google Play Billing] Digital Goods API is not available (not in TWA environment)')
      this.initialized = true
      return false
    }

    try {
      const service = await window.getDigitalGoodsService!('https://play.google.com/billing')
      this.service = service
      this.initialized = true
      console.log('[Google Play Billing] Digital Goods API initialized successfully')
      return true
    } catch (error) {
      console.warn('[Google Play Billing] Failed to initialize:', error)
      this.initialized = true
      return false
    }
  }

  /**
   * TWA環境かどうかを判定
   */
  static isTWAEnvironment(): boolean {
    if (typeof window === 'undefined') return false
    
    // Digital Goods APIが利用可能 = TWA環境
    return 'getDigitalGoodsService' in window
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
}

