# Squareサブスクリプションプラン作成 - 簡単ガイド

## 🚀 簡単な手順

### ステップ1: 開発サーバーを起動

**別のターミナルウィンドウで**以下を実行：

```bash
npm run dev
```

開発サーバーが起動したら、`http://localhost:3000` にアクセスできることを確認してください。

### ステップ2: プランを作成

開発サーバーが起動している状態で、**このターミナルで**以下を実行：

#### ベーシックプランを作成

```powershell
$body = @{ planId = "basic" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "✅ ベーシックプランID: $($response.plan.id)"
```

#### プレミアムプランを作成

```powershell
$body = @{ planId = "premium" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "✅ プレミアムプランID: $($response.plan.id)"
```

### ステップ3: プランIDを環境変数に設定

作成されたプランIDを `.env.local` に追加：

```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=取得したベーシックプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=取得したプレミアムプランID
```

### ステップ4: 開発サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

---

## 🆘 エラーが出た場合

### エラー: "リモート サーバーに接続できません"

**原因**: 開発サーバーが起動していない

**解決方法**:
1. 別のターミナルウィンドウで `npm run dev` を実行
2. `http://localhost:3000` にアクセスできることを確認
3. 再度プラン作成コマンドを実行

### エラー: 400 Bad Request

**原因**: Square APIのリクエスト形式に問題がある可能性

**確認方法**:
1. 開発サーバーを実行しているターミナルを確認
2. `[Square Catalog API]` で始まるログを確認
3. エラーの詳細（`field`名など）を確認

### エラー: 401 Unauthorized

**原因**: Access Tokenが無効

**解決方法**:
1. `.env.local` の `SQUARE_ACCESS_TOKEN` を確認
2. Square Developer Dashboardで新しいAccess Tokenを取得
3. `.env.local` を更新
4. 開発サーバーを再起動

---

## 📝 コマンド一覧

### 既存のプランを確認

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method GET
```

### ベーシックプランを作成

```powershell
$body = @{ planId = "basic" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
```

### プレミアムプランを作成

```powershell
$body = @{ planId = "premium" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ 成功した場合の表示

```
✅ ベーシックプラン作成成功!

プランID: #プランID
プラン名: ベーシックプラン
価格: 330円/月

以下の環境変数を .env.local に追加してください:
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=#プランID
```

このプランIDを `.env.local` に追加してください。



