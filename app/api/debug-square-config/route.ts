import { NextResponse } from "next/server"
import { getCurrentConfig } from "@/lib/square-config"

/**
 * Square設定のデバッグ用エンドポイント
 * 環境変数が正しく読み込まれているか確認できます
 */
export async function GET() {
  try {
    const config = getCurrentConfig()
    
    // 環境変数の生の値を確認（セキュリティのため、Access Tokenは一部のみ表示）
    const envVars = {
      SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT || "未設定",
      SQUARE_APPLICATION_ID: process.env.SQUARE_APPLICATION_ID || "未設定",
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN 
        ? `${process.env.SQUARE_ACCESS_TOKEN.substring(0, 10)}...` 
        : "未設定",
      SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID || "未設定",
      NODE_ENV: process.env.NODE_ENV || "未設定",
    }
    
    return NextResponse.json({
      success: true,
      message: "Square設定のデバッグ情報",
      config: {
        environment: config.environment,
        applicationId: config.applicationId,
        locationId: config.locationId,
        accessToken: config.accessToken 
          ? `${config.accessToken.substring(0, 10)}...` 
          : "未設定",
      },
      envVars,
      warnings: [
        ...(config.accessToken ? [] : ["⚠️ Access Tokenが設定されていません"]),
        ...(config.applicationId ? [] : ["⚠️ Application IDが設定されていません"]),
        ...(config.locationId ? [] : ["⚠️ Location IDが設定されていません"]),
        ...(process.env.SQUARE_ENVIRONMENT !== "sandbox" && process.env.SQUARE_ENVIRONMENT !== "production" 
          ? ["⚠️ SQUARE_ENVIRONMENTがsandboxまたはproductionに設定されていません"] 
          : []),
      ],
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    )
  }
}



