import { type NextRequest, NextResponse } from "next/server"
import { getCurrentConfig, getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Square Cards APIを使用してカードを登録
 * Web Payments SDKで取得したcard nonceを使ってカードを登録し、cardIdを取得します
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardNonce, customerId } = body

    if (!cardNonce) {
      return NextResponse.json(
        { success: false, error: "cardNonceが必要です" },
        { status: 400 }
      )
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerIdが必要です" },
        { status: 400 }
      )
    }

    const config = getCurrentConfig()

    // Square Cards APIでカードを登録
    const apiEndpoint = getSquareApiEndpoint()
    
    // Square Cards APIのリクエストボディ
    // 最新のAPI仕様に基づいて構造を修正
    const requestBody = {
      source_id: cardNonce, // Web Payments SDKで取得したnonce
      card: {
        customer_id: customerId,
      },
      idempotency_key: `card_${customerId}_${Date.now()}`, // べき等性キーを追加
    }

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Cards API] Request URL:", `${apiEndpoint}/cards`)
      console.log("[Square Cards API] Request body:", JSON.stringify(requestBody, null, 2))
    }

    const response = await fetch(`${apiEndpoint}/cards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18", // Square API バージョン
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    let result: any
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("[Square Cards API] JSON解析失敗:", responseText)
      return NextResponse.json(
        {
          success: false,
          error: "Square APIからのレスポンスの解析に失敗しました",
          responseText: responseText.substring(0, 500),
        },
        { status: response.status }
      )
    }

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Cards API] Response status:", response.status)
      console.log("[Square Cards API] Response body:", JSON.stringify(result, null, 2))
      if (!response.ok) {
        console.error("[Square Cards API] Error details:")
        console.error("  - Status:", response.status)
        console.error("  - Errors:", result.errors)
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: any, index: number) => {
            console.error(`  - Error ${index + 1}:`, error.code, error.detail, error.field)
          })
        }
      }
    }

    if (!response.ok) {
      console.error("Square Cards API error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0]?.detail || "カード登録に失敗しました",
          squareErrors: result.errors,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      cardId: result.card.id, // このIDをサブスクリプション作成で使用
      card: result.card,
    })
  } catch (error) {
    console.error("Card creation error:", error)
    return NextResponse.json(
      { success: false, error: "カード登録処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}

