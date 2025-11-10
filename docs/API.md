# API ドキュメント

## 概要

姓名判断アプリのAPIエンドポイントの仕様書です。

## 認証

現在のAPIは認証不要ですが、レート制限が適用されています。

## エンドポイント

### サブスクリプション作成

#### POST `/api/create-subscription`

新しいサブスクリプションを作成します。

**リクエストボディ:**
```json
{
  "planId": "free" | "basic" | "premium",
  "billingCycle": "monthly" | "yearly",
  "paymentMethod": "square" // オプション、デフォルト: "square"
}
```

**レスポンス:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_1234567890",
    "status": "active",
    "planId": "basic",
    "billingCycle": "monthly",
    "amount": 220,
    "currency": "JPY",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "nextBillingDate": "2024-02-01T00:00:00.000Z"
  },
  "message": "Subscription created successfully"
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": "INVALID_PLAN_ID",
  "message": "無効なプランIDです。",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**ステータスコード:**
- `200`: 成功
- `400`: リクエストエラー
- `429`: レート制限超過
- `500`: サーバーエラー

### 運勢データ取得

#### GET `/api/fortune-data`

カスタム運勢データを取得します。

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "fortuneData": {
      "1": {
        "運勢": "大吉",
        "説明": "万物の始まり、新しい始まりの象徴"
      }
    },
    "fortuneExplanations": {
      "大吉": "非常に良い運勢"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 六星占術データ取得

#### GET `/api/six-star-data`

六星占術のデータを取得します。

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "2000": {
      "9": 59,
      "10": 60
    },
    "2001": {
      "1": 61,
      "2": 62
    }
  }
}
```

## レート制限

- **制限**: 1分間に100リクエスト
- **超過時**: HTTP 429エラー
- **ヘッダー**: `X-RateLimit-Remaining` で残り回数を確認可能

## エラーハンドリング

### エラーコード

| コード | 説明 |
|--------|------|
| `MISSING_PARAMETERS` | 必須パラメータが不足 |
| `INVALID_PLAN_ID` | 無効なプランID |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 |
| `SUBSCRIPTION_CREATION_FAILED` | サブスクリプション作成失敗 |

### エラーレスポンス形式

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "ユーザー向けエラーメッセージ",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## セキュリティ

### セキュリティヘッダー

すべてのAPIレスポンスに以下のヘッダーが含まれます：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS設定

- **本番環境**: `https://seimei.app` のみ許可
- **開発環境**: すべてのオリジン許可

## 使用例

### JavaScript (Fetch API)

```javascript
// サブスクリプション作成
const response = await fetch('/api/create-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 'basic',
    billingCycle: 'monthly'
  })
})

const data = await response.json()
if (data.success) {
  console.log('サブスクリプション作成成功:', data.subscription)
} else {
  console.error('エラー:', data.message)
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "billingCycle": "monthly"
  }'
```

## バージョニング

現在のAPIバージョン: `v1`

将来のバージョンアップ時は、URLパスにバージョンを含める予定です：
- `/api/v1/create-subscription`
- `/api/v2/create-subscription`
