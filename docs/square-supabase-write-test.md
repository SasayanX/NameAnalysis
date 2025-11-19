# Square決済成功後のSupabase書き込みテスト

サンドボックスで決済が成功した後、Supabaseへの書き込みをテストする方法を説明します。

## 📋 実装内容

1. **`/api/square-subscription/create`** - 決済成功時に自動的にSupabaseに書き込み
2. **`/api/test-square-supabase-write`** - 手動でSupabaseへの書き込みをテストするエンドポイント

## 🧪 テスト方法

### 方法1: 実際の決済フローでテスト

1. サンドボックスで決済を実行
2. 決済成功後、`/api/square-subscription/create`が自動的にSupabaseに書き込みます
3. ブラウザのコンソールでログを確認：
   ```
   [Square Subscription] Supabase挿入成功: {...}
   [Square Subscription] square_paymentsに保存成功
   ```

### 方法2: テスト用エンドポイントで手動テスト

ブラウザのコンソールまたはPostmanで以下のリクエストを送信：

```javascript
// ブラウザコンソールで実行
fetch('/api/test-square-supabase-write', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerEmail: 'test@example.com',
    planId: 'basic', // または 'premium'
    subscriptionId: 'test_subscription_123', // オプション
    customerId: 'test_customer_123', // オプション
    cardId: 'test_card_123', // オプション
  }),
})
  .then(res => res.json())
  .then(data => console.log('✅ 結果:', data))
  .catch(err => console.error('❌ エラー:', err))
```

## 📊 保存されるデータ

### `user_subscriptions`テーブル

- `customer_email`: 顧客のメールアドレス（小文字に変換）
- `plan`: 'basic' または 'premium'
- `status`: 'active' または 'pending'
- `payment_method`: 'square'
- `product_id`: SquareサブスクリプションID
- `expires_at`: 1ヶ月後の日時
- `auto_renewing`: true
- `raw_response`: サブスクリプション情報のJSON

### `square_payments`テーブル

- `payment_id`: `subscription_{subscriptionId}`
- `order_id`: サブスクリプションID
- `customer_email`: 顧客のメールアドレス
- `plan`: 'basic' または 'premium'
- `amount`: 330（basic）または 550（premium）
- `currency`: 'JPY'
- `status`: 'completed'
- `expires_at`: 1ヶ月後の日時
- `metadata`: サブスクリプション情報のJSON

## 🔍 確認方法

### Supabaseダッシュボードで確認

1. Supabaseダッシュボードにログイン
2. Table Editorで以下のテーブルを確認：
   - `user_subscriptions`
   - `square_payments`

### APIで確認

```javascript
// user_subscriptionsを確認
fetch('/api/subscriptions/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerEmail: 'test@example.com',
  }),
})
  .then(res => res.json())
  .then(data => console.log('サブスクリプション:', data))
```

## ⚠️ 注意事項

1. **環境変数**: `SUPABASE_SERVICE_ROLE_KEY`が設定されている必要があります
2. **RLS**: サービスロールキーを使用しているため、RLSポリシーをバイパスします
3. **重複チェック**: `customer_email`と`plan`の組み合わせで既存レコードを検索し、存在する場合は更新、存在しない場合は新規作成します

## 🐛 トラブルシューティング

### Supabaseクライアントが利用できない

```
[Square Subscription] Supabaseクライアントが利用できません
```

**解決方法**: `.env.local`に以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 書き込みエラー

```
[Square Subscription] Supabase挿入エラー: {...}
```

**確認事項**:
1. Supabaseのテーブルが正しく作成されているか
2. RLSポリシーが正しく設定されているか
3. サービスロールキーが正しいか

## 📝 次のステップ

1. 実際の決済フローでテスト
2. Supabaseダッシュボードでデータを確認
3. フロントエンドでサブスクリプション状態を表示


