import { NextRequest, NextResponse } from "next/server"
import { getSquarePlanId } from "@/lib/square-plan-mapping"
import { getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Squareサブスクリプションプランの詳細をデバッグするエンドポイント
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId") as "basic" | "premium" | null

    if (!planId || !["basic", "premium"].includes(planId)) {
      return NextResponse.json(
        { success: false, error: "planId (basic or premium) is required" },
        { status: 400 }
      )
    }

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { success: false, error: "Square設定が不完全です" },
        { status: 500 }
      )
    }

    const squarePlanId = getSquarePlanId(planId)
    if (!squarePlanId) {
      return NextResponse.json(
        { success: false, error: `SquareプランIDが設定されていません (${planId})` },
        { status: 500 }
      )
    }

    const apiEndpoint = getSquareApiEndpoint()

    // プラン情報を取得
    const catalogResponse = await fetch(`${apiEndpoint}/catalog/object/${squarePlanId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
    })

    const catalogResult = await catalogResponse.json()

    if (!catalogResponse.ok) {
      // SEARCH APIを試す
      const searchResponse = await fetch(`${apiEndpoint}/catalog/search`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
        body: JSON.stringify({
          object_types: ["SUBSCRIPTION_PLAN"],
          query: {
            exact_query: {
              attribute_name: "id",
              attribute_value: squarePlanId,
            },
          },
        }),
      })

      const searchResult = await searchResponse.json()

      if (!searchResponse.ok || !searchResult.objects || searchResult.objects.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "プランが見つかりませんでした",
            squarePlanId,
            catalogError: catalogResult,
            searchError: searchResult,
          },
          { status: 404 }
        )
      }

      const plan = searchResult.objects[0]
      const variations = plan.subscription_plan_data?.subscription_plan_variations || []
      const firstVariation = variations[0] || {}
      const variationData = firstVariation.subscription_plan_variation_data || {}
      const phases = variationData.phases || []

      return NextResponse.json({
        success: true,
        planId,
        squarePlanId,
        plan: {
          id: plan.id,
          type: plan.type,
          name: plan.subscription_plan_data?.name || "未設定",
        },
        variation: {
          id: firstVariation.id,
          name: variationData.name || "未設定",
          phasesCount: phases.length,
          phases: phases.map((phase: any, index: number) => ({
            index,
            cadence: phase.cadence,
            periods: phase.periods,
            pricing: phase.pricing,
            ordinal: phase.ordinal,
          })),
        },
        hasPhases: phases.length > 0,
        rawPlan: plan,
      })
    }

    const plan = catalogResult.object
    const variations = plan.subscription_plan_data?.subscription_plan_variations || []
    const firstVariation = variations[0] || {}
    const variationData = firstVariation.subscription_plan_variation_data || {}
    const phases = variationData.phases || []

    return NextResponse.json({
      success: true,
      planId,
      squarePlanId,
      plan: {
        id: plan.id,
        type: plan.type,
        name: plan.subscription_plan_data?.name || "未設定",
      },
      variation: {
        id: firstVariation.id,
        name: variationData.name || "未設定",
        phasesCount: phases.length,
        phases: phases.map((phase: any, index: number) => ({
          index,
          cadence: phase.cadence,
          periods: phase.periods,
          pricing: phase.pricing,
          ordinal: phase.ordinal,
        })),
      },
      hasPhases: phases.length > 0,
      rawPlan: plan,
    })
  } catch (error) {
    console.error("[Square Plan Debug] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
