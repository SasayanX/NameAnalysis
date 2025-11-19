import { type NextRequest, NextResponse } from "next/server"
import { getSquarePlanId, validateSquarePlanMapping } from "@/lib/square-plan-mapping"
import { getSquareApiEndpoint } from "@/lib/square-config"
import { getSupabaseServerClient } from "@/lib/supabase-server"

/**
 * Square Subscriptions APIを使用してサブスクリプションを作成
 * Square側で既に作成したサブスクリプションプランを使用します
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, customerId, cardId, customerEmail } = body

    // プラン検証
    const validPlans = ["basic", "premium"]
    if (!planId || !validPlans.includes(planId)) {
      return NextResponse.json(
        { success: false, error: "無効なプランIDです" },
        { status: 400 }
      )
    }

    // 必須パラメータの検証（Perplexity調査結果に基づく）
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerIdが必要です。先に顧客を作成してください。" },
        { status: 400 }
      )
    }

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "cardIdが必要です。先にカードを登録してください。" },
        { status: 400 }
      )
    }

    // Square側のplan_idを取得
    const squarePlanId = getSquarePlanId(planId as "basic" | "premium")
    if (!squarePlanId) {
      const validation = validateSquarePlanMapping()
      return NextResponse.json(
        {
          success: false,
          error: `SquareサブスクリプションプランIDが設定されていません。環境変数 ${validation.missingPlans.join(", ")} を設定してください。`,
          missingConfig: validation.missingPlans,
        },
        { status: 500 }
      )
    }

    // 環境変数チェック
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { success: false, error: "Square設定が不完全です" },
        { status: 500 }
      )
    }

    // Square Subscriptions APIでサブスクリプションを作成
    try {
      const apiEndpoint = getSquareApiEndpoint()
      
      // プラン情報を取得してplan_variation_idを抽出
      // Square Catalog APIでプラン情報を取得（GETメソッド）
      const catalogResponse = await fetch(`${apiEndpoint}/catalog/object/${squarePlanId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
      })

      const catalogResult = await catalogResponse.json()
      let planVariationId: string | undefined

      if (catalogResponse.ok && catalogResult.object) {
        const plan = catalogResult.object
        if (process.env.NODE_ENV !== "production") {
          console.log("[Square Subscription] Plan object:", JSON.stringify(plan, null, 2))
        }
        // plan_variation_idはsubscription_plan_variationsの最初の要素のidから取得
        if (plan.subscription_plan_data?.subscription_plan_variations && plan.subscription_plan_data.subscription_plan_variations.length > 0) {
          planVariationId = plan.subscription_plan_data.subscription_plan_variations[0].id
          if (process.env.NODE_ENV !== "production") {
            console.log("[Square Subscription] Found plan_variation_id from subscription_plan_variations[0].id:", planVariationId)
          }
        }
      } else {
        // GETが失敗した場合、SEARCH APIを試す
        if (process.env.NODE_ENV !== "production") {
          console.log("[Square Subscription] GET failed, trying SEARCH API...")
        }
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
        if (searchResponse.ok && searchResult.objects && searchResult.objects.length > 0) {
          const plan = searchResult.objects[0]
          if (process.env.NODE_ENV !== "production") {
            console.log("[Square Subscription] Plan from search:", JSON.stringify(plan, null, 2))
          }
          // plan_variation_idはsubscription_plan_variationsの最初の要素のidから取得
          if (plan.subscription_plan_data?.subscription_plan_variations && plan.subscription_plan_data.subscription_plan_variations.length > 0) {
            planVariationId = plan.subscription_plan_data.subscription_plan_variations[0].id
            if (process.env.NODE_ENV !== "production") {
              console.log("[Square Subscription] Found plan_variation_id from search subscription_plan_variations[0].id:", planVariationId)
            }
          }
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.error("[Square Subscription] Search API failed:", searchResult)
          }
        }
      }

      if (!planVariationId) {
        console.error("plan_variation_idが見つかりません。プラン情報:", catalogResult)
        return NextResponse.json(
          {
            success: false,
            error: "plan_variation_idを取得できませんでした。プラン情報を確認してください。",
            catalogResult,
          },
          { status: 500 }
        )
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[Square Subscription] plan_id:", squarePlanId)
        console.log("[Square Subscription] plan_variation_id:", planVariationId)
      }

      const response = await fetch(`${apiEndpoint}/subscriptions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-01-18", // Square API バージョン
        },
        body: JSON.stringify({
          idempotency_key: `subscription_${planId}_${Date.now()}`,
          location_id: squareLocationId,
          plan_id: squarePlanId, // Square側で作成したplan_idを使用
          plan_variation_id: planVariationId, // プランのバリエーションID（必須）
          customer_id: customerId, // 必須（Perplexity調査結果）
          card_id: cardId, // CreateCardで取得したcardId（必須）
          start_date: new Date().toISOString().split('T')[0],
        }),
      })

      const result = await response.json()

      if (response.ok && result.subscription) {
        // Supabaseにサブスクリプション情報を保存
        const supabase = getSupabaseServerClient()
        let supabaseSaveResult = null
        
        if (supabase) {
          try {
            // 顧客情報を取得（customerIdからemailを取得する必要がある場合）
            // 今回はcustomerIdをそのまま使用
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + 1) // 1ヶ月後

            // user_subscriptionsテーブルに保存
            // 既存レコードを検索（customer_emailとplanの組み合わせで）
            const normalizedEmail = body.customerEmail?.toLowerCase() || null
            let subscriptionRecord = null
            
            if (normalizedEmail) {
              // 既存レコードを検索
              const { data: existingRecord } = await supabase
                .from("user_subscriptions")
                .select("*")
                .eq("customer_email", normalizedEmail)
                .eq("plan", planId)
                .order("last_verified_at", { ascending: false })
                .limit(1)
                .maybeSingle()

              const subscriptionData = {
                customer_email: normalizedEmail,
                plan: planId,
                status: result.subscription.status === "ACTIVE" ? "active" : "pending",
                payment_method: "square",
                product_id: result.subscription.id,
                last_verified_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                auto_renewing: true,
                raw_response: {
                  subscription_id: result.subscription.id,
                  plan_id: squarePlanId,
                  status: result.subscription.status,
                  start_date: result.subscription.start_date,
                  customer_id: customerId,
                  card_id: cardId,
                },
              }

              if (existingRecord) {
                // 既存レコードを更新
                const { data: updatedRecord, error: updateError } = await supabase
                  .from("user_subscriptions")
                  .update(subscriptionData)
                  .eq("id", existingRecord.id)
                  .select()
                  .maybeSingle()

                if (updateError) {
                  console.error("[Square Subscription] Supabase更新エラー:", updateError)
                } else {
                  subscriptionRecord = updatedRecord
                  console.log("[Square Subscription] Supabase更新成功:", updatedRecord)
                }
              } else {
                // 新規レコードを挿入
                const { data: insertedRecord, error: insertError } = await supabase
                  .from("user_subscriptions")
                  .insert(subscriptionData)
                  .select()
                  .maybeSingle()

                if (insertError) {
                  console.error("[Square Subscription] Supabase挿入エラー:", insertError)
                } else {
                  subscriptionRecord = insertedRecord
                  console.log("[Square Subscription] Supabase挿入成功:", insertedRecord)
                }
              }
            } else {
              console.warn("[Square Subscription] customerEmailが提供されていないため、user_subscriptionsへの保存をスキップします")
            }

            if (subscriptionRecord) {
              supabaseSaveResult = subscriptionRecord
            }

            // square_paymentsテーブルにも保存（決済履歴として）
            const { error: paymentError } = await supabase
              .from("square_payments")
              .upsert(
                {
                  payment_id: `subscription_${result.subscription.id}`,
                  order_id: result.subscription.id,
                  customer_email: body.customerEmail?.toLowerCase() || null,
                  plan: planId,
                  amount: planId === "basic" ? 330 : 550,
                  currency: "JPY",
                  status: "completed",
                  webhook_received_at: new Date().toISOString(),
                  expires_at: expiresAt.toISOString(),
                  metadata: {
                    subscription_id: result.subscription.id,
                    plan_id: squarePlanId,
                    customer_id: customerId,
                    card_id: cardId,
                    environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
                  },
                },
                {
                  onConflict: "payment_id",
                }
              )

            if (paymentError) {
              console.error("[Square Subscription] square_payments保存エラー:", paymentError)
            } else {
              console.log("[Square Subscription] square_paymentsに保存成功")
            }
          } catch (supabaseError) {
            console.error("[Square Subscription] Supabase保存処理でエラー:", supabaseError)
          }
        } else {
          console.warn("[Square Subscription] Supabaseクライアントが利用できません")
        }

        return NextResponse.json({
          success: true,
          subscription: {
            id: result.subscription.id,
            planId: planId,
            squarePlanId: squarePlanId,
            squareSubscriptionId: result.subscription.id,
            status: result.subscription.status,
            startDate: result.subscription.start_date,
            canceledDate: result.subscription.canceled_date,
          },
          supabaseSaved: supabaseSaveResult !== null,
          supabaseRecord: supabaseSaveResult,
        })
      } else {
        console.error("Square Subscriptions API error:", result)
        return NextResponse.json(
          {
            success: false,
            error: result.errors?.[0]?.detail || "サブスクリプションの作成に失敗しました",
            squareErrors: result.errors,
          },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error("Square API call error:", error)
      return NextResponse.json(
        { success: false, error: "Square APIへの接続に失敗しました" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
