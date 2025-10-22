export const deploymentChecklist = {
  environment: {
    required: ["SQUARE_APPLICATION_ID", "SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID", "SQUARE_WEBHOOK_SIGNATURE_KEY"],
    optional: ["NEXT_PUBLIC_SQUARE_APPLICATION_ID", "NEXT_PUBLIC_SQUARE_LOCATION_ID"],
  },

  squareSetup: {
    steps: [
      "Square Developerアカウント作成",
      "アプリケーション作成",
      "サンドボックス→本番環境切り替え",
      "Webhook URL設定",
      "サブスクリプションプラン作成",
    ],
  },

  testing: {
    required: ["サンドボックス決済テスト", "Webhook動作確認", "サブスクリプション作成テスト", "キャンセル処理テスト"],
  },
}

export function validateEnvironment() {
  const missing = deploymentChecklist.environment.required.filter((key) => !process.env[key])

  return {
    isValid: missing.length === 0,
    missing,
  }
}
