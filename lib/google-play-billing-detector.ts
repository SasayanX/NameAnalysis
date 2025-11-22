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

    const isStandaloneDisplayMode =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(display-mode: standalone)").matches

    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent?.toLowerCase() ?? ""
      const isKnownTWAUA = ua.includes("twa") || ua.includes("androidbrowserhelper") || ua.includes("bubblewrap")

      if (isKnownTWAUA) {
        return true
      }

      // Chrome Custom Tabs 等で付与される "customtab" は除外する
      if (ua.includes("customtab")) {
        return false
      }

      if (
        isStandaloneDisplayMode &&
        (ua.includes("chrome/") || ua.includes("safari/")) &&
        document?.referrer?.startsWith("android-app://")
      ) {
        return true
      }
    }

    if (typeof document !== "undefined") {
      const referrer = document.referrer || ""
      if (referrer.startsWith("android-app://") && isStandaloneDisplayMode) {
        return true
      }
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
   * @param productId - 商品ID（SKU）
   * @param purchaseOptionId - 購入オプションID（オプション、サブスクリプションのオファーを指定する場合に使用）
   */
  static async purchase(productId: string, purchaseOptionId?: string): Promise<Purchase> {
    const initialized = await this.initialize()
    if (!initialized || !this.service) {
      throw new Error("Digital Goods Service is not initialized")
    }

    if (typeof window === "undefined" || typeof PaymentRequest === "undefined") {
      throw new Error("PaymentRequest API is not available")
    }

    try {
      const service = this.service

      // 商品情報が取得できるか事前に確認し、SKU の存在を検証
      try {
        await service.getDetails([productId])
      } catch (detailsError) {
        console.warn("[Google Play Billing] Unable to fetch SKU details before purchase:", detailsError)
      }

      // 購入オプションIDがある場合は、それも含める
      const paymentData: { sku: string; purchaseOptionId?: string } = {
        sku: productId,
      }
      if (purchaseOptionId) {
        paymentData.purchaseOptionId = purchaseOptionId
      }

      const paymentMethodData = [
        {
          supportedMethods: "https://play.google.com/billing",
          data: paymentData,
        },
      ]

      const paymentDetails = {
        total: {
          label: "Total",
          amount: { currency: "JPY", value: "0" },
        },
      }

      console.log("[Google Play Billing] Launching PaymentRequest for SKU:", productId)

      const request = new PaymentRequest(paymentMethodData, paymentDetails)
      const response = await request.show()

      if (response.methodName !== "https://play.google.com/billing") {
        await response.complete("fail")
        throw new Error(`Unexpected payment method returned: ${response.methodName}`)
      }

      const paymentDetailsResponse = response.details as {
        purchaseToken?: string
        sku?: string
      }

      await response.complete("success")

      const resolvedSku = paymentDetailsResponse?.sku ?? productId
      const resolvedToken = paymentDetailsResponse?.purchaseToken

      // PaymentRequest のレスポンスにトークンが含まれないケースは listPurchases から取得
      let purchase: Purchase | undefined

      if (resolvedToken) {
        purchase = {
          itemId: resolvedSku,
          purchaseToken: resolvedToken,
          purchaseTime: Date.now(),
        }
      } else {
        const purchases = await service.listPurchases()
        purchase = purchases.find((p) => p.itemId === resolvedSku)
      }

      if (!purchase) {
        throw new Error("Purchase token could not be retrieved after PaymentRequest")
      }

      console.log("[Google Play Billing] Purchase successful:", purchase)
      return purchase
    } catch (error) {
      console.error("[Google Play Billing] Purchase failed:", error)
      throw error
    }
  }

  private static async tryInitializeWithRetries(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false
    }

    // デバッグ情報を出力
    const isTWA = this.isTWAEnvironment()
    const hasDigitalGoodsAPI = "getDigitalGoodsService" in window
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "N/A"
    const displayMode = typeof window !== "undefined" && "matchMedia" in window 
      ? window.matchMedia("(display-mode: standalone)").matches 
      : false

    console.log("[Google Play Billing] Initialization attempt:", {
      isTWA,
      hasDigitalGoodsAPI,
      userAgent: userAgent.substring(0, 100),
      displayMode,
      retryAttempts: RETRY_ATTEMPTS,
    })

    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      if ("getDigitalGoodsService" in window) {
        try {
          const service = await window.getDigitalGoodsService!("https://play.google.com/billing")
          this.service = service
          console.log("[Google Play Billing] Digital Goods API initialized successfully")
          return true
        } catch (error: any) {
          console.warn(`[Google Play Billing] Failed to initialize (attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1}):`, {
            error: error.message || error,
            code: error.code,
            name: error.name,
          })
        }
      } else if (attempt === 0 && isTWA) {
        console.log(`[Google Play Billing] Digital Goods API not yet available, will retry (attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1})`)
      } else if (attempt === 0 && !isTWA) {
        console.warn("[Google Play Billing] Not in TWA environment - Digital Goods API requires TWA")
        console.warn("[Google Play Billing] Debug info:", {
          userAgent: userAgent.substring(0, 100),
          displayMode,
          hasDigitalGoodsAPI,
        })
      }

      if (attempt < RETRY_ATTEMPTS) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    console.warn("[Google Play Billing] Digital Goods API not available after retries")
    console.warn("[Google Play Billing] Final debug info:", {
      isTWA,
      hasDigitalGoodsAPI,
      userAgent: userAgent.substring(0, 100),
      displayMode,
      totalAttempts: RETRY_ATTEMPTS + 1,
    })
    return false
  }
}

