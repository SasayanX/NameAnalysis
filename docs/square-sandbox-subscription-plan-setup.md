# Square Sandbox環境でのサブスクリプションプラン作成

## ⚠️ 重要な注意点

Square Developer Dashboardの**Sandbox環境では、サブスクリプションプランの作成画面が表示されない**場合があります。

これは、Sandbox環境では以下の方法でプランを作成する必要があるためです：

1. **API経由で作成**（推奨）
2. **Square Dashboard（本番環境）で作成してからSandboxにコピー**（不可能な場合あり）

---

## ✅ 解決方法: API経由でプランを作成

### ステップ1: 既存のプランを確認

まず、既にプランが存在するか確認します：

**ブラウザで以下にアクセス:**
```
http://localhost:3000/api/square-subscription-plans/create
```

または、ターミナルで：
```bash
curl http://localhost:3000/api/square-subscription-plans/create
```

**成功した場合のレスポンス:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "プランID",
      "name": "プラン名",
      "phases": [...]
    }
  ]
}
```

### ステップ2: プランが存在しない場合、作成する

#### 方法A: ブラウザの開発者ツールで作成

1. ブラウザで `http://localhost:3000/api/square-subscription-plans/create` を開く
2. 開発者ツール（F12）を開く
3. Consoleタブで以下を実行：

```javascript
// ベーシックプランを作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
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
  headers: {
    'Content-Type': 'application/json',
  },
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

#### 方法B: PowerShellで作成

```powershell
# ベーシックプランを作成
$body = @{ planId = "basic" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "ベーシックプランID: $($response.plan.id)"
Write-Host "環境変数に設定: SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=$($response.plan.id)"

# プレミアムプランを作成
$body = @{ planId = "premium" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/square-subscription-plans/create" -Method POST -Body $body -ContentType "application/json"
Write-Host "プレミアムプランID: $($response.plan.id)"
Write-Host "環境変数に設定: SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=$($response.plan.id)"
```

### ステップ3: プランIDを環境変数に設定

作成されたプランIDを `.env.local` に追加：

```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=取得したプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=取得したプランID
```

### ステップ4: 開発サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

---

## 🔍 確認方法

### 既存のプランを確認

```
http://localhost:3000/api/square-subscription-plans/create
```

GETリクエストで既存のプラン一覧が表示されます。

### プランが正しく設定されているか確認

```
http://localhost:3000/api/debug-square-config
```

このエンドポイントで、環境変数が正しく読み込まれているか確認できます。

---

## 📝 注意事項

1. **Sandbox環境では、UIでプランを作成できない場合がある**
   - API経由で作成する必要があります

2. **プランIDは環境変数に設定する必要がある**
   - `.env.local` に `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC` と `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM` を設定

3. **開発サーバーを再起動する必要がある**
   - 環境変数を変更した後は必ず再起動

4. **Sandbox環境とProduction環境でプランIDは異なる**
   - Sandbox環境で作成したプランIDは、Sandbox環境でのみ使用可能

---

## 🆘 トラブルシューティング

### プラン作成に失敗する場合

1. **Access Tokenが正しいか確認**
   ```
   http://localhost:3000/api/test-square-api
   ```

2. **エンドポイントがSandbox環境か確認**
   - ターミナルのログで `https://connect.squareupsandbox.com/v2` が使用されているか確認

3. **APIバージョンを確認**
   - 最新のAPIバージョンを使用しているか確認

### プランIDが取得できない場合

1. 既存のプランを確認:
   ```
   http://localhost:3000/api/square-subscription-plans/create
   ```

2. プランが存在する場合は、そのプランIDを使用
3. プランが存在しない場合は、上記の方法で作成



