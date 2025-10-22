# Vercel デプロイ設定ガイド

## 1. 環境変数設定

Vercel Dashboard → Project → Settings → Environment Variables

### 必須環境変数

\`\`\`bash
# Square 本番環境
SQUARE_APPLICATION_ID=sq0idp-wGVapF8sNt9PLrdj5znuKA
SQUARE_ACCESS_TOKEN=EAAAExxxxxx（Square Dashboardから取得）
SQUARE_LOCATION_ID=LMxxxxxx（Square Dashboardから取得）
SQUARE_WEBHOOK_SIGNATURE_KEY=xxxxxx（Webhook設定時に取得）

# フロントエンド用（Public）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-wGVapF8sNt9PLrdj5znuKA
NEXT_PUBLIC_SQUARE_LOCATION_ID=LMxxxxxx
\`\`\`

## 2. デプロイ手順

1. GitHub にコードをプッシュ
2. Vercel で自動デプロイ実行
3. 環境変数が正しく設定されているか確認
4. デプロイ完了後、URLを確認

## 3. Webhook URL更新

デプロイ完了後：
1. Square Dashboard → Webhooks
2. エンドポイントURL を更新: `https://your-domain.vercel.app/api/square-webhook`
3. テストWebhookを送信して動作確認

## 4. 動作確認

- `/payment-test` ページでテスト決済実行
- Webhook が正常に受信されるか確認
- サブスクリプション作成・キャンセルをテスト
