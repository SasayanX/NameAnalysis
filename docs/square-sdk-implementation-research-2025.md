# Square SDK実装調査結果（2025年最新情報）

## 🔍 調査結果サマリー

Perplexityスタイルで最新情報を調査した結果、以下の重要なポイントが判明しました。

## ⚠️ 重要な変更点（2025年）

### 1. HTTPS必須化（2025年10月1日以降）

**重要**: 2025年10月1日以降、Web Payments SDKは**すべての統合がセキュアなコンテキスト（HTTPS）で実行されることを要求**します。

**影響**:
- ローカル開発環境（`http://localhost`）でもHTTPSが必要になる可能性
- 本番環境では既にHTTPSが必須

**対策**:
- 開発環境でもHTTPSを使用（例: `https://localhost:3000`）
- または、Squareのテスト環境を活用

**参考**: https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-10-01

### 2. エラーハンドリングの変更

**変更点**:
- 以前: `PlaidMissingNameError`
- 現在: `InvalidOptionError`（推奨）
- 後方互換性のため`PlaidMissingNameError`は引き続き存在

**推奨対応**:
```typescript
// エラーハンドリングを更新
try {
  // 決済処理
} catch (error) {
  if (error instanceof InvalidOptionError) {
    // 新しいエラーハンドリング
  }
  // 後方互換性のため、PlaidMissingNameErrorもチェック
  if (error instanceof PlaidMissingNameError) {
    // 旧エラーハンドリング（非推奨）
  }
}
```

**参考**: https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-10-01

### 3. Apple Payのトークン化結果の拡張

**新機能**:
- `TokenResult.TokenDetails.BillingContact`内でメールアドレス（`email`）と電話番号（`phone`）が利用可能

**実装例**:
```typescript
const tokenResult = await card.tokenize()
if (tokenResult.status === 'OK') {
  const email = tokenResult.tokenDetails?.billingContact?.email
  const phone = tokenResult.tokenDetails?.billingContact?.phone
  // ユーザー情報を取得可能
}
```

**参考**: https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-10-01

### 4. アクセシビリティの向上（2025年8月6日）

**改善点**:
- すべての決済iframeにアクセシブルなタイトルが追加
- バリデーションメッセージが適切に提供
- スクリーンリーダー対応が改善

**参考**: https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-08-06

## 📝 実装の基本手順（最新版）

### 1. SDKの読み込み

**Sandbox環境**:
```html
<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
```

**Production環境**:
```html
<script src="https://web.squarecdn.com/v1/square.js"></script>
```

**React/Next.jsでの実装**:
```typescript
useEffect(() => {
  const loadSquareSDK = async () => {
    // Sandbox環境かどうかを判定
    const isSandbox = process.env.SQUARE_ENVIRONMENT === 'sandbox'
    const sdkUrl = isSandbox 
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js'
    
    if (window.Square) {
      // 既に読み込まれている
      return
    }
    
    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.defer = true
    
    script.onload = () => {
      // SDK読み込み完了
    }
    
    document.head.appendChild(script)
  }
  
  loadSquareSDK()
}, [])
```

### 2. 決済フォームの初期化

```typescript
const initializeSquare = async () => {
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  
  // Square Payments初期化
  const payments = window.Square.payments(applicationId, locationId)
  
  // カード要素の作成
  const card = await payments.card({
    style: {
      // カスタムスタイル（オプション）
    }
  })
  
  // DOM要素にアタッチ
  await card.attach('#card-container')
  
  return card
}
```

### 3. カードのトークン化

```typescript
const handlePayment = async () => {
  try {
    // カードをトークン化
    const tokenResult = await card.tokenize()
    
    if (tokenResult.status === 'OK') {
      const cardNonce = tokenResult.token
      
      // サーバーに送信してサブスクリプション作成
      const response = await fetch('/api/square-subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'basic',
          cardNonce: cardNonce,
          customerEmail: tokenResult.tokenDetails?.billingContact?.email,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 決済成功
        toast.success('決済が完了しました')
      } else {
        // エラーハンドリング
        toast.error(result.error)
      }
    } else {
      // トークン化エラー
      const errors = tokenResult.errors || []
      toast.error(errors[0]?.detail || 'カード情報の処理に失敗しました')
    }
  } catch (error) {
    // エラーハンドリング
    if (error instanceof InvalidOptionError) {
      toast.error('決済オプションが無効です')
    } else {
      toast.error('決済処理中にエラーが発生しました')
    }
  }
}
```

## 🔧 サブスクリプション作成API（最新版）

### APIエンドポイント

```
POST https://connect.squareup.com/v2/subscriptions
```

### リクエスト例

