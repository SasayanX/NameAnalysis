# Square決済の最も簡単な設定方法

## 🎯 最も簡単で確実な方法

**Squareダッシュボードで手動作成 → リンクを環境変数に設定 → 完了**

APIを使わず、Squareダッシュボードで完結する方法です。

## 📋 手順（約5分）

### ステップ1: Squareでサブスクリプションプランを作成

1. **Squareダッシュボードにログイン**
   - https://squareup.com/dashboard

2. **商品とサービス > サブスクリプションプラン** に移動
   - 左メニューから「商品とサービス」をクリック
   - 「サブスクリプションプラン」タブをクリック

3. **「新しいプランを作成」をクリック**

4. **ベーシックプランを作成**
   ```
   プラン名: ベーシックプラン
   価格: 330円
   請求頻度: 1ヶ月ごと
   ```
   - 「保存」をクリック
   - **プランIDをコピー**（例: `BASIC_MONTHLY`）

5. **プレミアムプランを作成**
   ```
   プラン名: プレミアムプラン
   価格: 550円
   請求頻度: 1ヶ月ごと
   ```
   - 「保存」をクリック
   - **プランIDをコピー**（例: `PREMIUM_MONTHLY`）

### ステップ2: Square Payment Linkを作成

1. **オンライン決済 > 支払いリンク** に移動
   - 左メニューから「オンライン決済」をクリック
   - 「支払いリンク」をクリック

2. **「新しいリンクを作成」をクリック**

3. **ベーシックプランのリンクを作成**
   - 商品タイプ: **「サブスクリプション」** を選択
   - プラン選択: **「ベーシックプラン」** を選択
   - 「リンクを作成」をクリック
   - **リンクURLをコピー**（例: `https://square.link/u/6sJ33DdY`）

4. **プレミアムプランのリンクを作成**
   - 商品タイプ: **「サブスクリプション」** を選択
   - プラン選択: **「プレミアムプラン」** を選択
   - 「リンクを作成」をクリック
   - **リンクURLをコピー**（例: `https://square.link/u/TjSKFJhj`）

### ステップ3: 環境変数に設定

`.env.local` ファイルに以下を追加：

```env
# Square Payment Links（サブスクリプションプラン用）
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/6sJ33DdY
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/TjSKFJhj

# Square Webhook（既に設定済みなら不要）
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
```

### ステップ4: 動作確認

1. 開発サーバーを再起動
   ```bash
   npm run dev
   ```

2. `/pricing` ページにアクセス

3. 「ベーシックプラン」または「プレミアムプラン」をクリック

4. Square Payment Linkにリダイレクトされることを確認

5. テスト決済を実行（Squareのテストカードを使用）

## ✅ これで完了！

この方法のメリット：
- ✅ **APIを使わない** → シンプル
- ✅ **Squareダッシュボードで完結** → 確実
- ✅ **既存のコードがそのまま使える** → 変更不要
- ✅ **Webhookで決済完了を検知** → 既に実装済み

## 🔄 決済完了後の処理

決済完了後は、既に実装済みの仕組みで自動的に処理されます：

1. **Square Webhook**が決済完了を検知
2. **Supabase**に決済情報を保存
3. ユーザーが `/my-subscription?email=your@email.com` にアクセス
4. 「決済状況を確認」ボタンでプランを有効化

## 📝 チェックリスト

- [ ] Squareでベーシックプラン（330円/月）を作成
- [ ] Squareでプレミアムプラン（550円/月）を作成
- [ ] ベーシックプランのPayment Linkを作成
- [ ] プレミアムプランのPayment Linkを作成
- [ ] `.env.local`にPayment Linkを設定
- [ ] 動作確認（テスト決済）

## 🚨 よくある質問

### Q: プランIDは必要ですか？
A: 今回の方法では不要です。Payment Linkに直接プランが紐づいているため、プランIDは使わずに済みます。

### Q: 既存のPayment Linkを使えますか？
A: はい。既に作成済みのPayment Linkがある場合は、そのURLを環境変数に設定するだけでOKです。

### Q: テスト決済はどうすればいいですか？
A: Squareのサンドボックス環境でテストカードを使用できます。テストカード番号: `4111 1111 1111 1111`

## 💡 補足

### Webhookの設定（まだ設定していない場合）

1. Squareダッシュボード > 設定 > Webhooks
2. 「エンドポイントを追加」をクリック
3. URL: `https://your-domain.vercel.app/api/square-webhook`
4. イベント: `payment.updated` を選択
5. 署名キーをコピーして `.env.local` に設定

### 本番環境での設定

本番環境（Vercel等）でも、環境変数に同じPayment Linkを設定するだけです。

Vercelの場合：
1. Vercelダッシュボード > プロジェクト > Settings > Environment Variables
2. 以下の環境変数を追加：
   - `NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC`
   - `NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY`

これで最も簡単で確実な設定が完了です！

