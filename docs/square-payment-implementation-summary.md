# Square決済実装サマリー

## 🎯 実装した改善内容

### 1. Supabaseに決済情報を保存

**問題**: Webhookはサーバー側で実行されるため、クライアント側の`localStorage`に直接書き込めない

**解決策**: 
- `square_payments`テーブルをSupabaseに作成
- Webhookで受け取った決済情報をSupabaseに保存
- フロントエンドでSupabaseから決済情報を取得してプランを有効化

**ファイル**:
- `scripts/create-square-payments-table.sql`: テーブル作成SQL
- `app/api/square-webhook/route.ts`: WebhookでSupabaseに保存
- `app/api/square-payments/check/route.ts`: 決済情報取得API
- `app/my-subscription/page.tsx`: 決済状況確認・有効化UI

### 2. 決済状況確認APIの実装

**問題**: `/my-subscription`の「決済状況を確認」ボタンが実際のSquare APIを呼び出していない

**解決策**:
- `/api/square-payments/check`エンドポイントを作成
- メールアドレスで決済情報を検索
- 見つかった決済情報を元にプランを自動有効化

## 📋 セットアップ手順

### ステップ1: Supabaseテーブルの作成

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `scripts/create-square-payments-table.sql`の内容を実行

### ステップ2: 環境変数の確認

以下の環境変数が設定されているか確認：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # または NEXT_PUBLIC_SUPABASE_ANON_KEY
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-signature-key
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/6sJ33DdY
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/TjSKFJhj
```

### ステップ3: Square Webhookの設定

1. Squareダッシュボードにログイン
2. 設定 > アプリケーション > Webhooks
3. Webhook URLを設定: `https://your-domain.com/api/square-webhook`
4. イベントを選択: `payment.updated`, `invoice.payment_made`

## 🧪 動作確認方法

### テスト1: Webhookの動作確認

```bash
curl -X POST http://localhost:3000/api/square-webhook \
  -H "Content-Type: application/json" \
  -H "x-square-signature: test-signature-payment" \
  -d '{
    "type": "payment.updated",
    "data": {
      "object": {
        "payment": {
          "id": "test-payment-id",
          "status": "COMPLETED",
          "amount_money": {
            "amount": 33000,
            "currency": "JPY"
          },
          "order_id": "test-order-id",
          "buyer_email_address": "test@example.com"
        }
      }
    }
  }'
```

### テスト2: 実際の決済テスト

1. `/pricing`ページにアクセス
2. 「ベーシックプラン」または「プレミアムプラン」をクリック
3. Square Payment Linkで決済を完了（テストカードを使用）
4. **重要**: Square側でメールアドレスを入力
5. `/my-subscription?email=your@email.com`にアクセス
6. 「決済状況を確認」ボタンをクリック
7. プランが有効化されることを確認

### テスト3: Supabaseで決済情報を確認

```sql
-- Supabase SQL Editorで実行
SELECT * FROM square_payments 
ORDER BY created_at DESC 
LIMIT 10;
```

## ⚠️ 注意事項

### 1. メールアドレスの収集

**現在の実装**: Square Payment Linkで決済する際に、Square側でメールアドレスを入力してもらう必要があります。

**改善案**:
- 決済完了後にメールアドレス入力フォームを表示
- Square Checkout APIを使用してカスタムフィールドを追加
- セッションIDベースの識別を実装（認証システムと連携）

### 2. 金額判定ロジック

**現在の実装**: セント単位と円単位の両方に対応していますが、実際のSquare APIの動作を確認する必要があります。

**確認方法**:
- Webhookのログで実際の金額を確認
- 必要に応じて金額判定ロジックを修正

### 3. プラン有効期限

**現在の実装**: 決済完了から30日後に自動的に有効期限が切れる設定になっています。

**改善案**:
- 定期課金の場合は、次の請求日まで有効期限を延長
- 有効期限切れの通知機能を追加

## 🔄 動作フロー

```
1. ユーザーが決済リンクをクリック
   ↓
2. Square Payment Linkにリダイレクト
   ↓
3. Square側で決済完了（メールアドレス入力）
   ↓
4. Square Webhookが送信される
   ↓
5. WebhookでSupabaseに決済情報を保存
   ↓
6. ユーザーが「決済状況を確認」ボタンをクリック
   ↓
7. APIから決済情報を取得
   ↓
8. localStorageにプラン情報を保存
   ↓
9. プランが有効化される
```

## 📊 データベーススキーマ

```sql
square_payments
├── id (uuid, primary key)
├── payment_id (text, unique) -- Squareのpayment.id
├── order_id (text)
├── customer_email (text) -- 購入者のメールアドレス
├── plan (text) -- 'basic' | 'premium'
├── amount (int) -- 金額（円単位）
├── currency (text) -- 'JPY'
├── status (text) -- 'pending' | 'completed' | 'failed'
├── webhook_received_at (timestamptz)
├── activated_at (timestamptz) -- プラン有効化時刻
├── expires_at (timestamptz) -- プラン有効期限
├── metadata (jsonb)
└── created_at, updated_at (timestamptz)
```

## 🚀 次の改善案

1. **自動ポーリング機能**: 決済完了後、一定時間内に自動的に決済状況を確認
2. **決済履歴の表示**: `/my-subscription`ページで決済履歴を表示
3. **エラーハンドリング強化**: より詳細なエラーメッセージとログ記録
4. **メール通知**: 決済完了時にユーザーにメール通知を送信