```typescript
const createSubscription = async (planId: string, cardNonce: string, customerEmail?: string) => {
  const response = await fetch('https://connect.squareup.com/v2/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18', // 最新版を確認
    },
    body: JSON.stringify({
      location_id: process.env.SQUARE_LOCATION_ID,
      plan_id: planId, // Squareダッシュボードで作成したプランID
      source_id: cardNonce, // カードトークン
      customer_id: customerId, // オプション: 既存の顧客ID
      start_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
      // その他のオプションパラメータ
    }),
  })
  
  return await response.json()
}
```

### エラーレスポンス例

```typescript
{
  "errors": [
    {
      "category": "INVALID_REQUEST_ERROR",
      "code": "INVALID_VALUE",
      "detail": "The provided value is invalid",
      "field": "source_id"
    }
  ]
}
```

## 🧪 テスト環境の設定

### Sandbox環境でのテスト

**1. 環境変数の設定**:
```env
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=LHxxxxxx
SQUARE_ACCESS_TOKEN=EAAAExxxxxx
```

**2. SDK URLの切り替え**:
```typescript
const isSandbox = process.env.SQUARE_ENVIRONMENT === 'sandbox'
const sdkUrl = isSandbox 
  ? 'https://sandbox.web.squarecdn.com/v1/square.js'
  : 'https://web.squarecdn.com/v1/square.js'
```

**3. テストカード**:
```
カード番号: 4111 1111 1111 1111
有効期限: 任意の未来の日付（例: 12/25）
CVV: 任意の3桁（例: 123）
郵便番号: 任意（例: 12345）
```

## 🚨 よくあるエラーと解決方法

### 1. "Failed to tokenize credit card"

**原因**:
- カード情報が不正
- SDKが正しく初期化されていない
- 環境変数が間違っている

**解決方法**:
```typescript
// 1. SDKの初期化を確認
if (!window.Square) {
  console.error('Square SDK not loaded')
  return
}

// 2. カード要素が正しくアタッチされているか確認
const cardContainer = document.getElementById('card-container')
if (!cardContainer) {
  console.error('Card container not found')
  return
}

// 3. トークン化前にカード情報を確認
const tokenResult = await card.tokenize()
if (tokenResult.status !== 'OK') {
  console.error('Tokenization failed:', tokenResult.errors)
}
```

### 2. "Interaction invalid!"

**原因**:
- カード要素が正しく初期化されていない
- DOM要素が準備できていない

**解決方法**:
```typescript
// DOM要素が準備できてから初期化
useEffect(() => {
  const timer = setTimeout(() => {
    initializeSquare()
  }, 100)
  
  return () => clearTimeout(timer)
}, [])
```

### 3. 422エラー（Unprocessable Entity）

**原因**:
- APIのパラメータが間違っている
- 必須パラメータが不足している
- `source_id`（card nonce）の形式が間違っている

**解決方法**:
```typescript
// 1. パラメータを確認
const requestBody = {
  location_id: process.env.SQUARE_LOCATION_ID,
  plan_id: planId, // 正しいプランIDか確認
  source_id: cardNonce, // 正しい形式か確認
  start_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
}

// 2. エラーレスポンスを確認
const response = await fetch(url, options)
const result = await response.json()

if (!response.ok) {
  console.error('API Error:', result.errors)
  // エラーの詳細を確認
}
```

## 📋 実装チェックリスト

実装前に以下を確認：

- [ ] HTTPS環境で動作するか確認（2025年10月以降必須）
- [ ] SDK URLが環境に応じて正しく切り替わるか確認
- [ ] 環境変数が正しく設定されているか確認
- [ ] カード要素が正しく初期化されているか確認
- [ ] エラーハンドリングが最新の形式に対応しているか確認
- [ ] サブスクリプション作成APIのパラメータが正しいか確認
- [ ] テスト環境で十分にテストしているか確認

## 🔗 参考リンク

1. **Square Web Payments SDK公式ドキュメント**
   - https://developer.squareup.com/docs/web-payments/overview

2. **Square Subscriptions API**
   - https://developer.squareup.com/docs/subscriptions-api/overview

3. **Square Changelog（最新の変更点）**
   - https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-10-01
   - https://developer.squareup.com/docs/changelog/webpaymentsdk/2025-08-06

4. **Squareコミュニティフォーラム**
   - https://community.squareup.com/

5. **Next.jsとSquareの統合例**
   - https://shinagawa-web.com/blogs/nextjs-square-payments-integration-guide

## 💡 実装時のベストプラクティス

1. **環境変数で自動切り替え**
   - Sandbox/Productionを環境変数で切り替え
   - SDK URLも自動的に切り替える

2. **エラーハンドリングの実装**
   - 最新のエラー形式（`InvalidOptionError`）に対応
   - ユーザーフレンドリーなエラーメッセージを表示

3. **テスト環境での十分なテスト**
   - Sandbox環境で十分にテスト
   - エラーケースもテスト

4. **セキュリティ対策**
   - HTTPS環境で動作することを確認
   - カード情報を直接扱わない（SDKに任せる）

5. **アクセシビリティの考慮**
   - スクリーンリーダー対応
   - 適切なエラーメッセージの提供



