// Square設定情報（本番環境対応）
export const squareConfig = {
  // Sandbox（テスト環境）
  sandbox: {
    applicationId: "sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw", // ✅ 確認済み
    accessToken: "EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe", // ✅ 確認済み
    environment: "sandbox",
    webhookSignatureKey: "D4d-LlU5XhUPO_MzYI1wcA",
    locationId: "LYGVDVHKBNYZC", // ✅ Sandbox Location ID確認済み
    apiEndpoint: "https://connect.squareupsandbox.com/v2", // ✅ Sandbox環境用エンドポイント
  },

  // Production（本番環境）- 承認済み設定
  production: {
    applicationId: "sq0idp-CbbdF82IxFWDSqf8D2S0Pw",
    accessToken: "EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG",
    environment: "production",
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "",
    locationId: "L0YH3ASTVNNMA8999",
    apiEndpoint: "https://connect.squareup.com/v2", // ✅ Production環境用エンドポイント
  },
}

export const getCurrentConfig = () => {
  // 環境変数 SQUARE_ENVIRONMENT で明示的に指定可能
  const envMode = process.env.SQUARE_ENVIRONMENT?.toLowerCase()
  
  // デバッグログ（開発環境のみ）
  if (process.env.NODE_ENV !== "production") {
    console.log("[Square Config] SQUARE_ENVIRONMENT:", envMode)
    console.log("[Square Config] NODE_ENV:", process.env.NODE_ENV)
    console.log("[Square Config] SQUARE_ACCESS_TOKEN exists:", !!process.env.SQUARE_ACCESS_TOKEN)
    console.log("[Square Config] SQUARE_APPLICATION_ID:", process.env.SQUARE_APPLICATION_ID ? "exists" : "not set")
    console.log("[Square Config] SQUARE_LOCATION_ID:", process.env.SQUARE_LOCATION_ID ? "exists" : "not set")
  }
  
  // 環境変数から設定を取得（優先）
  const envAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const envApplicationId = process.env.SQUARE_APPLICATION_ID
  const envLocationId = process.env.SQUARE_LOCATION_ID
  
  // 環境判定
  let baseConfig
  if (envMode === "production" || envMode === "prod") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Config] Using production config (explicit)")
    }
    baseConfig = squareConfig.production
  } else if (envMode === "sandbox" || envMode === "test") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Config] Using sandbox config (explicit)")
    }
    baseConfig = squareConfig.sandbox
  } else if (process.env.NODE_ENV === "production" && envAccessToken) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Config] Using production config (fallback)")
    }
    baseConfig = squareConfig.production
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Square Config] Using sandbox config (default)")
    }
    baseConfig = squareConfig.sandbox
  }
  
  // 環境変数が設定されている場合は、それらを優先的に使用
  return {
    ...baseConfig,
    environment: baseConfig.environment, // 環境情報を明示的に含める
    accessToken: envAccessToken || baseConfig.accessToken,
    applicationId: envApplicationId || baseConfig.applicationId,
    locationId: envLocationId || baseConfig.locationId,
    // apiEndpointは環境に応じて自動設定（環境変数で上書き不可）
    apiEndpoint: baseConfig.apiEndpoint,
  }
}

/**
 * Square APIのベースURLを取得（環境に応じて自動切り替え）
 */
export function getSquareApiEndpoint(): string {
  const config = getCurrentConfig()
  return config.apiEndpoint
}

// マネタイズ用の料金設定
export const pricingConfig = {
  basic: {
    monthlyPrice: 330, // 330円/月
    yearlyPrice: 3300, // 年額（2ヶ月分OFF想定）
    planId: "basic-monthly",
    yearlyPlanId: "basic-yearly",
  },
  premium: {
    monthlyPrice: 550, // 550円/月
    yearlyPrice: 5500, // 年額（2ヶ月分OFF想定）
    planId: "premium-monthly",
    yearlyPlanId: "premium-yearly",
  },
}

// 本番環境チェック
export const isProduction = () => process.env.NODE_ENV === "production"

/**
 * Square Web Payments SDKのURLを取得（環境に応じて自動切り替え）
 */
export function getSquareSDKUrl(): string {
  const isSandbox = process.env.SQUARE_ENVIRONMENT === "sandbox" || 
                    (process.env.NODE_ENV !== "production" && !process.env.SQUARE_ACCESS_TOKEN)
  
  return isSandbox
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js"
}

/**
 * Square Application IDを取得（環境に応じて自動切り替え）
 * サーバー側で使用
 */
export function getSquareApplicationId(): string {
  const config = getCurrentConfig()
  return config.applicationId
}

/**
 * Square Application IDを取得（クライアント側用）
 * 環境変数が設定されている場合はそれを使用、なければ環境に応じて自動判定
 */
export function getSquareApplicationIdClient(): string {
  // 環境変数が明示的に設定されている場合はそれを使用
  if (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID) {
    return process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  }
  
  // 環境変数が未設定の場合は、環境に応じてデフォルト値を返す
  // Sandbox環境の判定（クライアント側では環境変数を直接読めないため、Application IDの形式で判定）
  const envAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const isSandbox = envAppId.startsWith("sandbox-sq0idb-") || 
                    (!envAppId && process.env.NODE_ENV !== "production")
  
  return isSandbox
    ? squareConfig.sandbox.applicationId
    : squareConfig.production.applicationId
}

/**
 * Square Location IDを取得（環境に応じて自動切り替え）
 */
export function getSquareLocationId(): string {
  const config = getCurrentConfig()
  return config.locationId
}
