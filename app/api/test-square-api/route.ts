import { NextResponse } from "next/server"
import { getCurrentConfig, getSquareApiEndpoint } from "@/lib/square-config"

/**
 * Square APIの接続テスト用エンドポイント
 * Access Tokenが有効かどうかを確認します
 */
export async function GET() {
  try {
    const config = getCurrentConfig()
    
    if (!config.accessToken) {
      return NextResponse.json({
        success: false,
        error: "Access Tokenが設定されていません",
      })
    }

    // Square APIのLocationsエンドポイントをテスト（認証が必要な最もシンプルなエンドポイント）
    const apiEndpoint = getSquareApiEndpoint()
    const response = await fetch(`${apiEndpoint}/locations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
      },
    })

    const responseText = await response.text()
    let result: any
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "JSON解析に失敗しました",
        status: response.status,
        responseText: responseText.substring(0, 500),
      })
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Square API認証エラー",
        status: response.status,
        errors: result.errors || [],
        fullResponse: result,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Square API接続成功",
      status: response.status,
      locations: result.locations || [],
      locationCount: result.locations?.length || 0,
    })
  } catch (error) {
    console.error("Square API test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    )
  }
}

