# Chrome DevTools - モバイル画面がPCモニターに表示されている場合

## 状態

Androidデバイスの画面がPCモニターに表示されている = **Chrome DevToolsのリモートデバッグ接続は正常です** ✅

## 次のステップ

### 1. Consoleタブを開く

1. Chrome DevToolsの上部にあるタブを確認
2. **Console**タブをクリック
3. Consoleタブが開きます

### 2. フィルター設定を確認

Consoleタブの上部にあるフィルターボタンを確認：

- ✅ **Verbose**（すべてのログ）
- ✅ **Info**（情報ログ）
- ✅ **Warning**（警告ログ）
- ✅ **Error**（エラーログ）

すべてのログレベルが有効になっているか確認してください。

### 3. ページをリロード

1. **TWAアプリでページをリロード**
   - TWAアプリ内でページをスワイプダウンしてリロード
   - または、TWAアプリを一度閉じて再度起動

2. **Chrome DevToolsでページをリロード**
   - Chrome DevToolsのリロードボタン（F5キー）を押す

### 4. 手動でログを出力して確認

Consoleタブで以下を実行：

```javascript
console.log('Test log message')
```

これで「Test log message」が表示されれば、Consoleは正常に動作しています。

### 5. TWAアプリでページにアクセス

1. TWAアプリで`/pricing`ページにアクセス
2. Chrome DevToolsのConsoleタブを確認
3. 以下のようなログが表示されるはずです：

```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

## 確認すべきログ

### 正常な場合

```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

### エラーがある場合

```
[Pricing] TWA環境判定: false
[Pricing] Google Play Billing初期化結果: false
[Google Play Billing] Digital Goods API not available after retries
```

## 購入ボタンをクリックしてエラーを確認

1. TWAアプリで`/pricing`ページにアクセス
2. Google Play Billingボタンをクリック
3. Chrome DevToolsのConsoleタブでエラーメッセージを確認

**確認すべきエラーメッセージ**:
- `デベロッパーが初回購入を許可していません`
- `Digital Goods API is not available`
- `Failed to initialize Digital Goods API`
- その他のエラーメッセージ

## デバッグ用のコンソールコマンド

Consoleタブで以下を実行：

### TWA環境の確認

```javascript
console.log('TWA環境:', window.matchMedia('(display-mode: standalone)').matches)
```

### Digital Goods APIの確認

```javascript
console.log('Digital Goods API:', typeof window.getDigitalGoodsService !== 'undefined')
```

### 商品IDの確認

```javascript
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly')
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly')
```

### Digital Goods APIを手動で初期化

```javascript
if (typeof window.getDigitalGoodsService !== 'undefined') {
  window.getDigitalGoodsService('https://play.google.com/billing')
    .then(service => {
      console.log('Digital Goods API initialized:', service)
      return service.getDetails(['basic_monthly', 'premium_monthly'])
    })
    .then(details => {
      console.log('Product details:', details)
    })
    .catch(error => {
      console.error('Digital Goods API error:', error)
    })
}
```

## 次のステップ

1. **Consoleタブを開く**
2. **フィルター設定を確認**（すべてのログレベルを有効にする）
3. **TWAアプリで`/pricing`ページにアクセス**
4. **Consoleタブでログを確認**
5. **購入ボタンをクリックしてエラーメッセージを確認**

エラーメッセージが見つかったら、その内容を教えてください。


