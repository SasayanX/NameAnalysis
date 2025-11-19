# Google Play Billing - 「初回購入を許可していません」エラー対策

## エラーメッセージ

```
デベロッパーが初回購入を許可していません
```

## 確認事項

### 1. 商品IDの一致を確認

**最も可能性が高い原因**: アプリ側の商品IDとGoogle Play Consoleの商品IDが一致していない

#### アプリ側の商品ID（デフォルト）

- ベーシック: `basic_monthly`（アンダースコア）
- プレミアム: `premium_monthly`（アンダースコア）

#### Google Play Consoleで確認

1. **収益化** → **商品** → **サブスクリプション**
2. 作成した商品の**商品ID**を確認
3. アプリ側の環境変数と一致しているか確認

#### 環境変数の設定

`.env.local`または本番環境の環境変数で、Google Play Consoleの商品IDと一致させる：

```env
# Google Play Consoleで作成した商品IDと一致させる
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=basic_monthly
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=premium_monthly
```

**注意**: 
- Google Play Consoleで`basic-monthly`（ハイフン）を作成した場合、環境変数も`basic-monthly`にする
- Google Play Consoleで`basic_monthly`（アンダースコア）を作成した場合、環境変数も`basic_monthly`にする

### 2. 商品の状態を確認

1. **収益化** → **商品** → **サブスクリプション**
2. 商品の状態が**「アクティブ」**になっているか確認
3. 商品が**「下書き」**の場合は、アクティブ化が必要

### 3. マーチャントアカウントの確認

1. **収益化** → **設定**
2. マーチャントアカウントが正しく設定されているか確認
3. 銀行口座情報が登録されているか確認

### 4. アプリのバージョン確認

1. **テスト** → **内部テスト**（または使用しているトラック）
2. アップロードしたAABのバージョンコードを確認
3. 最新のAABがアップロードされているか確認

## 商品IDの不一致を修正する方法

### 方法1: 環境変数を修正（推奨）

Google Play Consoleの商品IDに合わせて環境変数を設定：

```env
# Google Play Consoleで確認した商品IDを使用
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=実際の商品ID
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=実際の商品ID
```

### 方法2: Google Play Consoleで商品IDを再作成

1. 既存の商品を削除（既存購読者への影響に注意）
2. アプリ側の商品ID（`basic_monthly`、`premium_monthly`）に合わせて新規作成

## デバッグ方法

### アプリ側で商品IDを確認

ブラウザのコンソールで以下を実行：

```javascript
// 現在の商品IDを確認
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly')
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly')
```

### Google Play Consoleで商品IDを確認

1. **収益化** → **商品** → **サブスクリプション**
2. 各商品の**商品ID**をコピー
3. アプリ側の環境変数と比較

## よくある原因

1. **商品IDの不一致**（最も多い）
   - アプリ側: `basic_monthly`
   - Google Play: `basic-monthly`
   - → 一致させる必要がある

2. **商品が下書き状態**
   - 商品をアクティブ化する必要がある

3. **マーチャントアカウント未設定**
   - 収益化設定を完了する必要がある

4. **古いAABがアップロードされている**
   - 最新のAABを再アップロードする必要がある


