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
   * TWA環境かどうかを判定（強化版）
   */
  static isTWAEnvironment(): boolean {
    if (typeof window === "undefined") return false

    // 1. Standalone表示モードのチェック（最も信頼性が高い）
    const isStandaloneDisplayMode =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(display-mode: standalone)").matches

    // 2. User Agentチェック
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent?.toLowerCase() ?? ""
      
      // 2-1. 明確なTWA識別子を含むUA（最高優先度）
      const isKnownTWAUA = ua.includes("twa") || 
                          ua.includes("androidbrowserhelper") || 
                          ua.includes("bubblewrap") ||
                          ua.includes("trusted-web-activity")
      
      if (isKnownTWAUA) {
        console.log("[TWA判定] User Agentで検出:", ua)
        return true
      }

      // 2-2. Chrome Custom Tabs 等で付与される "customtab" は除外
      if (ua.includes("customtab")) {
        return false
      }

      // 2-3. Standalone + Chrome/Safari + android-app referrer
      if (
        isStandaloneDisplayMode &&
        (ua.includes("chrome/") || ua.includes("safari/")) &&
        typeof document !== "undefined" &&
        document?.referrer?.startsWith("android-app://")
      ) {
        console.log("[TWA判定] Standalone + Chrome/Safari + android-app referrerで検出")
        return true
      }

      // 2-4. Android環境 + Standalone（より広範囲な検出）
      if (
        isStandaloneDisplayMode &&
        (ua.includes("android") || ua.includes("mobile"))
      ) {
        // 通常のブラウザ（chrome://flags等）を除外するため、referrerも確認
        const hasAndroidAppReferrer = typeof document !== "undefined" && 
                                      document?.referrer?.startsWith("android-app://")
        // localStorageにTWA環境を示すフラグがあるか確認（以前の検出結果を保持）
        const hasTWACache = typeof window !== "undefined" && 
                           localStorage.getItem("isTWAEnvironment") === "true"
        
        if (hasAndroidAppReferrer || hasTWACache) {
          console.log("[TWA判定] Android + Standalone + referrer/cacheで検出")
          // 検出結果をキャッシュ
          if (typeof window !== "undefined") {
            localStorage.setItem("isTWAEnvironment", "true")
          }
          return true
        }
      }
    }

    // 3. Document referrerチェック
    if (typeof document !== "undefined") {
      const referrer = document.referrer || ""
      if (referrer.startsWith("android-app://") && isStandaloneDisplayMode) {
        console.log("[TWA判定] android-app referrer + Standaloneで検出")
        // 検出結果をキャッシュ
        if (typeof window !== "undefined") {
          localStorage.setItem("isTWAEnvironment", "true")
        }
        return true
      }
    }

    // 4. localStorageに以前の検出結果がある場合（ログイン後のページ遷移でも維持）
    if (typeof window !== "undefined") {
      const cachedTWA = localStorage.getItem("isTWAEnvironment")
      if (cachedTWA === "true" && isStandaloneDisplayMode) {
        console.log("[TWA判定] キャッシュされた結果を使用（Standalone + cache）")
        return true
      }
    }

    // 5. すべての判定に失敗した場合、キャッシュをクリア
    if (typeof window !== "undefined" && !isStandaloneDisplayMode) {
      localStorage.removeItem("isTWAEnvironment")
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
   * TWA環境での正しい実装: PaymentRequest APIを使用
   * TWAでは「Digital Goods API」と「Payment Request API」を組み合わせて使用します
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

      // 1. 商品情報を取得（Digital Goods APIのgetDetailsを使用）
      let productDetails: ItemDetails | undefined
      try {
        const details = await service.getDetails([productId])
        console.log("[Google Play Billing] Product details:", details)
        if (details.length === 0) {
          throw new Error(`商品ID "${productId}" が見つかりません。Google Play Consoleで商品が正しく設定されているか確認してください。`)
        }
        productDetails = details[0]
      } catch (detailsError: any) {
        console.error("[Google Play Billing] Unable to fetch SKU details before purchase:", detailsError)
        throw new Error(`商品情報の取得に失敗しました: ${detailsError.message || detailsError}`)
      }

      console.log("[Google Play Billing] Starting purchase for product:", productId)
      
      // 2. PaymentRequest APIを使用して購入フローを開始（TWA環境での正しい方法）
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

      // 商品情報から価格を取得（あれば使用、なければ0）
      const priceValue = productDetails?.price ? parseFloat(productDetails.price) : 0
      const priceCurrency = productDetails?.priceCurrencyCode || "JPY"

      const paymentDetails = {
        total: {
          label: productDetails?.title || "Total",
          amount: { 
            currency: priceCurrency, 
            value: priceValue > 0 ? priceValue.toString() : "0" 
          },
        },
      }

      console.log("[Google Play Billing] Creating PaymentRequest for SKU:", productId)
      const request = new PaymentRequest(paymentMethodData, paymentDetails)
      
      // 決済が可能かどうかを事前にチェック
      try {
        const canMakePayment = await request.canMakePayment()
        console.log("[Google Play Billing] canMakePayment result:", canMakePayment)
        if (!canMakePayment) {
          throw new Error("この決済方法は利用できません。Google Play Billingが正しく設定されているか確認してください。")
        }
      } catch (canMakePaymentError: any) {
        console.error("[Google Play Billing] canMakePayment check failed:", canMakePaymentError)
        // canMakePaymentのチェックが失敗しても、実際には決済できる場合があるため、警告のみ
        console.warn("[Google Play Billing] Continuing despite canMakePayment check failure")
      }
      
      // 3. PaymentRequest.show()で決済画面を表示
      let response: PaymentResponse
      try {
        console.log("[Google Play Billing] Calling request.show()...")
        console.log("[Google Play Billing] PaymentRequest state:", {
          id: request.id,
          methodData: request.methodData,
          details: request.details
        })
        response = await request.show()
        console.log("[Google Play Billing] PaymentRequest.show() completed successfully")
      } catch (showError: any) {
        console.error("[Google Play Billing] PaymentRequest.show() failed:", showError)
        console.error("[Google Play Billing] Error details:", {
          name: showError.name,
          message: showError.message,
          stack: showError.stack
        })
        // ユーザーがキャンセルした場合
        if (showError.name === 'AbortError' || 
            showError.message?.includes('cancel') || 
            showError.message?.includes('abort')) {
          throw new Error('購入がキャンセルされました')
        }
        // その他のエラー
        throw new Error(`決済画面の表示に失敗しました: ${showError.message || showError}`)
      }

      // 4. レスポンスを確認
      if (response.methodName !== "https://play.google.com/billing") {
        await response.complete("fail")
        throw new Error(`Unexpected payment method returned: ${response.methodName}`)
      }

      const paymentDetailsResponse = response.details as {
        purchaseToken?: string
        sku?: string
      }

      // 5. 購入を完了としてマーク
      await response.complete("success")

      const resolvedSku = paymentDetailsResponse?.sku ?? productId
      const resolvedToken = paymentDetailsResponse?.purchaseToken

      // 6. purchaseTokenを取得（PaymentRequestのレスポンスから、またはlistPurchases()から）
      let purchase: Purchase | undefined

      if (resolvedToken) {
        purchase = {
          itemId: resolvedSku,
          purchaseToken: resolvedToken,
          purchaseTime: Date.now(),
        }
        console.log("[Google Play Billing] Purchase token from PaymentRequest response:", purchase)
      } else {
        // PaymentRequestのレスポンスにトークンが含まれない場合、listPurchases()から取得
        console.log("[Google Play Billing] Purchase token not in response, fetching from listPurchases()...")
        const purchases = await service.listPurchases()
        const foundPurchase = purchases.find((p) => p.itemId === resolvedSku)
        if (foundPurchase) {
          purchase = foundPurchase
          console.log("[Google Play Billing] Purchase found in listPurchases():", purchase)
        } else {
          throw new Error("購入トークンを取得できませんでした。購入が完了していない可能性があります。")
        }
      }

      if (!purchase || !purchase.purchaseToken) {
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

