# Square決済動作確認ガイド

## 🔍 現在の実装状況

### 実装済みの機能
1. ✅ Square Payment Linksへのリダイレクト（`components/square-checkout-button.tsx`）
2. ✅ Square Webhook受信エンドポイント（`app/api/square-webhook/route.ts`）
3. ✅ 決済完了後のURLパラメータ処理（`app/subscription-success/page.tsx`）
4. ✅ マイページでの手動確認ボタン（`app/my-subscription/page.tsx`）

### ⚠️ 潜在的な問題点

#### 1. **WebhookとlocalStorageの連携問題**
- **問題**: Webhookはサーバー側で実行されるため、クライアント側の`localStorage`に直接書き込めません
- **現在の実装**: Webhookはログを出力するだけ
- **影響**: 決済完了後、ユーザーが手動でプランを有効化する必要がある可能性

#### 2. **決済状況確認APIが不完全**
- **問題**: `/my-subscription`の「決済状況を確認」ボタンが、実際のSquare APIを呼び出していません
- **現在の実装**: `localStorage`の`subscriptions`キーを確認するだけ
- **影響**: 実際の決済状況を確認できない

#### 3. **Square Payment LinksのリダイレクトURLがない**
- **問題**: Square Payment Linksには決済完了後のリダイレクトURL設定機能がありません
- **現在の実装**: ユーザーが手動で「マイページ」にアクセスする必要がある
- **影響**: 決済完了後の自動有効化ができない

#### 4. **プラン判定の金額ロジック**
- **問題**: 金額判定が複雑（セント単位と円単位の両方に対応）
- **実際のSquare**: 日本円の場合、金額は**円単位**で送信される可能性が高い
- **影響**: プラン判定が誤る可能性

## 🧪 動作確認方法

### ステップ1: Square Webhookの設定確認

1. **Squareダッシュボードにログイン**
2. **設定 > アプリケーション > Webhooks** に移動
3. **Webhook URL**が正しく設定されているか確認
   - 本番環境: `https://nameanalysis216.vercel.app/api/square-webhook`
   - 開発環境: ローカル開発サーバーのURL（ngrok等を使用）

### ステップ2: Webhookの動作確認

#### 方法A: Square Webhookテストツールを使用

```bash
# テスト用のWebhookリクエストを送信
curl -X POST http://localhost:3000/api/square-webhook \
  -H "Content-Type: application/json" \
  -H "x-square-signature: test-signature-payment" \
  -d '{
    "type": "payment.updated",
    "data": {
      "object": {
        "payment": {
          "id": "test-payment-id",
          "status": "COMPLETED",
          "amount_money": {
            "amount": 33000,
            "currency": "JPY"
          },
          "order_id": "test-order-id",
          "buyer_email_address": "test@example.com"
        }
      }
    }
  }'
```

#### 方法B: ブラウザの開発者ツールで確認

1. `/webhook-test` ページにアクセス（存在する場合）
2. 「Webhookテスト」ボタンをクリック
3. レスポンスを確認

### ステップ3: 実際の決済テスト

1. **テスト決済を実行**
   - `/pricing` ページにアクセス
   - 「ベーシックプラン」または「プレミアムプラン」をクリック
   - Square Payment Linkにリダイレクト
   - Squareのテストカードで決済完了

2. **決済完了後の確認**
   - Square決済完了ページが表示される
   - 手動で `/my-subscription` にアクセス
   - 「決済状況を確認」ボタンをクリック
   - プランが有効化されているか確認

### ステップ4: サーバーログの確認

**Vercelの場合:**
1. Vercelダッシュボードにログイン
2. プロジェクト > Functions > `/api/square-webhook` を選択
3. ログを確認

**ローカル開発の場合:**
```bash
# 開発サーバーのログを確認
npm run dev
# コンソールにWebhook受信ログが表示される
```

## 🔧 改善提案

### 改善案1: Supabaseに決済情報を保存（推奨）

**目的**: Webhookで受け取った決済情報をデータベースに保存し、フロントエンドで取得できるようにする

**実装手順**:
1. Supabaseに`square_payments`テーブルを作成
2. Webhookで受け取った決済情報をSupabaseに保存
3. フロントエンドでSupabaseから決済情報を取得するAPIエンドポイントを作成
4. `/my-subscription`ページでこのAPIを呼び出してプランを有効化

