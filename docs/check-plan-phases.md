# プランのphases構造を確認する方法

## 現在のプランIDがトライアル期間付きかどうかを確認

以下のコマンドをブラウザのコンソール（`https://seimei.app`）で実行してください：

```javascript
// ベーシックプランの確認
fetch('https://seimei.app/api/square-subscription-plans/debug?planId=basic')
  .then(res => res.json())
  .then(data => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ベーシックプランの詳細:');
    console.log('プランID:', data.plan?.id);
    console.log('プラン名:', data.plan?.name);
    console.log('フェーズ数:', data.variation?.phasesCount);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (data.variation?.phases && data.variation.phases.length > 0) {
      console.log('Phase 0 (トライアル期間):');
      console.log('  - cadence:', data.variation.phases[0].cadence);
      console.log('  - periods:', data.variation.phases[0].periods);
      console.log('  - price:', data.variation.phases[0].pricing?.price_money?.amount);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (data.variation.phases.length > 1) {
        console.log('Phase 1 (通常の課金期間):');
        console.log('  - cadence:', data.variation.phases[1].cadence);
        console.log('  - price:', data.variation.phases[1].pricing?.price_money?.amount);
      }
    } else {
      console.log('⚠️ フェーズが設定されていません。トライアル期間付きプランを作成する必要があります。');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  })
  .catch(err => console.error('❌ エラー:', err));

// プレミアムプランの確認
fetch('https://seimei.app/api/square-subscription-plans/debug?planId=premium')
  .then(res => res.json())
  .then(data => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 プレミアムプランの詳細:');
    console.log('プランID:', data.plan?.id);
    console.log('プラン名:', data.plan?.name);
    console.log('フェーズ数:', data.variation?.phasesCount);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (data.variation?.phases && data.variation.phases.length > 0) {
      console.log('Phase 0 (トライアル期間):');
      console.log('  - cadence:', data.variation.phases[0].cadence);
      console.log('  - periods:', data.variation.phases[0].periods);
      console.log('  - price:', data.variation.phases[0].pricing?.price_money?.amount);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (data.variation.phases.length > 1) {
        console.log('Phase 1 (通常の課金期間):');
        console.log('  - cadence:', data.variation.phases[1].cadence);
        console.log('  - price:', data.variation.phases[1].pricing?.price_money?.amount);
      }
    } else {
      console.log('⚠️ フェーズが設定されていません。トライアル期間付きプランを作成する必要があります。');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  })
  .catch(err => console.error('❌ エラー:', err));
```

## 確認結果に基づく対応

### ケース1: フェーズ数が1つ、またはPhase 0の価格が0円でない場合

→ **トライアル期間付きプランを作成する必要があります**

以下のコマンドを実行して、新しいプランを作成してください：

```javascript
// ベーシックプランを作成
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'basic' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ ベーシックプラン作成成功!');
    console.log('新しいプランID:', data.plan.id);
    console.log('環境変数名:', data.envVariable.name);
    console.log('環境変数値:', data.envVariable.value);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️ 重要: Netlify環境変数を更新してください:');
    console.log(`${data.envVariable.name}=${data.envVariable.value}`);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
});

// プレミアムプランを作成
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'premium' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ プレミアムプラン作成成功!');
    console.log('新しいプランID:', data.plan.id);
    console.log('環境変数名:', data.envVariable.name);
    console.log('環境変数値:', data.envVariable.value);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️ 重要: Netlify環境変数を更新してください:');
    console.log(`${data.envVariable.name}=${data.envVariable.value}`);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
});
```

### ケース2: フェーズ数が2つ、Phase 0の価格が0円、Phase 1の価格が330円/550円の場合

→ **既にトライアル期間付きプランが設定されています** ✅

環境変数を更新するだけで完了です。

