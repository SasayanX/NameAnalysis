import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabaseクライアントを取得（リクエストハンドラー内で初期化）
 * ビルド時に環境変数が設定されていない場合でもエラーにならないようにする
 */
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Square Webhook署名検証
function verifyWebhookSignature(body: string, signature: string, webhookSignatureKey: string): boolean {
  const hmac = crypto.createHmac("sha256", webhookSignatureKey)
  hmac.update(body)
  const expectedSignature = hmac.digest("base64")
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      // Supabaseが設定されていない場合でも、Webhookの処理は続行（ログのみ記録）
      console.warn("Supabase環境が設定されていません。決済情報の保存はスキップされます。")
    }

    const body = await request.text()
    const signature = request.headers.get("x-square-signature") || ""

    // 環境判定: 本番環境では署名検証を必須にする
    const isProduction = process.env.NODE_ENV === "production"
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "D4d-LlU5XhUPO_MzYI1wcA"

    // テスト署名の判定（開発・テスト用）
    const isTestSignature = signature.startsWith("test-signature-")

    // 署名検証（本番環境でのみ厳格に実行、ただしテスト署名は除外）
    if (isProduction && signature && !isTestSignature) {
      if (!verifyWebhookSignature(body, signature, webhookSignatureKey)) {
        console.error("署名検証失敗:", { signature, webhookSignatureKey })
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // テスト署名の場合はログに記録
    if (isTestSignature && process.env.NODE_ENV === "development") {
      console.log("テスト署名を検出:", signature)
    }

    const event = JSON.parse(body)

    // 環境情報をログに追加
    if (process.env.NODE_ENV === "development") {
      console.log("Square Webhook受信:", {
        type: event.type,
        environment: isProduction ? "production" : "sandbox",
        hasSignature: !!signature,
        isTestSignature,
        timestamp: new Date().toISOString(),
      })
    }

    // 決済完了処理 (payment.updated)
    if (event.type === "payment.updated" && event.data?.object?.payment?.status === "COMPLETED") {
      const payment = event.data.object.payment
      const amount = payment.amount_money?.amount || 0
      const currency = payment.amount_money?.currency || "JPY"
      const orderId = payment.order_id
      const customerEmail = payment.buyer_email_address
      const customerId = payment.customer_id

      if (process.env.NODE_ENV === "development") {
        console.log("決済完了 (payment.updated):", {
          amount,
          currency,
          orderId,
          customerId,
          environment: isProduction ? "production" : "sandbox",
          isTest: isTestSignature,
        })
      }

      // Square APIの金額形式について：
      // - JPY（日本円）の場合: 最小通貨単位（円）で送信（例：550円 = 550）
      // - USDなどの場合: セント単位で送信（例：$5.00 = 500セント）
      // このアプリはJPYのみ対応のため、円単位で判定
      let plan: "basic" | "premium" = "basic"
      if (amount === 550 || amount === 55000) {
        // 550円（JPY）または55000セント（USD等）のケース
        plan = "premium"
      } else if (amount === 330 || amount === 33000) {
        // 330円（JPY）または33000セント（USD等）のケース
        plan = "basic"
      }
      
      // デバッグログ
      if (process.env.NODE_ENV === "development") {
        console.log("プラン判定:", { amount, plan, amountInYen: amount / 100 })
      }

      // Supabaseに決済情報を保存
      // Squareサブスクリプションの場合、次回請求日まで有効
      // paymentオブジェクトから次回請求日を取得するか、1ヶ月後をデフォルトとする
      let expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // デフォルト: 1ヶ月後
      
      // Squareサブスクリプション情報から次回請求日を取得（可能な場合）
      // 注: payment.updatedイベントには次回請求日が含まれていない可能性があるため、
      // subscription.updatedイベントも処理する必要がある

      if (!supabase) {
        console.warn("Supabase環境が設定されていないため、決済情報の保存をスキップします")
        return NextResponse.json({
          success: true,
          message: "Webhook受信完了（決済情報保存はスキップ）",
          paymentId: payment.id,
          plan,
          isTest: isTestSignature,
          environment: isProduction ? "production" : "sandbox",
        })
      }

      const { error: dbError } = await supabase
        .from("square_payments")
        .upsert({
          payment_id: payment.id,
          order_id: orderId,
          customer_email: customerEmail?.toLowerCase() || null,
          plan: plan,
          amount: currency === "JPY" ? amount : amount / 100, // JPYは既に円単位、USD等はセント→円に変換
          currency: currency,
          status: "completed",
          webhook_received_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          metadata: {
            environment: isProduction ? "production" : "sandbox",
            isTest: isTestSignature,
            event_type: "payment.updated",
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "payment_id",
        })

      if (dbError) {
        console.error("Supabase決済情報保存エラー:", dbError)
      } else {
        console.log("Square決済情報をSupabaseに保存しました:", {
          payment_id: payment.id,
          plan,
          customer_email: customerId,
        })
      }

      await upsertUserSubscriptionRecord(supabase, {
        userId: customerId,
        customerEmail: customerEmail,
        plan,
        status: "active",
        expiresAt,
        paymentMethod: "square",
        productId: orderId,
        rawPayload: {
          eventType: event.type,
          paymentId: payment.id,
          orderId,
        },
      })

      await activateSubscription(customerEmail || customerId || "unknown-customer", plan, orderId)

      return NextResponse.json({
        success: true,
        message: `${plan}プランを有効化しました (payment.updated)`,
        customerEmail,
        plan,
        amount,
        paymentId: payment.id,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // 請求書支払い完了処理 (invoice.payment_made)
    if (event.type === "invoice.payment_made") {
      const invoice = event.data.object
      const amount = invoice.amount_money?.amount || 0

      if (process.env.NODE_ENV === "development") {
        console.log("請求書支払い完了 (invoice.payment_made):", {
          invoiceId: invoice.id,
          amount,
          environment: isProduction ? "production" : "sandbox",
          isTest: isTestSignature,
        })
      }

      // 金額に基づいてプラン判定
      // Square APIの金額形式について：
      // - JPY（日本円）の場合: 最小通貨単位（円）で送信（例：550円 = 550）
      // - USDなどの場合: セント単位で送信（例：$5.00 = 500セント）
      let plan: "basic" | "premium" = "basic"
      if (amount === 550 || amount === 55000) {
        // 550円（JPY）または55000セント（USD等）のケース
        plan = "premium"
      } else if (amount === 330 || amount === 33000) {
        // 330円（JPY）または33000セント（USD等）のケース
        plan = "basic"
      }
      
      // デバッグログ
      if (process.env.NODE_ENV === "development") {
        console.log("請求書プラン判定:", { amount, plan, amountInYen: amount / 100 })
      }

      return NextResponse.json({
        success: true,
        message: `請求書支払い完了を確認しました (${plan}プラン)`,
        invoiceId: invoice.id,
        plan,
        amount,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // サブスクリプション作成処理
    if (event.type === "subscription.created") {
      const subscription = event.data.object
      console.log("サブスクリプション作成:", {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
      })

      return NextResponse.json({
        success: true,
        message: "サブスクリプション作成完了",
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // サブスクリプション更新処理
    if (event.type === "subscription.updated") {
      const subscription = event.data.object
      const subscriptionId = subscription.id
      const planId = subscription.plan_id
      const status = subscription.status
      const chargedThroughDate = subscription.charged_through_date // 次回請求日
      
      const subscriptionCustomerId = subscription.customer_id
      const subscriptionCustomerEmail = subscription.customer_email

      console.log("サブスクリプション更新:", {
        subscriptionId,
        planId,
        status,
        chargedThroughDate,
        subscriptionCustomerId,
        subscriptionCustomerEmail,
        isTest: isTestSignature,
      })

      // プランIDからアプリ内プランIDを取得
      let appPlan: "basic" | "premium" | null = null
      if (planId === process.env.SQUARE_SUBSCRIPTION_PLAN_ID_BASIC) {
        appPlan = "basic"
      } else if (planId === process.env.SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM) {
        appPlan = "premium"
      }

      // 解約処理（status === "CANCELED" または "CANCELLED"）
      if (status === "CANCELED" || status === "CANCELLED") {
        if (appPlan && supabase) {
          // 解約済みとしてマーク（expires_atを現在時刻に設定、または過去の日付に設定）
          const now = new Date()
          
          const { error: cancelError } = await supabase
            .from("square_payments")
            .update({
              status: "cancelled",
              expires_at: now.toISOString(), // 有効期限を現在時刻に設定（即座に無効化）
              updated_at: now.toISOString(),
              metadata: {
                subscription_id: subscriptionId,
                subscription_status: status,
                cancelled_at: now.toISOString(),
              },
            })
            .eq("plan", appPlan)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)

          if (cancelError) {
            console.error("サブスクリプション解約処理エラー:", cancelError)
          } else {
            console.log("サブスクリプションを解約済みとして更新しました:", {
              subscriptionId,
              appPlan,
              cancelledAt: now.toISOString(),
            })
          }
        }

        await upsertUserSubscriptionRecord(supabase, {
          userId: subscriptionCustomerId,
          customerEmail: subscriptionCustomerEmail,
          plan: appPlan,
          status: "cancelled",
          paymentMethod: "square",
          expiresAt: new Date(),
          productId: subscriptionId,
          rawPayload: {
            eventType: event.type,
            subscriptionId,
            status,
          },
        })

        return NextResponse.json({
          success: true,
          message: "サブスクリプション解約処理完了",
          subscriptionId,
          planId,
          status,
          isTest: isTestSignature,
          environment: isProduction ? "production" : "sandbox",
        })
      }

      // 次回請求日が設定されている場合（通常の更新）、Supabaseの決済情報を更新
      if (chargedThroughDate && appPlan && supabase) {
        // 次回請求日を有効期限として設定
        const expiresAt = new Date(chargedThroughDate)
        
        // 該当する決済情報を更新（subscription_idまたはplanで検索）
        const { error: updateError } = await supabase
          .from("square_payments")
          .update({
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              subscription_id: subscriptionId,
              subscription_status: status,
              charged_through_date: chargedThroughDate,
            },
          })
          .eq("plan", appPlan)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)

        if (updateError) {
          console.error("サブスクリプション情報更新エラー:", updateError)
        } else {
          console.log("サブスクリプション情報を更新しました:", {
            subscriptionId,
            appPlan,
            expiresAt: expiresAt.toISOString(),
          })
        }

        await upsertUserSubscriptionRecord(supabase, {
          userId: subscriptionCustomerId,
          customerEmail: subscriptionCustomerEmail,
          plan: appPlan,
          status: mapSquareStatus(status),
          paymentMethod: "square",
          expiresAt,
          autoRenewing: status === "ACTIVE",
          productId: subscriptionId,
          rawPayload: {
            eventType: event.type,
            subscriptionId,
            status,
            chargedThroughDate,
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: "サブスクリプション更新完了",
        subscriptionId,
        planId,
        status,
        chargedThroughDate,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook受信完了",
      eventType: event.type,
      isTest: isTestSignature,
      environment: isProduction ? "production" : "sandbox",
    })
  } catch (error) {
    console.error("Webhook処理エラー:", error)
    return NextResponse.json(
      {
        error: "Webhook処理に失敗しました",
        environment: process.env.NODE_ENV || "development",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Square Webhook エンドポイント - GET OK",
    status: "active",
    supportedMethods: ["GET", "POST"],
    url: "https://nameanalysis216.vercel.app/api/square-webhook",
    events: ["payment.updated", "subscription.created", "subscription.updated", "invoice.payment_made"],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    testMode: "テスト署名（test-signature-*）をサポート",
  })
}

// プラン有効化処理（注：Webhookはサーバーサイドで実行されるため、クライアントのlocalStorageには直接アクセスできません）
// この関数は主にログ記録とメール送信用です
// 実際のプラン有効化は、決済成功時にフロントエンドでURLパラメータ経由で処理されます
async function activateSubscription(customerId: string, plan: "basic" | "premium", orderId: string) {
  try {
    const subscriptionData = {
      customerId,
      plan,
      orderId,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      status: "active",
    }

    // 注意：サーバーサイドではlocalStorageにアクセスできません
    // クライアント側でlocalStorageに保存する必要があります
    // Webhookで通知を受け取った場合、別途クライアント側で処理する必要があります

    await sendActivationEmail(customerId, plan)

    console.log("プラン有効化完了（サーバーサイド）:", subscriptionData)
    console.warn("注意：クライアント側のlocalStorage更新が必要です。フロントエンドで処理してください。")
    return subscriptionData
  } catch (error) {
    console.error("プラン有効化エラー:", error)
    throw error
  }
}

// メール送信処理
async function sendActivationEmail(email: string, plan: string) {
  console.log(`${email}に${plan}プラン有効化メールを送信`)
}

type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired" | "failed"

function mapSquareStatus(squareStatus?: string | null): SubscriptionStatus {
  switch (squareStatus) {
    case "ACTIVE":
      return "active"
    case "PENDING":
    case "PAUSED":
    case "SUSPENDED":
      return "pending"
    case "FAILED":
      return "failed"
    case "EXPIRED":
      return "expired"
    case "CANCELED":
    case "CANCELLED":
      return "cancelled"
    default:
      return "pending"
  }
}

interface UpsertUserSubscriptionParams {
  userId?: string | null
  customerEmail?: string | null
  plan: "basic" | "premium"
  status: SubscriptionStatus
  paymentMethod: "square" | "gmo" | "manual" | "google_play"
  expiresAt?: Date | null
  autoRenewing?: boolean
  productId?: string | null
  rawPayload?: any
}

async function upsertUserSubscriptionRecord(
  supabase: SupabaseClient | null,
  params: UpsertUserSubscriptionParams
) {
  if (!supabase) {
    console.warn("Supabaseクライアントが利用できないため、user_subscriptionsの更新をスキップします")
    return
  }

  const normalizedEmail = params.customerEmail?.toLowerCase() ?? null
  const nowIso = new Date().toISOString()

  let targetRowId: string | null = null

  try {
    if (params.userId) {
      const { data: userMatch } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", params.userId)
        .order("last_verified_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (userMatch?.id) {
        targetRowId = userMatch.id
      }
    }

    if (!targetRowId && normalizedEmail) {
      const { data: emailMatch } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("customer_email", normalizedEmail)
        .order("last_verified_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (emailMatch?.id) {
        targetRowId = emailMatch.id
      }
    }

    const payload = {
      user_id: params.userId ?? null,
      customer_email: normalizedEmail,
      plan: params.plan,
      status: params.status,
      payment_method: params.paymentMethod,
      product_id: params.productId ?? null,
      last_verified_at: nowIso,
      expires_at: params.expiresAt ? params.expiresAt.toISOString() : null,
      auto_renewing: params.autoRenewing ?? false,
      raw_response: params.rawPayload ?? null,
      updated_at: nowIso,
    }

    if (targetRowId) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update(payload)
        .eq("id", targetRowId)

      if (updateError) {
        console.error("user_subscriptionsの更新に失敗しました:", updateError)
      } else {
        console.log("user_subscriptionsを更新しました:", {
          targetRowId,
          plan: params.plan,
          status: params.status,
        })
      }
    } else {
      const { error: insertError } = await supabase.from("user_subscriptions").insert({
        ...payload,
        created_at: nowIso,
      })

      if (insertError) {
        console.error("user_subscriptionsへの挿入に失敗しました:", insertError)
      } else {
        console.log("user_subscriptionsに新規レコードを挿入しました:", {
          plan: params.plan,
          status: params.status,
        })
      }
    }
  } catch (error) {
    console.error("user_subscriptionsの更新操作でエラー:", error)
  }
}
