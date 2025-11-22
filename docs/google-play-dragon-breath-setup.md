# Google Play Billing - 龍の息吹商品設定ガイド

## 概要

「龍の息吹」をGoogle Play Billingで購入できるようにするための設定手順です。

## 前提条件

- ✅ Google Play Developerアカウント
- ✅ マーチャントアカウントの設定完了
- ✅ TWAアプリのビルドと公開

## ステップ1: Google Play Consoleで商品を作成

### 1.1 アプリ内商品の作成

1. [Google Play Console](https://play.google.com/console)にログイン
2. アプリ「まいにちAI姓名判断」を選択
3. 左メニューから **収益化** → **商品** → **アプリ内商品** を選択
4. **商品を作成** ボタンをクリック

### 1.2 商品情報の入力

#### 基本情報

- **商品ID**: `dragon_breath`
  - ⚠️ **重要**: このIDは後で変更できません
  - 小文字、数字、アンダースコアのみ使用可能
  - 既に作成済みの場合は、このIDを使用してください

- **名前**: `龍の息吹`
  - ユーザーに表示される名前

- **説明**: 
  ```
  AI深層言霊鑑定を利用できる特別なアイテムです。
  
  【プラン別の利用回数】
  • 無料プラン: 1回
  • ベーシックプラン: 2回
  • プレミアムプラン: 3回
  
  購入後、すぐに使用できます。
  ```

#### 価格と請求

1. **基本価格**: `¥120`
   - 日本円を選択
   - 120円を設定

2. **商品タイプ**: `一回限りの購入（Consumable）`
   - 複数回購入可能な商品として設定

3. **ステータス**: `アクティブ`
   - 商品を有効化

### 1.3 商品の保存と公開

1. すべての情報を入力後、**保存** をクリック
2. 商品が正しく作成されたことを確認
3. 必要に応じて、**公開** をクリックして商品を公開

## ステップ2: 環境変数の設定

### 2.1 ローカル開発環境（.env.local）

```env
# Google Play Billing - 龍の息吹商品ID
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_DRAGON_BREATH=dragon_breath
```

### 2.2 本番環境（Vercel等）

1. Vercel Dashboard → Settings → Environment Variables
2. 以下の環境変数を追加：
   - `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_DRAGON_BREATH` = `dragon_breath`

## ステップ3: 動作確認

### 3.1 TWA環境での確認

1. TWAアプリを起動
2. `/shop/talisman?tab=yen` にアクセス
3. 「龍の息吹」を選択
4. 購入ボタンをクリック
5. Google Play Billingの購入画面が表示されることを確認
6. テスト購入を実行（Google Play Consoleでテストアカウントを設定）

### 3.2 購入フローの確認

1. **購入開始**: Google Play Billingの購入画面が表示される
2. **購入完了**: 購入が完了すると、`/api/dragon-breath/purchase-google-play` が呼び出される
3. **購入検証**: サーバー側でGoogle Play Developer APIを使用して購入を検証
4. **アイテム付与**: `special_items`テーブルに「龍の息吹」が保存される
5. **確認メッセージ**: 「購入が完了しました！龍の息吹が付与されました。」と表示される

## ステップ4: テスト購入の設定

### 4.1 ライセンステストアカウントの追加

1. Google Play Console → **設定** → **ライセンステスト**
2. **ライセンステスター** セクションで、テスト用のGmailアカウントを追加
3. 追加したアカウントでログインしたデバイスで、テスト購入が可能になります

### 4.2 テスト購入の実行

1. ライセンステスターアカウントでログイン
2. TWAアプリで「龍の息吹」を購入
3. 実際の課金は発生せず、テスト購入として処理されます

## トラブルシューティング

### 問題1: 購入ボタンが表示されない

**原因**: Google Play Billingが初期化されていない

**解決策**:
- TWA環境であることを確認
- ブラウザのコンソールでエラーログを確認
- `GooglePlayBillingDetector.initialize()` が成功しているか確認

### 問題2: 購入が失敗する

**原因**: 商品IDが一致していない、または商品が公開されていない

**解決策**:
- Google Play Consoleで商品IDが `dragon_breath` であることを確認
- 商品のステータスが「アクティブ」であることを確認
- 環境変数 `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_DRAGON_BREATH` が正しく設定されているか確認

### 問題3: 購入検証が失敗する

**原因**: Google Play Developer APIのサービスアカウントキーが設定されていない

**解決策**:
- 環境変数 `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH` または `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON` を設定
- サービスアカウントに「Google Play Android Developer API」の権限があることを確認

### 問題4: 購入後、アイテムが付与されない

**原因**: 購入確認APIのエラー

**解決策**:
- サーバーログでエラーを確認
- `special_items`テーブルにデータが保存されているか確認
- Supabaseの接続設定を確認

## 実装の詳細

### 商品IDの取得

```typescript
import { getGooglePlayProductId } from '@/lib/google-play-product-ids'

const productId = getGooglePlayProductId('dragonBreath')
// 結果: 'dragon_breath'（環境変数が設定されていない場合のデフォルト値）
```

### 購入処理

```typescript
import { GooglePlayBillingDetector } from '@/lib/google-play-billing-detector'
import { getGooglePlayProductId } from '@/lib/google-play-product-ids'

// 商品IDを取得
const productId = getGooglePlayProductId('dragonBreath')

// 購入を実行
const purchase = await GooglePlayBillingDetector.purchase(productId)

// 購入確認APIを呼び出し
const response = await fetch('/api/dragon-breath/purchase-google-play', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: authUser.id,
    plan: currentPlan,
    purchaseToken: purchase.purchaseToken,
    productId: purchase.itemId || productId,
  }),
})
```

## 関連ファイル

- `lib/google-play-product-ids.ts` - 商品IDの定義
- `lib/google-play-billing-detector.ts` - Google Play Billingの検出と購入処理
- `app/api/dragon-breath/purchase-google-play/route.ts` - 購入確認API
- `app/shop/talisman/page.tsx` - ショップページ（購入UI）

## 次のステップ

1. ✅ 商品ID `dragon_breath` で商品を作成（完了）
2. 環境変数を設定
3. TWAアプリでテスト購入を実行
4. 本番環境で公開

