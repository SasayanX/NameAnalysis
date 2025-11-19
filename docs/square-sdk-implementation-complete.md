# Square SDK実装完了サマリー

## ✅ 実装完了項目

Perplexity調査結果に基づき、以下の実装を完了しました。

### 1. 新しいAPIエンドポイント

- ✅ `app/api/square-cards/create/route.ts` - カード登録API
- ✅ `app/api/square-customers/create/route.ts` - 顧客作成API

### 2. 既存コードの修正

- ✅ `lib/square-payment-client.ts` - `cardId`と`customerId`を使用するように修正
- ✅ `app/api/square-subscription/create/route.ts` - APIバージョンを最新に更新、必須パラメータを追加
- ✅ `components/square-payment-form.tsx` - カード登録フローを追加

### 3. 環境切り替え機能

- ✅ `lib/square-config.ts` - SDK URL自動切り替え機能を追加

## 🔄 実装されたフロー

### 正しいサブスクリプション作成フロー

```
1. カード情報入力
   ↓
2. Web Payments SDKでカードをトークン化（card nonce取得）
   ↓
3. 顧客を作成または取得（/api/square-customers/create）
   ↓
4. カードを登録（/api/square-cards/create）
   ↓
5. サブスクリプションを作成（/api/square-subscription/create）
   ↓
6. 完了
```

## 📝 重要な変更点

### Before（動作しない可能性）

```typescript
// ❌ 直接source_idを使用
body: JSON.stringify({
  source_id: cardNonce, // これは動作しない
  plan_id: planId,
})
```

### After（正しい実装）

```typescript
// ✅ カード登録 → cardIdを使用
// Step 1: カード登録
const cardResponse = await fetch("/api/square-cards/create", {
  body: JSON.stringify({
    cardNonce: tokenResult.token,
    customerId: customerData.customerId,
  }),
})

// Step 2: サブスクリプション作成
const subscriptionResponse = await fetch("/api/square-subscription/create", {
  body: JSON.stringify({
    planId: selectedPlan,
    cardId: cardData.cardId, // CreateCardで取得したID
    customerId: customerData.customerId, // 必須
  }),
})
```

## 🧪 テスト手順

### 1. 環境変数の設定

`.env.local`:
```env
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=LHxxxxxx
SQUARE_ACCESS_TOKEN=EAAAExxxxxx
SQUARE_LOCATION_ID=LHxxxxxx
```

### 2. テストカード

```
カード番号: 4111 1111 1111 1111
有効期限: 任意の未来の日付（例: 12/25）
CVV: 任意の3桁（例: 123）
郵便番号: 任意（例: 12345）
```

### 3. テストフロー

1. `/pricing` ページにアクセス
2. プランを選択
3. カード情報を入力（テストカードを使用）
4. メールアドレスを入力
5. 決済を実行
6. 各ステップでエラーが発生しないか確認

### 4. 確認ポイント

- ✅ SDKが正しく読み込まれる（Sandbox環境）
- ✅ カードトークン化が成功する
- ✅ 顧客作成が成功する
- ✅ カード登録が成功する
- ✅ サブスクリプション作成が成功する
- ✅ エラーハンドリングが適切に動作する

## ⚠️ 注意事項

### 1. 必須パラメータ

- `customer_id` - 必須（顧客作成APIで取得）
- `card_id` - 必須（カード登録APIで取得）
- `idempotency_key` - 必須（既に実装済み）

### 2. APIバージョン

- すべてのAPIで `Square-Version: 2025-11-18` を使用
- 公式ドキュメントで最新版を確認すること

### 3. エラーハンドリング

- 各ステップでエラーが発生した場合、適切なエラーメッセージを表示
- Square APIのエラーレスポンスを確認

## 🔗 関連ファイル

- `app/api/square-cards/create/route.ts` - カード登録API
- `app/api/square-customers/create/route.ts` - 顧客作成API
- `app/api/square-subscription/create/route.ts` - サブスクリプション作成API
- `lib/square-payment-client.ts` - Square決済クライアント
- `components/square-payment-form.tsx` - 決済フォーム
- `lib/square-config.ts` - Square設定（環境切り替え）

## 📚 参考資料

- Perplexity調査結果: `docs/square-sdk-perplexity-research-implementation.md`
- 実装チェックリスト: `docs/square-sdk-latest-implementation-checklist.md`
- Square公式ドキュメント: https://developer.squareup.com/docs/web-payments/overview



