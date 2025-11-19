import { NextResponse } from "next/server"
import { getSquareApiEndpoint } from "@/lib/square-config"
import { getSquarePlanId } from "@/lib/square-plan-mapping"

/**
 * プラン情報をデバッグするためのAPI
 * plan_idからplan_variation_idを取得する方法を確認
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId") || "basic"

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    if (!squareAccessToken) {
      return NextResponse.json(
        { success: false, error: "SQUARE_ACCESS_TOKENが設定されていません" },
        { status: 500 }
      )
    }

    const squarePlanId = getSquarePlanId(planId as "basic" | "premium")
    if (!squarePlanId) {
      return NextResponse.json(
        { success: false, error: `プランID ${planId} が見つかりません` },
        { status: 400 }
      )
    }

    const apiEndpoint = getSquareApiEndpoint()

    // 方法1: GET /catalog/object/{object_id}
    const getResponse = await fetch(`${apiEndpoint}/catalog/object/${squarePlanId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
    })

    const getResult = await getResponse.json()

    // 方法2: POST /catalog/search
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

    const searchResult = await searchResponse.json()

    // 方法3: すべてのプランを取得して該当するものを探す
    const allPlans = searchResult.objects || []
    const matchingPlan = allPlans.find((plan: any) => plan.id === squarePlanId)

    return NextResponse.json({
      success: true,
      planId,
      squarePlanId,
      methods: {
        get: {
          status: getResponse.status,
          ok: getResponse.ok,
          result: getResult,
        },
        search: {
          status: searchResponse.status,
          ok: searchResponse.ok,
          result: searchResult,
          matchingPlan,
        },
      },
      analysis: {
        planFromGet: getResult.object,
        planFromSearch: matchingPlan,
        subscriptionPlanVariations: matchingPlan?.subscription_plan_data?.subscription_plan_variations || [],
        planVariationId: matchingPlan?.subscription_plan_data?.subscription_plan_variations?.[0]?.id || null,
        phases: matchingPlan?.subscription_plan_data?.subscription_plan_variations?.[0]?.subscription_plan_variation_data?.phases || [],
      },
    })
  } catch (error) {
    console.error("Debug plan error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "デバッグ情報の取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

