// Square設定情報（本番環境対応）
export const squareConfig = {
  // Sandbox（テスト環境）
  sandbox: {
    applicationId: "sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw",
    accessToken: "EAAAl-F3wQmfHjM_5_t4iO0gNpP2JCdU38sjHdWVG7BKj7M594kf5O-21dCwgUXe",
    environment: "sandbox",
    webhookSignatureKey: "D4d-LlU5XhUPO_MzYI1wcA",
    locationId: "sandbox-location-id",
  },

  // Production（本番環境）- 承認済み設定
  production: {
    applicationId: "sq0idp-CbbdF82IxFWDSqf8D2S0Pw",
    accessToken: "EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG",
    environment: "production",
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "",
    locationId: "L0YH3ASTVNNMA8999",
  },
}

export const getCurrentConfig = () => {
  // サンドボックス環境を優先（テスト用）
  return process.env.NODE_ENV === "production" && process.env.SQUARE_ACCESS_TOKEN
    ? squareConfig.production
    : squareConfig.sandbox
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
