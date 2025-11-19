# Google Play Billing - コンソールログ確認ガイド

## 確認済み項目

✅ **商品ID**: 一致している  
✅ **商品の状態**: アクティブ  
✅ **マーチャントアカウント**: 設定済み  
✅ **ライセンステスト**: 有効化済み（LICENSED）

## 次の確認事項

### 1. アプリ側のコンソールログを確認 ⭐ 最重要

TWAアプリで以下を確認してください：

#### ステップ1: TWAアプリを起動

1. AndroidデバイスでTWAアプリを起動
2. ブラウザの開発者ツールを開く（Chrome DevTools）
   - デバイスをUSB接続して、Chrome DevToolsでリモートデバッグ
   - または、TWAアプリ内でWebViewのデバッグを有効化

#### ステップ2: コンソールログを確認

`/pricing`ページにアクセスして、以下のログが表示されるか確認：

**正常な場合のログ**:
```
[Pricing] TWA環境判定: true
[Pricing] Google Play Billing初期化結果: true
[Google Play Billing] Digital Goods API initialized successfully
```

**エラーがある場合のログ**:
```
[Pricing] TWA環境判定: false
[Pricing] Google Play Billing初期化結果: false
[Google Play Billing] Digital Goods API not available after retries
```

#### ステップ3: 購入ボタンをクリック

1. `/pricing`ページでGoogle Play Billingボタンをクリック
2. コンソールにエラーメッセージが表示されるか確認
3. エラーメッセージの詳細を確認

**確認すべきエラーメッセージ**:
- `デベロッパーが初回購入を許可していません`
- `Digital Goods API is not available`
- `Failed to initialize Digital Goods API`
- その他のエラーメッセージ

### 2. AABのバージョンとplayBilling機能を確認

#### ステップ1: AABのバージョンコードを確認

1. Google Play Console → **テスト** → **内部テスト**
2. アップロードしたAABのバージョンコードを確認
3. 最新のAAB（バージョンコード13）がアップロードされているか確認

#### ステップ2: playBilling機能が含まれているか確認

```bash
cd twa
bubblewrap fingerprint
```

`twa-manifest.json`の`features.playBilling`が`true`であることを確認：

```json
{
  "features": {
    "playBilling": {
      "enabled": true
    }
  }
}
```

#### ステップ3: AABを再ビルド（必要に応じて）

`playBilling`機能が有効化されていない場合：

```bash
cd twa
bubblewrap update
bubblewrap build
```

### 3. 商品の設定を再確認

#### ステップ1: 商品の詳細を確認

1. Google Play Console → **収益化** → **商品** → **サブスクリプション**
2. `basic_monthly`と`premium_monthly`の詳細を開く
3. 以下の項目を確認：
   - **商品ID**: `basic_monthly` / `premium_monthly`
   - **状態**: アクティブ
   - **価格**: 330円 / 550円
   - **課金期間**: 1ヶ月

#### ステップ2: 商品の公開状態を確認

- 商品が**「アクティブ」**になっているか確認
- 商品が**「下書き」**の場合は、アクティブ化が必要

### 4. デバッグ用のコンソールコマンド

TWAアプリのコンソールで以下を実行：

```javascript
// 1. TWA環境かどうか確認
console.log('TWA環境:', window.matchMedia('(display-mode: standalone)').matches)

// 2. Digital Goods APIが利用可能か確認
console.log('Digital Goods API:', typeof window.getDigitalGoodsService !== 'undefined')

// 3. 商品IDを確認
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly')
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly')

// 4. Digital Goods APIを手動で初期化
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

## よくある問題と解決方法

### 問題1: Digital Goods APIが初期化されない

**原因**:
- TWAアプリが正しくビルドされていない
- `playBilling`機能が有効化されていない
- AABが古い

**解決方法**:
1. `twa-manifest.json`で`playBilling`機能を有効化
2. AABを再ビルド
3. 最新のAABをアップロード

### 問題2: 「初回購入を許可していません」エラー

**原因**:
- 商品の設定に問題がある
- AABが古い
- 商品IDが一致していない

**解決方法**:
1. 商品IDが一致しているか確認
2. 商品がアクティブになっているか確認
3. 最新のAABをアップロード

### 問題3: TWA環境と判定されない

**原因**:
- 通常のブラウザでアクセスしている
- TWAアプリが正しくインストールされていない

**解決方法**:
1. AndroidデバイスでTWAアプリを起動
2. 通常のブラウザではなく、TWAアプリ内でアクセス

## 次のステップ

1. **コンソールログを確認** - エラーメッセージの詳細を確認
2. **AABのバージョンを確認** - 最新のAABがアップロードされているか確認
3. **playBilling機能を確認** - `twa-manifest.json`で有効化されているか確認

問題が続く場合は、**コンソールのエラーメッセージの詳細**を教えてください。


