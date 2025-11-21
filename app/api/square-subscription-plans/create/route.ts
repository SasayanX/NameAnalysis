import { type NextRequest, NextResponse } from "next/server"
import { getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Squareでサブスクリプションプランを作成するAPI
 * ベーシック: 330円/月、プレミアム: 550円/月
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body // "basic" | "premium"

    if (!planId || (planId !== "basic" && planId !== "premium")) {
      return NextResponse.json(
        { success: false, error: "planIdは'basic'または'premium'である必要があります" },
        { status: 400 }
      )
    }

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { success: false, error: "Square設定が不足しています。SQUARE_ACCESS_TOKENとSQUARE_LOCATION_IDを設定してください" },
        { status: 500 }
      )
    }

    // プラン情報（production環境用）
    const environment = process.env.SQUARE_ENVIRONMENT || "sandbox"
    const planConfig = {
      basic: {
        name: environment === "production" 
          ? "まいにちAI姓名判断・ベーシックプラン"
          : "ベーシックプラン",
        price: 330, // 円（Square APIでは最小単位で指定）
        cadence: "MONTHLY", // 1ヶ月ごと
      },
      premium: {
        name: environment === "production"
          ? "まいにちAI姓名判断・プレミアムプラン"
          : "プレミアムプラン",
        price: 550, // 円（Square APIでは最小単位で指定）
        cadence: "MONTHLY", // 1ヶ月ごと
      },
    }

    const config = planConfig[planId]

    // Square Catalog APIを使用してサブスクリプションプランを作成
    // まず、カタログオブジェクトを作成
    // 注意: Square APIでは、金額は最小単位（日本円の場合は「円」）で指定
    // 注意: object.idは必須（一意のIDを指定する必要がある）
    const planIdPrefix = planId === "basic" ? "BASIC" : "PREMIUM"
    const timestamp = Date.now()
    const planObjectId = `#${planIdPrefix}_MONTHLY_${timestamp}`
    const variationObjectId = `#${planIdPrefix}_VAR_${timestamp}`
    
    const catalogObject = {
      id: planObjectId, // 一意のID（#で始まる形式）
      type: "SUBSCRIPTION_PLAN",
      subscription_plan_data: {
        name: config.name,
        subscription_plan_variations: [
          {
            type: "SUBSCRIPTION_PLAN_VARIATION",
            id: variationObjectId,
            subscription_plan_variation_data: {
              name: `${config.name} - 月額（3日間無料トライアル付き）`,
              phases: [
                // Phase 0: トライアル期間（3日間、0円）
                {
                  cadence: "DAILY",
                  periods: 3, // 3日間
                  recurring_price_money: {
                    amount: 0, // 0円（無料）
                    currency: "JPY",
                  },
                },
                // Phase 1: 通常の課金期間（1ヶ月、330円/550円）
                {
                  cadence: config.cadence,
                  recurring_price_money: {
                    amount: config.price, // 円単位（日本円の場合、330円 = 330）
                    currency: "JPY",
                  },
                },
              ],
            },
          },
        ],
      },
    }

    // デバッグ: リクエストボディをログに出力（本番環境でも）
    console.log("[Square Plan Create] Request body:", JSON.stringify(catalogObject, null, 2))

    // Square Catalog APIでオブジェクトを作成
    const apiEndpoint = getSquareApiEndpoint()
    
    let catalogResponse: Response
    try {
      catalogResponse = await fetch(`${apiEndpoint}/catalog/object`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
        body: JSON.stringify({
          idempotency_key: `plan_${planId}_${Date.now()}`,
          object: catalogObject,
        }),
        signal: AbortSignal.timeout(30000), // 30秒でタイムアウト
      })
    } catch (error: any) {
      console.error("[Square Catalog API] Network error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Square APIへの接続に失敗しました",
          details: error.message || "Network error",
          type: error.name || "Unknown",
        },
        { status: 500 }
      )
    }

    const responseText = await catalogResponse.text()
    let catalogResult: any
    try {
      catalogResult = JSON.parse(responseText)
    } catch (e) {
      console.error("Square Catalog API JSON解析失敗:", responseText)
      return NextResponse.json(
        {
          success: false,
          error: "Square APIからのレスポンスの解析に失敗しました",
          responseText: responseText.substring(0, 500),
        },
        { status: catalogResponse.status }
      )
    }

    // デバッグログ（常に出力）
    console.log("[Square Catalog API] Request URL:", `${apiEndpoint}/catalog/object`)
    console.log("[Square Catalog API] Response status:", catalogResponse.status)
    console.log("[Square Catalog API] Response body:", JSON.stringify(catalogResult, null, 2))
    if (!catalogResponse.ok) {
      console.error("[Square Catalog API] Error details:")
      console.error("  - Status:", catalogResponse.status)
      console.error("  - Errors:", catalogResult.errors)
      if (catalogResult.errors && catalogResult.errors.length > 0) {
        catalogResult.errors.forEach((error: any, index: number) => {
          console.error(`  - Error ${index + 1}:`, error.code, error.detail, error.field)
        })
      }
    }

    if (!catalogResponse.ok) {
      console.error("Square Catalog API エラー:", catalogResult)
      
      // エラーの詳細を取得
      const errorDetails = catalogResult.errors || []
      const errorMessages = errorDetails.map((err: any) => ({
        code: err.code,
        detail: err.detail,
        field: err.field,
      }))
      
      return NextResponse.json(
        {
          success: false,
          error: "サブスクリプションプランの作成に失敗しました",
          details: errorMessages,
          fullResponse: catalogResult,
          requestBody: catalogObject, // デバッグ用にリクエストボディも返す
        },
        { status: catalogResponse.status }
      )
    }

    const planIdFromCatalog = catalogResult.catalog_object?.id

    // プランIDを環境変数に保存するための情報を返す
    return NextResponse.json({
      success: true,
      message: `${config.name}を作成しました`,
      plan: {
        id: planIdFromCatalog,
        name: config.name,
        price: config.price,
        cadence: config.cadence,
        planId: planId, // アプリ内プランID
      },
      // 環境変数に設定するための情報
      envVariable: {
        name: `SQUARE_SUBSCRIPTION_PLAN_ID_${planId.toUpperCase()}`,
        value: planIdFromCatalog,
      },
      // Payment Linkを作成するための情報
      nextStep: {
        message: "次に、このプランIDを使ってSquare Payment Linkを作成してください",
        planId: planIdFromCatalog,
        locationId: squareLocationId,
      },
    })
  } catch (error) {
    console.error("Squareサブスクリプションプラン作成エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "サブスクリプションプランの作成に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * 既存のサブスクリプションプラン一覧を取得
 */
export async function GET() {
  try {
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN

    if (!squareAccessToken) {
      return NextResponse.json(
        { success: false, error: "SQUARE_ACCESS_TOKENが設定されていません" },
        { status: 500 }
      )
    }

    // Square Catalog APIでサブスクリプションプランを検索
    const apiEndpoint = getSquareApiEndpoint()
    const response = await fetch(`${apiEndpoint}/catalog/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
      body: JSON.stringify({
        object_types: ["SUBSCRIPTION_PLAN"],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "サブスクリプションプランの取得に失敗しました",
          details: result.errors || result,
        },
        { status: response.status }
      )
    }

    const plans = result.objects || []

    return NextResponse.json({
      success: true,
      plans: plans.map((plan: any) => ({
        id: plan.id,
        name: plan.subscription_plan_data?.name,
        phases: plan.subscription_plan_data?.phases || [],
      })),
    })
  } catch (error) {
    console.error("Squareサブスクリプションプラン取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "サブスクリプションプランの取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

