# Squareプラン再作成ガイド

既存のプランには`subscription_plan_variations`が含まれていないため、プランを再作成する必要があります。

## 手順

### 1. ブラウザのコンソールで既存のプランを確認

```javascript
// 既存のプラン一覧を取得
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'GET'
})
.then(res => res.json())
.then(data => {
  console.log('既存のプラン:', data.plans);
});
```

### 2. プランを再作成

ブラウザのコンソールで以下のコマンドを実行してください：

```javascript
// ベーシックプランを再作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'basic' })
})
.then(res => res.json())
.then(data => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (data.success) {
    console.log('✅ ベーシックプラン作成成功!');
    console.log('プランID:', data.plan.id);
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=' + data.plan.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
});

// プレミアムプランを再作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'premium' })
})
.then(res => res.json())
.then(data => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (data.success) {
    console.log('✅ プレミアムプラン作成成功!');
    console.log('プランID:', data.plan.id);
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=' + data.plan.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
});
```

### 3. 新しいプランIDを`.env.local`に設定

再作成されたプランIDを`.env.local`に設定してください。

### 4. デバッグAPIで確認

```javascript
// ベーシックプランの構造を確認
fetch('http://localhost:3000/api/square-subscription-plans/debug?planId=basic')
.then(res => res.json())
.then(data => {
  console.log('ベーシックプラン:', data.analysis);
});

// プレミアムプランの構造を確認
fetch('http://localhost:3000/api/square-subscription-plans/debug?planId=premium')
.then(res => res.json())
.then(data => {
  console.log('プレミアムプラン:', data.analysis);
});
```

`subscriptionPlanVariations`が空でないことを確認してください。

## 注意事項

- 既存のプランは削除されませんが、新しいプランIDが生成されます
- 古いプランIDは使用できなくなるため、必ず新しいプランIDを`.env.local`に設定してください



