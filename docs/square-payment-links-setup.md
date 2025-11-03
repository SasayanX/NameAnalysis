# Square Payment Linksの設定と使用方法

## Square Payment Linksについて

Square Payment Linksは、Square側で作成した支払いリンクです。
現在の設定：
- ベーシックプラン: https://square.link/u/6sJ33DdY
- プレミアムプラン: https://square.link/u/TjSKFJhj

## 重要な注意点

**Square Payment LinksにはリダイレクトURL設定機能がありません。**

決済完了後の処理は、以下の方法で実装する必要があります：

### 方法1: Webhookを使用（推奨）

1. Square Webhookで決済完了を検知
2. Webhook受信時にユーザー情報とプラン情報を保存
3. ユーザーが再度アクセスしたときに、Webhookで保存した情報を反映

### 方法2: 手動確認ページを提供

1. 決済完了後、ユーザーに手動で「マイページ」や「プラン確認」ページにアクセスしてもらう
2. そのページでWebhook経由で保存された情報を確認・反映

### 方法3: URLパラメータで識別（簡易版）

1. Payment LinkのURLにパラメータを追加して、どのプランか識別できるようにする
2. ただし、Square Payment LinksのURLは固定なので、この方法は使えません

## 実装方針

### Webhook処理の強化

`app/api/square-webhook/route.ts` で決済完了を検知し、以下の情報を保存：

- 顧客のメールアドレスまたはセッションID
- 購入したプラン（basic/premium）
- 決済完了時刻
- 金額

### フロントエンドでの確認

ユーザーがアクセスした際に：

1. localStorageにプラン情報がないか確認
2. なければ、Webhook経由で保存された情報をAPI経由で取得
3. プラン情報をlocalStorageに保存

## 現在の実装

現在は、`SquareCheckoutButton`がPayment Linkに直接リダイレクトします。

決済完了後の処理：
1. ユーザーは決済完了ページを確認
2. 「マイページで確認」ボタンから `/my-subscription` に移動
3. `/my-subscription` ページでWebhook経由の情報を取得してプランを有効化

## Squareダッシュボードでの確認場所

Square Payment Linksの設定は、以下の場所で確認できます：

1. **Squareダッシュボードにログイン**
2. **左側メニューから「決済リンク」または「オンラインビジネス」を選択**
3. **作成済みのリンク一覧が表示されます**
4. 各リンクの詳細を確認できますが、リダイレクトURL設定はありません

## 推奨される改善案

### オプション1: Webhook + フロントエンド確認の自動化

決済完了後、一定時間後に自動的にプラン情報を取得する仕組みを追加

### オプション2: Square Subscriptions APIに移行

Square Payment Linksの代わりに、Square Subscriptions APIを使用することで、より詳細な制御が可能になります。
