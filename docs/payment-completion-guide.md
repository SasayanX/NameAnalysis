# 決済完了後のプラン有効化ガイド

## ✅ 決済が完了しました！

ベーシックプラン（￥330/月）の決済が正常に完了しました。

### 決済情報
- **プラン**: ベーシックプラン
- **金額**: ￥330
- **次回請求日**: 2025年12月1日
- **メールアドレス**: kanaukiryu@gmail.com

## 🔄 プランを有効化する方法（ウェブ・モバイル対応）

### 📱 モバイル版（スマートフォン・タブレット）

#### 自動有効化（推奨）

1. **決済完了後、アプリに戻る**
   - Square決済ページからブラウザの「戻る」ボタンを押す
   - または、アプリを再起動する

2. **自動確認**
   - アプリが自動的に決済を確認します（約1秒）
   - メールアドレスは既に保存済みのため、手動操作は不要です

3. **プランが有効化されたことを確認**
   - ページが自動的にリロードされます
   - 「ベーシックプラン」が有効になっていることを確認

#### 手動確認（自動有効化されない場合）

1. **マイページにアクセス**
   ```
   https://your-domain.com/my-subscription?email=kanaukiryu@gmail.com
   ```

2. **「決済状況を確認」ボタンをクリック**
   - ページ中央の青いボタンをクリック
   - 自動的に決済情報を確認してプランを有効化します

### 💻 ウェブ版（PC・デスクトップ）

#### 自動有効化（推奨）

1. **決済完了後、マイページにアクセス**
   ```
   https://your-domain.com/my-subscription?email=kanaukiryu@gmail.com
   ```
   または開発環境の場合：
   ```
   http://localhost:3000/my-subscription?email=kanaukiryu@gmail.com
   ```

2. **自動確認**
   - ページが開くと、自動的に決済を確認します（約0.5秒）
   - メールアドレスはURLパラメータまたはlocalStorageから取得されます

3. **プランが有効化されたことを確認**
   - ページが自動的にリロードされます
   - 「ベーシックプラン」が有効になっていることを確認

#### 手動確認（自動有効化されない場合）

1. **「決済状況を確認」ボタンをクリック**
   - ページ中央の青いボタンをクリック
   - 自動的に決済情報を確認してプランを有効化します

### 🎯 決済状況の取得方法

アプリは以下の順序で決済状況を取得します：

1. **URLパラメータ**: `?email=kanaukiryu@gmail.com` がURLにある場合
2. **localStorage**: `customerEmail` キーに保存されたメールアドレス
3. **userSession**: `userSession` キーに保存されたセッション情報からメールアドレスを取得

取得したメールアドレスで `/api/square-payments/auto-activate` APIを呼び出し、Supabaseの `square_payments` テーブルから最新の決済情報を取得してプランを有効化します。

## 🔍 Webhookの確認方法

### Squareダッシュボードで確認

1. **Squareダッシュボードにログイン**
2. **設定 > Webhooks** に移動
3. **Webhookイベントログ**を確認
   - `payment.updated` イベントが送信されているか確認

### サーバーログで確認

**Vercelの場合**:
1. Vercelダッシュボードにログイン
2. プロジェクト > Functions > `/api/square-webhook` を選択
3. ログを確認

**開発環境の場合**:
- 開発サーバーのコンソールにログが表示されます

## ⚠️ プランが有効化されない場合

### 1. Webhookが受信されていない

**確認方法**:
- SquareダッシュボードでWebhookイベントログを確認
- サーバーログでWebhook受信を確認

**解決方法**:
- Webhook URLが正しく設定されているか確認
- サーバーが正常に動作しているか確認

### 2. Supabaseに決済情報が保存されていない

**確認方法**:
```sql
-- Supabase SQL Editorで実行
SELECT * FROM square_payments 
WHERE customer_email = 'kanaukiryu@gmail.com'
ORDER BY created_at DESC 
LIMIT 1;
```

**解決方法**:
- Webhookが正しく処理されているか確認
- Supabaseの接続情報が正しいか確認

### 3. 手動でプランを有効化する

上記の方法で解決しない場合、手動でプランを有効化できます：

1. **ブラウザの開発者ツールを開く**（F12）
2. **Console** タブを開く
3. **以下を実行**:
   ```javascript
   const subscription = {
     plan: "basic",
     expiresAt: new Date("2025-12-01").toISOString(),
     isActive: true,
     status: "active",
     paymentMethod: "square",
     amount: 330,
     nextBillingDate: new Date("2025-12-01").toISOString(),
     lastPaymentDate: new Date().toISOString(),
   }
   localStorage.setItem("userSubscription", JSON.stringify(subscription))
   location.reload()
   ```

## 📝 チェックリスト

- [ ] Squareダッシュボードで決済完了を確認
- [ ] Webhookイベントログを確認
- [ ] `/my-subscription?email=kanaukiryu@gmail.com` にアクセス
- [ ] 「決済状況を確認」ボタンをクリック
- [ ] プランが有効化されたことを確認
- [ ] ベーシックプランの機能が使えることを確認

## 🎯 次のステップ

プランが有効化されたら：

1. **ベーシックプランの機能を確認**
   - 1日10回まで姓名判断
   - PDF出力機能
   - 詳細レポート

2. **次回請求日の確認**
   - 2025年12月1日に自動的に次回の請求が行われます

3. **プランの変更**
   - プレミアムプランにアップグレードする場合は、`/pricing` ページから

## 💡 補足

### 決済情報の保存場所

- **Square**: 決済情報はSquareダッシュボードで確認できます
- **Supabase**: 決済情報は `square_payments` テーブルに保存されます
- **localStorage**: プラン情報はブラウザの `localStorage` に保存されます

### サブスクリプションの管理

- **キャンセル**: Squareダッシュボード > 顧客 > サブスクリプション からキャンセル可能
- **変更**: プラン変更は `/pricing` ページから

これで決済完了後の処理が完了です！