**メリット**:
- サーバー側とクライアント側の連携が確実
- 決済履歴の管理が容易
- 複数デバイス間での同期が可能

### 改善案2: Square APIで決済状況を直接確認

**目的**: Square APIを使って決済状況を直接確認する

**実装手順**:
1. Square APIクライアントを作成（`lib/square-payment-client.ts`を拡張）
2. 決済IDまたはメールアドレスで決済状況を取得するAPIエンドポイントを作成
3. `/my-subscription`ページでこのAPIを呼び出してプランを有効化

**メリット**:
- リアルタイムで決済状況を確認可能
- Webhookが失敗した場合でも確認できる

### 改善案3: 決済完了後の自動ポーリング

**目的**: 決済完了後、一定時間内に自動的に決済状況を確認する

**実装手順**:
1. 決済リンクをクリックした時刻を記録
2. ページに戻ってきたら、一定時間内（例: 5分）であれば自動的に決済状況を確認
3. プランが見つかったら自動的に有効化

**メリット**:
- ユーザーの操作を最小限に
- 手動確認ボタンが不要になる可能性

## 📋 チェックリスト

### 事前確認
- [ ] Square Webhook URLが正しく設定されている
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY`環境変数が設定されている
- [ ] `NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC`と`NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM`が設定されている

### 動作確認
- [ ] Webhookエンドポイントが正常に応答する（`GET /api/square-webhook`）
- [ ] テストWebhookリクエストが正常に処理される
- [ ] 実際の決済が完了した後、Webhookが受信される
- [ ] 決済完了後、プランが正しく有効化される
- [ ] プラン判定の金額ロジックが正しい（330円→basic、550円→premium）

### 問題発生時の対処
- [ ] サーバーログでWebhook受信を確認
- [ ] Squareダッシュボードで決済状況を確認
- [ ] `/my-subscription`ページで手動確認を試す
- [ ] ブラウザの開発者ツールでAPIエラーを確認

## 🚨 よくある問題と解決方法

### 問題1: Webhookが受信されない

**原因**:
- Webhook URLが正しく設定されていない
- ネットワークの問題（ローカル開発環境など）

**解決方法**:
- SquareダッシュボードでWebhook URLを再確認
- ローカル開発の場合はngrok等を使用してWebhook URLを公開
- サーバーログでWebhook受信を確認

### 問題2: プランが有効化されない

**原因**:
- WebhookがlocalStorageに書き込めない
- 決済状況確認APIが実装されていない

**解決方法**:
- 手動で`/my-subscription`ページにアクセスして「決済状況を確認」をクリック
- 改善案1（Supabase保存）を実装

### 問題3: プラン判定が間違っている

**原因**:
- 金額判定ロジックの問題
- Square APIの金額形式が想定と異なる

**解決方法**:
- サーバーログで実際の金額を確認
- 金額判定ロジックを修正

## ✅ 実装済みの改善

### 改善1: Supabaseに決済情報を保存（実装完了）

**実装内容**:
1. ✅ `square_payments`テーブルを作成（`scripts/create-square-payments-table.sql`）
2. ✅ Webhookで受け取った決済情報をSupabaseに保存（`app/api/square-webhook/route.ts`）
3. ✅ フロントエンドで決済情報を取得するAPIエンドポイント（`app/api/square-payments/check/route.ts`）
4. ✅ `/my-subscription`ページで決済情報を確認・有効化（`app/my-subscription/page.tsx`）

**使用方法**:
1. Supabaseで`square_payments`テーブルを作成（SQLスクリプトを実行）
2. Square Payment Linkで決済を完了
3. `/my-subscription?email=your@email.com`にアクセス
4. 「決済状況を確認」ボタンをクリック
5. プランが自動的に有効化される

**注意**: Square Payment Linkで決済する際に、Square側でメールアドレスを入力してもらう必要があります。または、決済完了後にユーザーにメールアドレスを入力してもらうフォームを表示する必要があります。

## 📝 次のステップ

1. **Square Payment Linkでメールアドレスを確実に収集する仕組みを追加**
   - 決済完了後にメールアドレス入力フォームを表示
   - または、Square Checkout APIを使用してカスタムフィールドを追加
2. **自動ポーリング機能を実装**（決済完了後、一定時間内に自動的に確認）
3. **エラーハンドリングとログ記録を強化**
4. **決済履歴の表示機能を追加**

