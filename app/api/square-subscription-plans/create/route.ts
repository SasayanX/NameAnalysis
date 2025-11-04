import { type NextRequest, NextResponse } from "next/server"

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

    // プラン情報
    const planConfig = {
      basic: {
        name: "ベーシックプラン",
        price: 330, // 円
        cadence: "MONTHLY", // 1ヶ月ごと
      },
      premium: {
        name: "プレミアムプラン",
        price: 550, // 円
        cadence: "MONTHLY", // 1ヶ月ごと
      },
    }

    const config = planConfig[planId]

    // Square Catalog APIを使用してサブスクリプションプランを作成
    // まず、カタログオブジェクトを作成
    const catalogObject = {
      type: "SUBSCRIPTION_PLAN",
      subscription_plan_data: {
        name: config.name,
        phases: [
          {
            cadence: config.cadence,
            recurring_price_money: {
              amount: config.price, // 円単位（日本円の場合）
              currency: "JPY",
            },
          },
        ],
      },
    }

    // Square Catalog APIでオブジェクトを作成
    const catalogResponse = await fetch("https://connect.squareup.com/v2/catalog/object", {
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
    })

    const catalogResult = await catalogResponse.json()

    if (!catalogResponse.ok) {
      console.error("Square Catalog API エラー:", catalogResult)
      return NextResponse.json(
        {
          success: false,
          error: "サブスクリプションプランの作成に失敗しました",
          details: catalogResult.errors || catalogResult,
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
    const response = await fetch("https://connect.squareup.com/v2/catalog/search", {
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

