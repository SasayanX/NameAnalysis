# Google Play Billing - 「初回購入を許可していません」エラー デバッグガイド

## 確認済み情報

✅ **商品ID**: 一致している
- ベーシック: `basic_monthly`
- プレミアム: `premium_monthly`

✅ **商品の状態**: アクティブ

✅ **マーチャントアカウント**: 設定済み

✅ **ライセンステスト**: 有効化済み（LICENSED）

## エラーの原因候補

### 1. テストアカウントの設定（最重要）

**確認方法**:
1. Google Play Console → **設定** → **ライセンステスト**
2. **ライセンステストを有効にする** がオンになっているか確認
3. **Gmailアカウント** にテスト用のGoogleアカウントが追加されているか確認

**問題がある場合**:
- ライセンステストを有効化する必要があります
- テスト用のGoogleアカウントを追加する必要があります

**重要**: ライセンステストが有効になっていないと、「初回購入を許可していません」エラーが発生することがあります。

### 2. アプリのバージョン（AAB）

**確認方法**:
1. **テスト** → **内部テスト**（または使用しているトラック）
2. アップロードしたAABのバージョンコードを確認
3. 最新のAAB（バージョンコード13）がアップロードされているか確認

**問題がある場合**:
- 最新のAABを再アップロードする必要があります

### 3. テストアカウントの設定

**確認方法**:
1. **設定** → **ライセンステスト**
2. **ライセンステストを有効にする** がオンになっているか確認
3. テスト用のGoogleアカウントが追加されているか確認

**問題がある場合**:
- テストアカウントを追加する必要があります

### 4. アプリ側の実装確認

**確認方法**:
1. TWAアプリを起動
2. ブラウザのコンソール（開発者ツール）を開く
3. `/pricing`ページにアクセス
4. コンソールにエラーメッセージが表示されていないか確認

**確認すべきログ**:
```
[Pricing] TWA環境判定: true/false
[Pricing] Google Play Billing初期化結果: true/false
[Google Play Billing] Digital Goods API initialized successfully
```

### 5. 商品IDの環境変数確認

**確認方法**:
`.env.local`で以下が設定されているか確認：

```env
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=basic_monthly
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=premium_monthly
```

**注意**: 環境変数が設定されていない場合、デフォルト値（`basic_monthly`、`premium_monthly`）が使用されます。

## デバッグ手順

### ステップ1: アプリ側で商品IDを確認

ブラウザのコンソールで以下を実行：

```javascript
// 現在の商品IDを確認
console.log('Basic:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly')
console.log('Premium:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly')
```

### ステップ2: Google Play Billingの初期化を確認

コンソールで以下を確認：

```javascript
// TWA環境かどうか
console.log('TWA環境:', window.matchMedia('(display-mode: standalone)').matches)

// Digital Goods APIが利用可能か
console.log('Digital Goods API:', typeof window.getDigitalGoodsService !== 'undefined')
```

### ステップ3: 購入フローをテスト

1. `/pricing`ページでGoogle Play Billingボタンをクリック
2. コンソールにエラーメッセージが表示されるか確認
3. エラーメッセージの詳細を確認

## よくある原因と解決方法

### 原因1: テストアカウント（ライセンステスト）未設定

**解決方法**:
1. Google Play Console → **設定** → **ライセンステスト**
2. **ライセンステストを有効にする** をオンにする
3. **Gmailアカウント** にテスト用のGoogleアカウントを追加
4. **保存** をクリック

**注意**: テストアカウントで購入しても、実際には課金されません。

### 原因2: 古いAABがアップロードされている

**解決方法**:
1. 最新のAAB（バージョンコード13）を再アップロード
2. 内部テストトラックでリリース

### 原因3: テストアカウントが設定されていない

**解決方法**:
1. **設定** → **ライセンステスト**
2. テスト用のGoogleアカウントを追加

### 原因4: アプリ側の実装問題

**解決方法**:
1. コンソールのエラーメッセージを確認
2. Digital Goods APIの初期化が成功しているか確認
3. 商品IDが正しく渡されているか確認

## 次のステップ（優先順位順）

### 1. テストアカウント（ライセンステスト）の設定 ⭐ 最重要

1. Google Play Console → **設定** → **ライセンステスト**
2. **ライセンステストを有効にする** をオンにする
3. **Gmailアカウント** にテスト用のGoogleアカウントを追加
   - テストに使用するGoogleアカウントのメールアドレスを追加
   - 例: `test@gmail.com`
4. **保存** をクリック

**重要**: この設定が完了していないと、購入テストができません。

### 2. 最新のAABがアップロードされているか確認 ⭐ 重要

**確認方法**:
1. **テスト** → **内部テスト**
2. アップロードしたAABのバージョンコードを確認
3. 最新のAAB（バージョンコード13）がアップロードされているか確認
4. AABに`playBilling`機能が含まれているか確認

**問題がある場合**:
- 最新のAABを再アップロードする必要があります
- `twa-manifest.json`に`playBilling`機能が有効化されているか確認

**確認コマンド**:
```bash
cd twa
bubblewrap fingerprint
```
`twa-manifest.json`の`features.playBilling`が`true`であることを確認

### 3. アプリ側のコンソールログを確認

1. TWAアプリを起動
2. ブラウザのコンソール（開発者ツール）を開く
3. `/pricing`ページにアクセス
4. コンソールにエラーメッセージが表示されていないか確認

問題が続く場合は、コンソールのエラーメッセージの詳細を教えてください。

