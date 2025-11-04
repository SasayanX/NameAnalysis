# 決済連携のトラブルシューティング

## 🔍 現在の状況確認

### 決済は完了しているが、アプリで無料プランになっている

**確認すべきポイント**:

1. **Supabaseに決済情報が保存されているか**
   ```sql
   SELECT * FROM square_payments 
   WHERE customer_email = 'kanaukiryu@gmail.com'
   ORDER BY created_at DESC;
   ```

2. **Webhookが受信されているか**
   - Squareダッシュボード > Webhooks > イベントログ
   - サーバーログ（Vercel Functions > `/api/square-webhook`）

3. **localStorageにプラン情報が保存されているか**
   - ブラウザの開発者ツール > Application > Local Storage > `userSubscription`

## 🚨 よくある問題と解決方法

### 問題1: Webhookが受信されていない

**原因**:
- Webhook URLが正しく設定されていない
- サーバーがダウンしている
- ネットワークの問題

**解決方法**:
1. SquareダッシュボードでWebhook URLを確認
2. Webhookテストを実行
3. サーバーログを確認

### 問題2: Supabaseに保存されていない

**原因**:
- Supabaseの接続情報が間違っている
- RLSポリシーでブロックされている
- テーブルが存在しない

**解決方法**:
1. Supabaseの接続情報を確認
2. `square_payments`テーブルが存在するか確認
3. RLSポリシーを確認

### 問題3: localStorageに保存されていない

**原因**:
- プラン有効化処理が実行されていない
- メールアドレスが一致していない

**解決方法**:
1. `/my-subscription?email=kanaukiryu@gmail.com` にアクセス
2. 「決済状況を確認」ボタンをクリック
3. ブラウザのコンソールでエラーを確認

## ✅ 確実に動作させるための手順

### ステップ1: 決済情報を確認

```bash
# APIエンドポイントで確認
curl "http://localhost:3000/api/square-payments/check?email=kanaukiryu@gmail.com"
```

または、ブラウザで直接アクセス：
```
http://localhost:3000/api/square-payments/check?email=kanaukiryu@gmail.com
```

### ステップ2: 強制的にプランを有効化

```bash
# 強制有効化API
curl "http://localhost:3000/api/square-payments/force-activate?email=kanaukiryu@gmail.com"
```

### ステップ3: マイページで確認

```
/my-subscription?email=kanaukiryu@gmail.com
```

「決済状況を確認」ボタンをクリック

## 💡 より確実な方法

### 方法1: メールアドレスを事前に保存

決済前にメールアドレスを入力してもらい、localStorageに保存：

```typescript
// 決済ボタンをクリックする前に
localStorage.setItem("customerEmail", "kanaukiryu@gmail.com")
```

### 方法2: 決済完了メールに確認URLを追加

Squareから送信されるメールに、以下のURLを追加：

```
https://your-app.com/my-subscription?email=kanaukiryu@gmail.com
```

ユーザーがこのURLをクリックすると、自動的にプランが有効化されます。

### 方法3: Square Checkout APIに移行（推奨）

Square Payment Linksの代わりに、Square Checkout APIを使用することで、より確実な連携が可能です。

## 🎯 今すぐ試すこと

1. **決済情報を確認**
   ```
   /api/square-payments/check?email=kanaukiryu@gmail.com
   ```

2. **強制的にプランを有効化**
   ```
   /api/square-payments/force-activate?email=kanaukiryu@gmail.com
   ```

3. **マイページで確認**
   ```
   /my-subscription?email=kanaukiryu@gmail.com
   ```

これで、決済情報が確認でき、プランが有効化されるはずです。

