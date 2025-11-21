# 3日間無料トライアル付きプランの作成手順

## 概要

既存のサブスクリプションプランを削除し、3日間の無料トライアル期間を含む新しいプランを作成する手順です。

## ⚠️ 重要な注意事項

1. **既存のプランは削除する必要があります**
   - Square APIでは、一度作成したプランの`phases`構造は変更できません
   - トライアル期間を追加するには、新しいプランを作成する必要があります

2. **既存のサブスクリプションに影響**
   - 既存のサブスクリプションは、新しいプランに自動的に移行されません
   - 既存ユーザーは、現在のプランのまま継続されます
   - 新規ユーザーのみ、トライアル期間付きプランが適用されます

## 手順

### ステップ1: 既存のプランIDを確認

現在の環境変数を確認してください：

```bash
# Netlify環境変数から確認
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=既存のベーシックプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=既存のプレミアムプランID
```

### ステップ2: 新しいプランを作成（トライアル期間付き）

本番環境（`https://seimei.app`）で実行してください：

**ベーシックプラン:**
```javascript
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'basic' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ ベーシックプラン作成成功!');
    console.log('プランID:', data.plan.id);
    console.log('環境変数名:', data.envVariable.name);
    console.log('環境変数値:', data.envVariable.value);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Netlify環境変数に設定してください:');
    console.log(`${data.envVariable.name}=${data.envVariable.value}`);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
    if (data.requestBody) {
      console.error('リクエストボディ:', JSON.stringify(data.requestBody, null, 2));
    }
  }
})
.catch(err => {
  console.error('❌ リクエストエラー:', err);
});
```

**プレミアムプラン:**
```javascript
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'premium' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ プレミアムプラン作成成功!');
    console.log('プランID:', data.plan.id);
    console.log('環境変数名:', data.envVariable.name);
    console.log('環境変数値:', data.envVariable.value);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Netlify環境変数に設定してください:');
    console.log(`${data.envVariable.name}=${data.envVariable.value}`);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
    if (data.requestBody) {
      console.error('リクエストボディ:', JSON.stringify(data.requestBody, null, 2));
    }
  }
})
.catch(err => {
  console.error('❌ リクエストエラー:', err);
});
```

### ステップ3: エラーが発生した場合の対処

**エラー: `periods`フィールドが無効**

Square APIの`phases`構造で`periods`フィールドが正しくない場合は、以下のように修正してください：

```typescript
// app/api/square-subscription-plans/create/route.ts の73-84行目を修正
{
  cadence: "DAILY",
  ordinal: 0,
  // periods: 3, // このフィールドが無効な場合
  recurring_periods: 3, // または別のフィールド名
  pricing: {
    type: "STATIC",
    price_money: {
      amount: 0,
      currency: "JPY",
    },
  },
}
```

**エラー: `cadence: "DAILY"`が無効**

Square APIで`DAILY`がサポートされていない場合は、以下のように修正してください：

```typescript
// app/api/square-subscription-plans/create/route.ts の73-84行目を修正
{
  cadence: "MONTHLY", // DAILYの代わりにMONTHLYを使用
  ordinal: 0,
  periods: 1, // 1ヶ月間のトライアル（推奨: 3日間のトライアルは別の方法で実装）
  pricing: {
    type: "STATIC",
    price_money: {
      amount: 0,
      currency: "JPY",
    },
  },
}
```

### ステップ4: 環境変数を更新

新しいプランIDをNetlify環境変数に設定してください：

```
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=新しいベーシックプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=新しいプレミアムプランID
```

### ステップ5: デプロイ

環境変数を更新した後、Netlifyで再デプロイしてください。

## プランの構造

新しいプランには以下の2つのフェーズが含まれます：

- **Phase 0（トライアル期間）**:
  - 期間: 3日間
  - 価格: 0円（無料）
  - カデンス: DAILY（またはMONTHLY）

- **Phase 1（通常の課金期間）**:
  - 期間: 1ヶ月
  - 価格: 330円（ベーシック）または550円（プレミアム）
  - カデンス: MONTHLY

## 確認事項

1. ✅ 新しいプランが作成されたか
2. ✅ プランIDが正しく環境変数に設定されたか
3. ✅ デプロイが完了したか
4. ✅ 新規ユーザーがトライアル期間を利用できるか

## トラブルシューティング

### プラン作成が失敗する場合

1. Square APIのエラーメッセージを確認
2. `requestBody`を確認して、`phases`構造が正しいか確認
3. Square APIのドキュメントで最新の構造を確認
4. 必要に応じて、`app/api/square-subscription-plans/create/route.ts`を修正

### 既存のサブスクリプションに影響がある場合

- 既存のサブスクリプションは、新しいプランに自動的に移行されません
- 既存ユーザーは、現在のプランのまま継続されます
- 新規ユーザーのみ、トライアル期間付きプランが適用されます

