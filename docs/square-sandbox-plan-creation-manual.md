# Square Sandbox環境でのサブスクリプションプラン作成（手動）

## ⚠️ 重要

**Square Dashboard（squareup.com/dashboard）にはSandbox環境の切り替えがない場合があります。**

その場合、**API経由でプランを作成する必要があります**。

Square Dashboardは通常、本番環境のダッシュボードで、Sandbox環境のプランはAPI経由で作成する必要があります。

---

## 📋 手順

### ステップ1: 既存のプランを確認

まず、既にプランが存在するか確認します：

**ブラウザで以下にアクセス:**
```
http://localhost:3000/api/square-subscription-plans/create
```

または、PowerShellで：
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method GET
```

**プランが存在する場合:**
- そのプランIDを環境変数に設定してください
- Sandbox環境のプランIDであることを確認してください

**プランが存在しない場合:**
- 以下の方法でプランを作成してください

### ステップ2: API経由でプランを作成（推奨）

Square DashboardにSandbox切り替えがない場合、API経由でプランを作成します。

#### 方法A: PowerShellで作成

```powershell
# ベーシックプランを作成
$body = @{ planId = "basic" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "✅ ベーシックプランID: $($response.plan.id)"
Write-Host "環境変数に設定: SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=$($response.plan.id)"

# プレミアムプランを作成
$body = @{ planId = "premium" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "✅ プレミアムプランID: $($response.plan.id)"
Write-Host "環境変数に設定: SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=$($response.plan.id)"
```

#### 方法B: ブラウザの開発者ツールで作成

1. ブラウザで `http://localhost:3000/api/square-subscription-plans/create` を開く
2. 開発者ツール（F12）を開く
3. Consoleタブで以下を実行：

```javascript
// ベーシックプランを作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'basic' })
})
.then(res => res.json())
.then(data => {
  console.log('ベーシックプラン:', data);
  if (data.success) {
    console.log('プランID:', data.plan.id);
    console.log('環境変数に設定:', `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=${data.plan.id}`);
  }
});

// プレミアムプランを作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'premium' })
})
.then(res => res.json())
.then(data => {
  console.log('プレミアムプラン:', data);
  if (data.success) {
    console.log('プランID:', data.plan.id);
    console.log('環境変数に設定:', `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=${data.plan.id}`);
  }
});
```

### ステップ3: Square Dashboardで手動作成（オプション）

Square DashboardにSandbox切り替えがある場合のみ：

1. [Square Dashboard](https://squareup.com/dashboard) にログイン
2. 右上の環境表示で「Sandbox」に切り替え（表示されている場合のみ）
3. 左メニューから **「商品とサービス」** を選択
4. **「サブスクリプションプラン」** タブをクリック
5. **「プランを作成」** をクリック

1. 左メニューから **「商品とサービス」** を選択
2. **「サブスクリプションプラン」** タブをクリック
3. **「プランを作成」** または **「新しいプランを作成」** をクリック

### ステップ4: ベーシックプランの設定（手動作成の場合）

以下の情報を入力：

- **プラン名**: `ベーシックプラン` または `Basic Plan`
- **価格**: `330` 円
- **請求頻度**: `1ヶ月ごと` または `Monthly`
- **通貨**: `JPY`（日本円）
- **説明**: （任意）1日10回まで姓名判断、基本的な運勢分析など

**「保存」** または **「作成」** をクリック

### ステップ5: プレミアムプランの設定（手動作成の場合）

同様の手順で、プレミアムプランを作成：

- **プラン名**: `プレミアムプラン` または `Premium Plan`
- **価格**: `550` 円
- **請求頻度**: `1ヶ月ごと` または `Monthly`
- **通貨**: `JPY`（日本円）

### ステップ6: プランIDを確認

1. 作成したプランの詳細ページを開く
2. **プランID** をコピー
   - 形式: `BASIC_MONTHLY`、`PREMIUM_MONTHLY` など
   - または Catalog Object ID: `#プランID` で始まる形式

### ステップ7: 環境変数に設定

`.env.local` に以下を追加：

```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=取得したベーシックプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=取得したプレミアムプランID
```

### ステップ8: 開発サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

---

## 🔍 プランIDの確認方法

### 方法1: Square Dashboardで確認

1. プランの詳細ページを開く
2. URLを確認（例: `https://squareup.com/dashboard/items/subscriptions/plan/XXXXX`）
3. プランIDが表示されているか確認

### 方法2: APIで確認

既存のプランを取得：

```
http://localhost:3000/api/square-subscription-plans/create
```

GETリクエストで既存のプラン一覧が表示されます。

---

## ⚠️ 注意事項

1. **Sandbox環境とProduction環境でプランIDは異なる**
   - Sandbox環境で作成したプランIDは、Sandbox環境でのみ使用可能

2. **Square DashboardとSquare Developer Dashboardは別物**
   - Square Dashboard: 商品管理、プラン作成
   - Square Developer Dashboard: アプリ設定、認証情報

3. **環境の切り替え**
   - Square DashboardでSandbox環境に切り替える方法を確認
   - 通常は右上の環境表示で切り替え可能

---

## 🆘 トラブルシューティング

### プラン作成画面が表示されない場合

1. **Square Dashboardにアクセスしているか確認**
   - `squareup.com/dashboard` にアクセス
   - `developer.squareup.com` ではない

2. **Sandbox環境に切り替えているか確認**
   - 右上の環境表示を確認

3. **権限を確認**
   - Squareアカウントに適切な権限があるか確認

### プランIDが取得できない場合

1. プランの詳細ページを開く
2. ブラウザの開発者ツール（F12）でネットワークタブを確認
3. APIリクエストのレスポンスからプランIDを確認

---

## 📝 参考

- [Square Dashboard](https://squareup.com/dashboard)
- [Square サブスクリプションの開始方法](https://squareup.com/help/jp/ja/article/7627-get-started-with-subscriptions-in-dashboard)

