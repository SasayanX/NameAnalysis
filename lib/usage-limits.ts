// 使用制限の定義
export interface UsageLimits {
  personalAnalysis: number
  companyAnalysis: number
  babyNaming: number
  csvExport: number
  pdfExport: number
}

// プラン別の使用制限
export const PLAN_LIMITS: Record<string, UsageLimits> = {
  free: {
    personalAnalysis: 3,
    companyAnalysis: 2,
    babyNaming: 1,
    csvExport: 0,
    pdfExport: 0,
  },
  basic: {
    personalAnalysis: -1, // 無制限
    companyAnalysis: -1, // 無制限
    babyNaming: -1, // 無制限
    csvExport: 5,
    pdfExport: 3,
  },
  premium: {
    personalAnalysis: -1, // 無制限
    companyAnalysis: -1, // 無制限
    babyNaming: -1, // 無制限
    csvExport: -1, // 無制限
    pdfExport: -1, // 無制限
  },
}

// 使用制限チェック結果
export interface UsageCheckResult {
  allowed: boolean
  limit: number
  remaining: number
  current: number
}

// 使用制限をチェックする関数
export function checkUsageLimit(plan: string, feature: keyof UsageLimits, currentUsage: number): UsageCheckResult {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
  const limit = limits[feature]

  // 無制限の場合
  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      remaining: -1,
      current: currentUsage,
    }
  }

  // 制限がある場合
  const remaining = Math.max(0, limit - currentUsage)
  const allowed = currentUsage < limit

  return {
    allowed,
    limit,
    remaining,
    current: currentUsage,
  }
}

// アップグレードメッセージを取得
export function getUpgradeMessage(feature: keyof UsageLimits, currentPlan: string): string {
  const messages = {
    personalAnalysis: {
      free: "🔒 個人名分析の無料回数を使い切りました。<br/>💎 ベーシックプラン（220円/月）で無制限利用できます。",
      basic: "🔒 個人名分析の制限に達しました。<br/>💎 プレミアムプラン（440円/月）で無制限利用できます。",
    },
    companyAnalysis: {
      free: "🔒 会社名分析の無料回数を使い切りました。<br/>💎 ベーシックプラン（220円/月）で無制限利用できます。",
      basic: "🔒 会社名分析の制限に達しました。<br/>💎 プレミアムプラン（440円/月）で無制限利用できます。",
    },
    babyNaming: {
      free: "👶 赤ちゃん名付けの無料回数を使い切りました。<br/>💎 ベーシックプラン（220円/月）で無制限利用できます。",
      basic: "👶 赤ちゃん名付けの制限に達しました。<br/>💎 プレミアムプラン（440円/月）で無制限利用できます。",
    },
    csvExport: {
      free: "📄 CSVエクスポートは有料プランの機能です。<br/>💎 ベーシックプラン（220円/月）で利用できます。",
      basic: "📄 CSVエクスポートの制限に達しました。<br/>💎 プレミアムプラン（440円/月）で無制限利用できます。",
    },
    pdfExport: {
      free: "💾 PDFエクスポートは有料プランの機能です。<br/>💎 ベーシックプラン（220円/月）で利用できます。",
      basic: "💾 PDFエクスポートの制限に達しました。<br/>💎 プレミアムプラン（440円/月）で無制限利用できます。",
    },
  }

  return (
    messages[feature]?.[currentPlan as keyof (typeof messages)[typeof feature]] ||
    "🚀 より多くの機能を利用するにはアップグレードしてください。"
  )
}

// デバッグ用の関数（開発環境でのみ使用）
export function getDebugInfo() {
  // クライアントサイドでは常にfalseを返す
  const isDevelopment = false

  if (isDevelopment) {
    return {
      environment: "development",
      planLimits: PLAN_LIMITS,
      timestamp: new Date().toISOString(),
    }
  }

  return null
}

// 使用制限の説明を取得
export function getFeatureDescription(feature: keyof UsageLimits): string {
  const descriptions = {
    personalAnalysis: "個人名の姓名判断分析",
    companyAnalysis: "会社名・商品名の分析",
    babyNaming: "赤ちゃん名付けツール",
    csvExport: "分析結果のCSVエクスポート",
    pdfExport: "分析結果のPDFエクスポート",
  }

  return descriptions[feature] || "不明な機能"
}

// プラン名を日本語で取得
export function getPlanDisplayName(plan: string): string {
  const planNames = {
    free: "無料プラン",
    basic: "ベーシックプラン",
    premium: "プレミアムプラン",
  }

  return planNames[plan as keyof typeof planNames] || "不明なプラン"
}
