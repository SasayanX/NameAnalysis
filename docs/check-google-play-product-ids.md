# Google Play商品IDの確認方法

## 現在の設定

コードでは以下のデフォルト値が設定されています：

- **ベーシックプラン**: `basic_monthly`
- **プレミアムプラン**: `premium_monthly`

環境変数が設定されていない場合、これらのデフォルト値が使用されます。

## Google Play Consoleで確認する方法

### 1. Google Play Consoleにログイン

1. [Google Play Console](https://play.google.com/console)にログイン
2. アプリを選択（例: `com.nameanalysis.ai`）

### 2. サブスクリプション商品を確認

1. 左メニューから **収益化** → **商品** → **サブスクリプション** を選択
2. 作成済みのサブスクリプション商品の一覧が表示されます
3. 各商品の**商品ID**を確認

### 3. 商品IDの形式

Google Play Consoleの商品IDは以下の形式です：
- 小文字、数字、アンダースコア（`_`）、ハイフン（`-`）が使用可能
- 例: `basic_monthly`, `premium_monthly`, `basic-monthly`, `premium-monthly`

**重要**: 商品IDは作成後に変更できません。

## 環境変数の設定

Google Play Consoleで確認した商品IDを環境変数に設定してください：

```bash
# Netlify環境変数
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=basic_monthly
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=premium_monthly
```

## 確認方法

### 方法1: ブラウザコンソールで確認

開発サーバーを起動し、ブラウザコンソールで以下を実行：

```javascript
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly');
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly');
```

### 方法2: コードで確認

`lib/google-play-product-ids.ts`を確認：

```typescript
export const GOOGLE_PLAY_PRODUCT_IDS = {
  basic: process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC ?? "basic_monthly",
  premium: process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM ?? "premium_monthly",
}
```

## よくある問題

### 問題1: 商品IDが一致しない

**症状**: 購入時にエラーが発生する

**原因**: Google Play Consoleで作成した商品IDと環境変数の設定が一致していない

**解決方法**:
1. Google Play Consoleで実際の商品IDを確認
2. 環境変数を正しい商品IDに更新
3. アプリを再デプロイ

### 問題2: 商品IDにハイフンを使用している

**症状**: 商品IDが`basic-monthly`（ハイフン）の場合

**解決方法**: 環境変数にハイフンを含む商品IDを設定：

```bash
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=basic-monthly
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=premium-monthly
```

**注意**: コードのデフォルト値は`basic_monthly`（アンダースコア）なので、Google Play Consoleでハイフンを使用している場合は環境変数を必ず設定してください。

## 本番環境での確認

本番環境で商品IDが正しく設定されているか確認するには：

1. Netlify Dashboard > Site settings > Environment variables
2. `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC`と`NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM`を確認
3. Google Play Consoleの商品IDと一致しているか確認

## まとめ

- ✅ `basic_monthly`と`premium_monthly`は有効な商品ID形式です
- ✅ Google Play Consoleで実際に作成した商品IDと一致しているか確認してください
- ✅ 環境変数が設定されていない場合、デフォルト値（`basic_monthly`、`premium_monthly`）が使用されます
- ✅ 商品IDにハイフン（`-`）を使用している場合は、環境変数を必ず設定してください

