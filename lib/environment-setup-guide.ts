export const environmentSetupGuide = {
  vercel: {
    steps: [
      "1. Vercel Dashboardにログイン",
      "2. プロジェクト → Settings → Environment Variables",
      "3. 以下の環境変数を追加:",
    ],
    variables: {
      SQUARE_APPLICATION_ID: "Square DashboardのApplication ID",
      SQUARE_ACCESS_TOKEN: "Square DashboardのAccess Token（本番用）",
      SQUARE_LOCATION_ID: "Square DashboardのLocation ID",
      SQUARE_WEBHOOK_SIGNATURE_KEY: "Webhook設定時に生成される署名キー",
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: "フロントエンド用（同じApplication ID）",
      NEXT_PUBLIC_SQUARE_LOCATION_ID: "フロントエンド用（同じLocation ID）",
    },
  },

  square: {
    setup: [
      "1. https://developer.squareup.com/ にアクセス",
      "2. アプリケーション作成",
      "3. サンドボックス → 本番環境に切り替え",
      "4. Webhooks設定でエンドポイント追加: https://yourdomain.com/api/square-webhook",
      "5. サブスクリプションプラン作成",
    ],
  },
}

export function getSetupInstructions() {
  return {
    message: "マネタイズ化の設定手順",
    steps: [
      "Square Developer設定完了",
      "Vercel環境変数設定",
      "サンドボックステスト実行",
      "本番環境デプロイ",
      "決済フローテスト",
    ],
  }
}
