import { NextResponse } from "next/server"
import { getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Squareのすべてのサブスクリプションプランを一覧取得するAPI
 * 本番環境のプランIDを確認するために使用
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

    const apiEndpoint = getSquareApiEndpoint()
    const environment = process.env.SQUARE_ENVIRONMENT || 
                       (process.env.NODE_ENV === "production" ? "production" : "sandbox")

    // Square Catalog APIでサブスクリプションプランを検索
    const searchResponse = await fetch(`${apiEndpoint}/catalog/search`, {
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

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      return NextResponse.json(
        {
          success: false,
          error: "Square APIからのレスポンスが正常ではありません",
          status: searchResponse.status,
          details: errorText.substring(0, 500),
        },
        { status: searchResponse.status }
      )
    }

    const searchResult = await searchResponse.json()
    const plans = searchResult.objects || []

    // プラン情報を整形
    const formattedPlans = plans.map((plan: any) => {
      const planData = plan.subscription_plan_data || {}
      const variations = planData.subscription_plan_variations || []
      const firstVariation = variations[0] || {}
      const variationData = firstVariation.subscription_plan_variation_data || {}
      const phases = variationData.phases || []
      const firstPhase = phases[0] || {}
      const pricing = firstPhase.pricing || {}
      const priceMoney = pricing.price_money || {}
      
      // 価格の取得（複数の方法を試行）
      let priceDisplay = "未設定"
      if (priceMoney.amount) {
        priceDisplay = `${priceMoney.amount} ${priceMoney.currency || "JPY"}`
      } else if (pricing.price) {
        priceDisplay = `${pricing.price} ${pricing.currency || "JPY"}`
      } else if (firstPhase.price_money?.amount) {
        priceDisplay = `${firstPhase.price_money.amount} ${firstPhase.price_money.currency || "JPY"}`
      }

      // プラン名を取得（複数の方法を試行）
      const planName = planData.name || plan.name || "未設定"
      const planNameLower = planName.toLowerCase()

      // ベーシック/プレミアムの判定
      const isBasic = planNameLower.includes("basic") || 
                      planNameLower.includes("ベーシック") ||
                      plan.id.includes("BASIC")
      
      const isPremium = planNameLower.includes("premium") || 
                        planNameLower.includes("プレミアム") ||
                        plan.id.includes("PREMIUM")

      return {
        id: plan.id,
        name: planName,
        variationId: firstVariation.id || null,
        price: priceDisplay,
        cadence: firstPhase.cadence || "未設定",
        createdAt: plan.created_at || null,
        updatedAt: plan.updated_at || null,
        // 環境変数に設定するための情報
        envVariable: {
          basic: isBasic ? `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=${plan.id}` : null,
          premium: isPremium ? `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=${plan.id}` : null,
        },
      }
    })

    return NextResponse.json({
      success: true,
      environment,
      apiEndpoint,
      totalPlans: plans.length,
      plans: formattedPlans,
      // 環境変数に設定するための推奨値
      recommendedEnvVars: formattedPlans
        .filter((p: any) => p.envVariable.basic || p.envVariable.premium)
        .map((p: any) => ({
          plan: p.name,
          envVar: p.envVariable.basic || p.envVariable.premium,
        })),
      // すべてのプランID（手動で判定する場合）
      allPlanIds: formattedPlans.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      })),
    })
  } catch (error) {
    console.error("Squareプラン一覧取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "プラン一覧の取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

