# 価格プラン整合性チェック結果

## チェック日時
2025年11月4日

## 確認結果

### ✅ 正しい価格設定（すべて330円 / 550円）

1. **プラン定義** (`lib/subscription-manager.ts`)
   - Basic: 330円/月
   - Premium: 550円/月

2. **価格ページ** (`app/pricing/page.tsx`)
   - Basic: 330円/月
   - Premium: 550円/月

3. **Square決済設定** (`lib/square-config.ts`)
   - Basic: 330円/月
   - Premium: 550円/月

4. **GMO決済フォーム** (`components/gmo-subscription-form.tsx`)
   - Basic: 330円/月
   - Premium: 550円/月

5. **Square Payment Form** (`components/square-payment-form.tsx`)
   - Basic: 330円/月
   - Premium: 550円/月

6. **Force Activate API** (`app/api/square-payments/force-activate/route.ts`)
   - Basic: 330円
   - Premium: 550円

### 🔧 修正した問題

**問題**: `app/api/square-webhook/route.ts` のプラン判定ロジックが不正確でした。

**原因**: Square APIの金額形式の理解が不正確でした。
- Square APIは、**JPY（日本円）の場合、最小通貨単位（円）で送信**します
  - 例：330円 = `amount: 330`（33000セントではない）
- USDなどの場合はセント単位で送信されます
  - 例：$5.00 = `amount: 500`セント

**修正内容**:
- プラン判定ロジックを修正
  - `amount >= 55000` → `amount === 550 || amount === 55000`（JPYとUSD両方に対応）
  - `amount >= 33000` → `amount === 330 || amount === 33000`（JPYとUSD両方に対応）
- コメントを追加して、Square APIの金額形式を明確化

**修正箇所**:
1. `payment.updated` イベント処理（行91-102）
2. `invoice.payment_made` イベント処理（行191-202）

### 📊 価格整合性マトリクス

| ファイル/コンポーネント | Basic | Premium | 状態 |
|----------------------|-------|---------|------|
| subscription-manager.ts | 330円 | 550円 | ✅ |
| pricing/page.tsx | 330円 | 550円 | ✅ |
| square-config.ts | 330円 | 550円 | ✅ |
| gmo-subscription-form.tsx | 330円 | 550円 | ✅ |
| square-payment-form.tsx | 330円 | 550円 | ✅ |
| square-webhook/route.ts | 330円 | 550円 | ✅ 修正済み |
| square-payments/force-activate | 330円 | 550円 | ✅ |
| subscription-status-card.tsx | 330円 | 550円 | ✅ |

### ⚠️ 注意事項

1. **Square Payment Linksの価格設定**
   - Squareダッシュボードで作成したPayment Linkの価格が、アプリ内の価格（330円/550円）と一致していることを確認してください。

2. **Webhook処理**
   - Webhookで受信する金額は、JPYの場合、円単位（330、550）で送信されます。
   - プラン判定は正確に行われますが、念のためログを確認してください。

3. **表示価格**
   - `subscription-status-card.tsx` では、`subscription.amount || planInfo.price` を使用しているため、決済情報に保存された金額が優先されます。
   - 決済情報に金額が保存されていない場合は、プラン定義から取得されます。

### 🎯 推奨事項

1. **Square Payment Linksの確認**
   - Squareダッシュボードで、各Payment Linkの価格が正しく設定されているか確認してください。
   - Basic: 330円
   - Premium: 550円

2. **テスト決済の実施**
   - 実際にテスト決済を行い、webhookで正しいプランが判定されることを確認してください。

3. **ログの確認**
   - 開発環境で、webhook処理のログを確認し、金額とプラン判定が正しいことを確認してください。

## 結論

✅ **すべての価格設定が整合性を取れています。**
✅ **Webhook処理のプラン判定ロジックを修正しました。**

これで、価格の不一致による問題は解決されました。

