# トライアル期間付きプラン作成（簡単版）

## ベーシックプランを作成

以下のコマンドを**1行ずつ**ブラウザコンソールで実行してください：

```javascript
fetch('https://seimei.app/api/square-subscription-plans/create', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({planId: 'basic'})}).then(res => res.json()).then(data => {if(data.success){console.log('✅ ベーシックプラン作成成功!');console.log('新しいプランID:', data.plan.id);console.log('環境変数:', data.envVariable.name + '=' + data.envVariable.value);}else{console.error('❌ エラー:', data.error);if(data.details){console.error('エラー詳細:', data.details);}}});
```

## プレミアムプランを作成

```javascript
fetch('https://seimei.app/api/square-subscription-plans/create', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({planId: 'premium'})}).then(res => res.json()).then(data => {if(data.success){console.log('✅ プレミアムプラン作成成功!');console.log('新しいプランID:', data.plan.id);console.log('環境変数:', data.envVariable.name + '=' + data.envVariable.value);}else{console.error('❌ エラー:', data.error);if(data.details){console.error('エラー詳細:', data.details);}}});
```

## または、複数行で実行する場合

```javascript
// ベーシックプラン
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({planId: 'basic'})
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ ベーシックプラン作成成功!');
    console.log('新しいプランID:', data.plan.id);
    console.log('環境変数:', data.envVariable.name + '=' + data.envVariable.value);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) console.error('エラー詳細:', data.details);
  }
});
```

```javascript
// プレミアムプラン
fetch('https://seimei.app/api/square-subscription-plans/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({planId: 'premium'})
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ プレミアムプラン作成成功!');
    console.log('新しいプランID:', data.plan.id);
    console.log('環境変数:', data.envVariable.name + '=' + data.envVariable.value);
  } else {
    console.error('❌ エラー:', data.error);
    if (data.details) console.error('エラー詳細:', data.details);
  }
});
```

