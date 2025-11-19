import { type NextRequest, NextResponse } from "next/server"
import { getCurrentConfig, getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Square Customers APIを使用して顧客を作成
 * メールアドレスから顧客を作成または取得します
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, givenName, familyName } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: "emailが必要です" },
        { status: 400 }
      )
    }

    const config = getCurrentConfig()
    
    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Customers API] Environment:", config.environment)
      console.log("[Square Customers API] Application ID:", config.applicationId)
      console.log("[Square Customers API] Location ID:", config.locationId)
      console.log("[Square Customers API] Access Token (first 10 chars):", config.accessToken?.substring(0, 10) + "...")
      console.log("[Square Customers API] SQUARE_ENVIRONMENT env var:", process.env.SQUARE_ENVIRONMENT)
    }

    if (!config.accessToken) {
      console.error("[Square Customers API] Access Token is missing!")
      return NextResponse.json(
        {
          success: false,
          error: "Square Access Tokenが設定されていません。.env.localにSQUARE_ENVIRONMENT=sandboxとSQUARE_ACCESS_TOKENを設定してください。",
        },
        { status: 500 }
      )
    }

    // Square Customers APIで顧客を作成
    const requestBody = {
      given_name: givenName || "名",
      family_name: familyName || "姓",
      email_address: email,
      idempotency_key: `customer_${email}_${Date.now()}`,
    }

    const apiEndpoint = getSquareApiEndpoint()
    
    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Customers API] Request URL:", `${apiEndpoint}/customers`)
      console.log("[Square Customers API] Request body:", JSON.stringify(requestBody, null, 2))
      console.log("[Square Customers API] Authorization header:", `Bearer ${config.accessToken.substring(0, 20)}...`)
    }

    const response = await fetch(`${apiEndpoint}/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18", // Square API バージョン
      },
      body: JSON.stringify(requestBody),
    })

    // レスポンスのテキストを先に取得（JSON解析に失敗する可能性があるため）
    const responseText = await response.text()
    let result: any
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      // JSON解析に失敗した場合
      console.error("[Square Customers API] JSON解析失敗:", responseText)
      return NextResponse.json(
        {
          success: false,
          error: "Square APIからのレスポンスの解析に失敗しました",
          responseText: responseText.substring(0, 500), // 最初の500文字のみ
        },
        { status: response.status }
      )
    }

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Customers API] Response status:", response.status)
      console.log("[Square Customers API] Response body:", JSON.stringify(result, null, 2))
      if (!response.ok) {
        console.error("[Square Customers API] Error details:")
        console.error("  - Status:", response.status)
        console.error("  - Errors:", result.errors)
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: any, index: number) => {
            console.error(`  - Error ${index + 1}:`, error.code, error.detail)
          })
        }
      }
    }

    if (!response.ok) {
      // 既に存在する顧客の場合は、検索して返す
      if (result.errors?.[0]?.code === "DUPLICATE_EMAIL") {
        // 顧客を検索
        const apiEndpoint = getSquareApiEndpoint()
        const searchResponse = await fetch(`${apiEndpoint}/customers/search`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
          },
          body: JSON.stringify({
            query: {
              filter: {
                email_address: {
                  exact: email,
                },
              },
            },
          }),
        })

        const searchResult = await searchResponse.json()
        if (searchResult.customers && searchResult.customers.length > 0) {
          return NextResponse.json({
            success: true,
            customerId: searchResult.customers[0].id,
            customer: searchResult.customers[0],
            isExisting: true,
          })
        }
      }

      console.error("Square Customers API error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0]?.detail || "顧客作成に失敗しました",
          squareErrors: result.errors,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      customerId: result.customer.id,
      customer: result.customer,
      isExisting: false,
    })
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json(
      { success: false, error: "顧客作成処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}

