# テスト用：龍の息吹を追加する方法

## APIエンドポイント

`POST /api/dragon-breath/add-test`

## 使用方法

### 1. ブラウザのコンソールから実行

開発サーバーを起動した状態で、ブラウザのコンソール（F12）から以下のコードを実行：

```javascript
// ユーザーIDを取得（ログインしている必要があります）
const userId = localStorage.getItem('userId');

// 龍の息吹を追加（例：5個追加、プレミアムプラン）
fetch('/api/dragon-breath/add-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: userId,
    count: 5,        // 追加する個数（デフォルト: 1）
    plan: 'premium'  // プラン: 'free', 'basic', 'premium'（デフォルト: 'premium'）
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ 龍の息吹追加成功:', data);
  // ページをリロードして反映
  window.location.reload();
})
.catch(error => {
  console.error('❌ エラー:', error);
});
```

### 2. curlコマンドから実行

```bash
curl -X POST http://localhost:3000/api/dragon-breath/add-test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "count": 5,
    "plan": "premium"
  }'
```

### 3. パラメータ

- `userId` (必須): ユーザーID
- `count` (オプション): 追加する個数（デフォルト: 1）
- `plan` (オプション): プラン（'free', 'basic', 'premium'、デフォルト: 'premium'）
  - `free`: 1回分
  - `basic`: 2回分
  - `premium`: 3回分

### 4. 注意事項

- **本番環境では使用不可**: このAPIは開発環境でのみ動作します
- 追加された龍の息吹は、通常の購入と同様に動作します
- テスト用として追加されたアイテムは、`metadata.test: true`が設定されます

## 例

### プレミアムプランで10個追加

```javascript
fetch('/api/dragon-breath/add-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: localStorage.getItem('userId'),
    count: 10,
    plan: 'premium'
  })
})
.then(res => res.json())
.then(data => {
  console.log('追加成功:', data);
  window.location.reload();
});
```

### 無料プランで3個追加

```javascript
fetch('/api/dragon-breath/add-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: localStorage.getItem('userId'),
    count: 3,
    plan: 'free'
  })
})
.then(res => res.json())
.then(data => {
  console.log('追加成功:', data);
  window.location.reload();
});
```

