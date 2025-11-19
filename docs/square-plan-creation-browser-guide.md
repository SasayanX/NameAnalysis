# Squareサブスクリプションプラン作成 - ブラウザで簡単に

## 🚀 ブラウザの開発者ツールで作成（最も簡単）

### ステップ1: 開発サーバーを起動

ターミナルで以下を実行：

```bash
npm run dev
```

### ステップ2: ブラウザで開発者ツールを開く

1. ブラウザで `http://localhost:3000` にアクセス
2. **F12** キーを押して開発者ツールを開く
3. **Console** タブを選択
4. Consoleの入力欄に「**貼り付けを許可**」と入力してEnter

### ステップ3: プランを作成（エラー詳細表示付き）

Consoleタブに以下のコードをコピー&ペーストして、**Enter** キーを押してください：

#### ベーシックプランを作成

```javascript
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
    console.log('プラン名:', data.plan.name);
    console.log('価格:', data.plan.price, '円/月');
    console.log('');
    console.log('以下の環境変数を .env.local に追加してください:');
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=' + data.plan.id);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:');
      data.details.forEach((err, index) => {
        console.error(`  ${index + 1}. コード: ${err.code}`);
        console.error(`     メッセージ: ${err.detail}`);
        console.error(`     フィールド: ${err.field || 'N/A'}`);
      });
    }
    if (data.fullResponse) {
      console.error('完全なレスポンス:', data.fullResponse);
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})
.catch(error => {
  console.error('❌ ネットワークエラー:', error);
});
```

#### プレミアムプランを作成

```javascript
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
    console.log('プラン名:', data.plan.name);
    console.log('価格:', data.plan.price, '円/月');
    console.log('');
    console.log('以下の環境変数を .env.local に追加してください:');
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=' + data.plan.id);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:');
      data.details.forEach((err, index) => {
        console.error(`  ${index + 1}. コード: ${err.code}`);
        console.error(`     メッセージ: ${err.detail}`);
        console.error(`     フィールド: ${err.field || 'N/A'}`);
      });
    }
    if (data.fullResponse) {
      console.error('完全なレスポンス:', data.fullResponse);
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})
.catch(error => {
  console.error('❌ ネットワークエラー:', error);
});
```

### ステップ4: エラーの詳細を確認

エラーが発生した場合、Consoleに以下のような詳細が表示されます：

```
❌ エラー: サブスクリプションプランの作成に失敗しました
エラー詳細:
  1. コード: INVALID_REQUEST
     メッセージ: Field must not be blank
     フィールド: subscription_plan_data.phases[0].recurring_price_money.amount
```

この情報で、どのフィールドに問題があるかが分かります。

### ステップ5: プランIDを環境変数に設定

成功した場合、Consoleに表示されたプランIDを `.env.local` に追加：

```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=取得したベーシックプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=取得したプレミアムプランID
```

### ステップ6: 開発サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

---

## 📝 一括で両方のプランを作成

```javascript
// ベーシックプランを作成
fetch('http://localhost:3000/api/square-subscription-plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'basic' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ ベーシックプラン:', data.plan.id);
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=' + data.plan.id);
    // プレミアムプランを作成
    return fetch('http://localhost:3000/api/square-subscription-plans/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'premium' })
    });
  } else {
    console.error('❌ ベーシックプラン作成エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ プレミアムプラン:', data.plan.id);
    console.log('SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=' + data.plan.id);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 両方のプランが作成されました！');
    console.log('上記のプランIDを .env.local に追加してください。');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.error('❌ プレミアムプラン作成エラー:', data.error);
    if (data.details) {
      console.error('エラー詳細:', data.details);
    }
  }
})
.catch(error => {
  console.error('❌ ネットワークエラー:', error);
});
```

---

## 🆘 エラーが出た場合

### エラー: "Failed to fetch"

**原因**: 開発サーバーが起動していない

**解決方法**:
1. ターミナルで `npm run dev` を実行
2. `http://localhost:3000` にアクセスできることを確認
3. 再度Consoleでコードを実行

### エラー: 400 Bad Request

**原因**: Square APIのリクエスト形式に問題がある可能性

**確認方法**:
1. Consoleに表示されたエラー詳細を確認
2. `field` 名を確認（どのフィールドが問題か）
3. ターミナル（開発サーバー）のログも確認
   - `[Square Catalog API]` で始まるログを確認

---

## ✅ 成功した場合の表示

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ プレミアムプラン作成成功!
プランID: #プランID
プラン名: プレミアムプラン
価格: 550 円/月

以下の環境変数を .env.local に追加してください:
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=#プランID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

このプランIDを `.env.local` に追加してください。
