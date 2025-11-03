/**
 * Square側で作成したサブスクリプションプランIDと
 * アプリ内のプランIDのマッピング
 */

/**
 * アプリ内のプランIDからSquare側のplan_idを取得
 * 環境変数で設定するか、ここで直接指定
 */
export function getSquarePlanId(appPlanId: "basic" | "premium"): string {
  // 環境変数から取得（優先）
  if (appPlanId === "basic") {
    return process.env.SQUARE_SUBSCRIPTION_PLAN_ID_BASIC || ""
  }
  if (appPlanId === "premium") {
    return process.env.SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM || ""
  }
  
  // フォールバック（環境変数が設定されていない場合）
  // Square側で作成したplan_idをここに設定してください
  const defaultMapping: Record<string, string> = {
    basic: "", // Square側のベーシックプランのplan_idを設定
    premium: "", // Square側のプレミアムプランのplan_idを設定
  }
  
  return defaultMapping[appPlanId] || ""
}

/**
 * Square側のplan_idからアプリ内のプランIDを取得（逆マッピング）
 */
export function getAppPlanId(squarePlanId: string): "basic" | "premium" | null {
  // 環境変数から逆引き
  if (squarePlanId === process.env.SQUARE_SUBSCRIPTION_PLAN_ID_BASIC) {
    return "basic"
  }
  if (squarePlanId === process.env.SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM) {
    return "premium"
  }
  
  return null
}

/**
 * 設定が正しいか検証
 */
export function validateSquarePlanMapping(): {
  isValid: boolean
  missingPlans: string[]
} {
  const missingPlans: string[] = []
  
  if (!process.env.SQUARE_SUBSCRIPTION_PLAN_ID_BASIC) {
    missingPlans.push("SQUARE_SUBSCRIPTION_PLAN_ID_BASIC")
  }
  
  if (!process.env.SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM) {
    missingPlans.push("SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM")
  }
  
  return {
    isValid: missingPlans.length === 0,
    missingPlans,
  }
}
