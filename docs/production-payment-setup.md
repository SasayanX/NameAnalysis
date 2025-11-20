# 本番決済環境への紐づけ手順

## 概要

本番環境でSquare決済とGoogle Play Billingを有効化するための設定手順です。

## 1. Square本番環境の設定

### 1.1 Square Dashboardでの確認事項

1. **Square Developer Dashboard**にログイン
   - https://developer.squareup.com/apps
   - 本番環境のアプリケーションを選択

2. **本番環境の認証情報を確認**
   - Application ID: `sq0idp-xxxxx`（本番環境は`sq0idp-`で始まる）
   - Access Token: 本番環境のアクセストークンを取得
   - Location ID: 本番環境のロケーションIDを取得

3. **サブスクリプションプランの作成とID確認**
   
   **方法A: API経由で作成（推奨）**
   
   サンドボックス環境と同様に、API経由でプランを作成できます。これにより、`phases` が正しく設定され、エラーを回避できます。
   
   **重要**: ベーシックプランとプレミアムプランは**個別に実行**してください。1つずつ実行して、成功を確認してから次のプランを作成することを推奨します。
   
   **開発サーバーから実行:**
   
   **ステップ1: ベーシックプランを作成**
   
   まず、ベーシックプランを作成します。成功したら、コンソールに表示されたプランIDをメモしてください。
   
   ```javascript
   fetch('http://localhost:3000/api/square-subscription-plans/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ planId: 'basic' })
   })
   .then(res => res.json())
   .then(data => {
     if (data.success) {
       console.log('✅ ベーシックプラン作成成功!');
       console.log('プランID:', data.plan.id);
       console.log('環境変数名:', data.envVariable.name);
       console.log('環境変数値:', data.envVariable.value);
       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
       console.log('Netlify環境変数に設定してください:');
       console.log(`${data.envVariable.name}=${data.envVariable.value}`);
     } else {
       console.error('❌ エラー:', data.error);
       if (data.details) {
         console.error('エラー詳細:', data.details);
       }
     }
   })
   .catch(err => {
     console.error('❌ リクエストエラー:', err);
   });
   ```
   
   **ステップ2: プレミアムプランを作成**
   
   ベーシックプランの作成が成功したら、次にプレミアムプランを作成します。
   
   ```javascript
   fetch('http://localhost:3000/api/square-subscription-plans/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ planId: 'premium' })
   })
   .then(res => res.json())
   .then(data => {
     if (data.success) {
       console.log('✅ プレミアムプラン作成成功!');
       console.log('プランID:', data.plan.id);
       console.log('環境変数名:', data.envVariable.name);
       console.log('環境変数値:', data.envVariable.value);
       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
       console.log('Netlify環境変数に設定してください:');
       console.log(`${data.envVariable.name}=${data.envVariable.value}`);
     } else {
       console.error('❌ エラー:', data.error);
       if (data.details) {
         console.error('エラー詳細:', data.details);
       }
     }
   })
   .catch(err => {
     console.error('❌ リクエストエラー:', err);
   });
   ```
   
   **本番環境から実行する場合:**
   
   本番環境（`https://seimei.app`）で実行する場合は、URLを変更してください。こちらも**個別に実行**することを推奨します。
   
   **ステップ1: ベーシックプランを作成**
   ```javascript
   fetch('https://seimei.app/api/square-subscription-plans/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ planId: 'basic' })
   })
   .then(res => res.json())
   .then(data => {
     if (data.success) {
       console.log('✅ ベーシックプラン作成成功!');
       console.log('プランID:', data.plan.id);
       console.log('環境変数名:', data.envVariable.name);
       console.log('環境変数値:', data.envVariable.value);
     } else {
       console.error('❌ エラー:', data.error);
       if (data.details) {
         console.error('エラー詳細:', data.details);
       }
     }
   })
   .catch(err => {
     console.error('❌ リクエストエラー:', err);
   });
   ```
   
   **ステップ2: プレミアムプランを作成**
   ```javascript
   fetch('https://seimei.app/api/square-subscription-plans/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ planId: 'premium' })
   })
   .then(res => res.json())
   .then(data => {
     if (data.success) {
       console.log('✅ プレミアムプラン作成成功!');
       console.log('プランID:', data.plan.id);
       console.log('環境変数名:', data.envVariable.name);
       console.log('環境変数値:', data.envVariable.value);
     } else {
       console.error('❌ エラー:', data.error);
       if (data.details) {
         console.error('エラー詳細:', data.details);
       }
     }
   })
   .catch(err => {
     console.error('❌ リクエストエラー:', err);
   });
   ```
   
   **方法B: 既存プランの確認**
   - 本番環境のアクセストークンを設定した状態で、以下のAPIを呼び出し：
   ```
   GET https://seimei.app/api/square-subscription-plans/list
   ```
   - または、開発サーバーで：
   ```
   GET http://localhost:3000/api/square-subscription-plans/list
   ```
   - レスポンスにすべてのプランIDと推奨環境変数が含まれます
   - ブラウザのコンソールで実行：
   ```javascript
   fetch('/api/square-subscription-plans/list')
     .then(res => res.json())
     .then(data => {
       console.log('プラン一覧:', data.plans);
       console.log('推奨環境変数:', data.recommendedEnvVars);
     });
   ```
   
   **方法C: Square Dashboardで手動作成（代替方法）**
   - Square Dashboard > 商品とサービス > サブスクリプションプラン
   - ベーシックプランとプレミアムプランを作成
   - 各プランの詳細を開いて、プランIDをコピー（例: `SP6RJPWPNE54S4DIL5NB5OUW`）
   - **注意**: 手動作成の場合、`phases` が正しく設定されていない可能性があります。エラーが発生する場合は、API経由での作成を推奨します。

4. **Webhook設定**
   - Square Dashboard > Webhooks
   - エンドポイントURL: `https://seimei.app/api/square-webhook`
   - イベント: `subscription.updated`, `payment.updated` などを選択
   - Webhook署名キーをメモ

### 1.2 Netlify環境変数の設定

Netlify Dashboard > Site settings > Environment variables で以下を設定：

```bash
# Square本番環境
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=sq0idp-xxxxx（本番環境のApplication ID）
SQUARE_ACCESS_TOKEN=EAAAExxxxxx（本番環境のAccess Token）
SQUARE_LOCATION_ID=LMxxxxxx（本番環境のLocation ID）
SQUARE_WEBHOOK_SIGNATURE_KEY=xxxxxx（Webhook署名キー）

# SquareサブスクリプションプランID（本番環境で作成したプランID）
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=your_production_basic_plan_id
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=your_production_premium_plan_id

# フロントエンド用（公開可能）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-xxxxx（本番環境のApplication ID）
NEXT_PUBLIC_SQUARE_LOCATION_ID=LMxxxxxx（本番環境のLocation ID）
```

### 1.3 Square Payment Links（オプション）

外部決済用のPayment Linksが必要な場合：

1. Square Dashboard > オンライン決済 > 支払いリンク
2. ベーシックプランとプレミアムプラン用のリンクを作成
3. 環境変数に設定：

```bash
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/xxxxx
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/xxxxx
```

## 2. Google Play Billing本番環境の設定

### 2.1 Google Play Consoleでの確認事項

1. **Google Play Console**にログイン
   - https://play.google.com/console
   - アプリを選択

2. **サブスクリプション商品の作成**
   - Google Play Console > 収益化 > 商品 > サブスクリプション
   - ベーシックプランとプレミアムプランを作成
   - 各商品のIDをメモ（例: `basic_monthly`, `premium_monthly`）

3. **サービスアカウントの設定**
   - Google Cloud Console > IAM & Admin > Service Accounts
   - サービスアカウントキー（JSON）をダウンロード
   - Google Play Console > 設定 > API アクセス で権限を付与

4. **パッケージ名の確認**
   - Google Play Console > アプリの設定 > アプリの詳細
   - パッケージ名をメモ（例: `com.kanau.nameanalysis`）

### 2.2 Netlify環境変数の設定

```bash
# Google Play Billing商品ID（本番環境）
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=your_production_basic_product_id
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=your_production_premium_product_id

# Google Play Developer API用サービスアカウントキー
# 方法1: JSONファイルのパス（ローカル開発用）
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=./google-play-service-account-key.json

# 方法2: JSON文字列（Netlify推奨）
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# アプリのパッケージ名
NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME=com.kanau.nameanalysis
```

### 2.3 サービスアカウントキーの取得方法

1. Google Cloud Console > IAM & Admin > Service Accounts
2. サービスアカウントを選択 > キー > キーを追加 > JSON
3. ダウンロードしたJSONファイルの内容を`GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`に設定

**注意**: JSONファイルの改行を削除し、1行の文字列として設定してください。

## 3. 環境変数の設定確認

### 3.1 必須環境変数チェックリスト

- [ ] `SQUARE_ENVIRONMENT=production`
- [ ] `SQUARE_APPLICATION_ID`（本番環境）
- [ ] `SQUARE_ACCESS_TOKEN`（本番環境）
- [ ] `SQUARE_LOCATION_ID`（本番環境）
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC`（本番環境）
- [ ] `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM`（本番環境）
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID`（本番環境）
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID`（本番環境）
- [ ] `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC`（本番環境）
- [ ] `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM`（本番環境）
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`（本番環境用）
- [ ] `NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME`

### 3.2 その他の必須環境変数

- [ ] `SUPABASE_SERVICE_ROLE_KEY`（本番環境用のsecret key）
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`（AI鑑定機能用）
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`（言霊マスターデータ用）

## 4. デプロイと動作確認

### 4.1 デプロイ手順

**重要**: 環境変数を設定した後は、**必ず再デプロイが必要**です。

#### 手順1: 環境変数をNetlifyに設定

1. Netlify Dashboard → Site settings → Environment variables
2. 必要な環境変数をすべて設定
3. **Save** をクリック

#### 手順2: 再デプロイの実行

環境変数を設定した後は、以下のいずれかの方法で再デプロイしてください：

**方法A: 手動で再デプロイ（推奨）**
1. Netlify Dashboard → Deploys
2. **Trigger deploy** → **Deploy site** をクリック
3. デプロイが完了するまで待機（通常1-3分）

**方法B: コードをプッシュして自動デプロイ**
1. コードをコミット・プッシュ（変更がなくてもOK）
2. Netlifyで自動デプロイが実行される
3. デプロイが完了するまで待機

**方法C: 空のコミットで再デプロイ**
```bash
git commit --allow-empty -m "Trigger deploy after env vars update"
git push origin master
```

#### 手順3: デプロイ完了の確認

1. Netlify Dashboard → Deploys で最新デプロイの状態を確認
2. **Published** ステータスになれば完了
3. サイトにアクセスして動作確認

### 4.2 動作確認チェックリスト

#### Square決済
- [ ] `/pricing`ページでSquare決済ボタンが表示される
- [ ] 決済フローが正常に動作する
- [ ] サブスクリプションが作成される
- [ ] Supabaseにサブスクリプション情報が保存される
- [ ] Webhookが正常に受信される

#### Google Play Billing
- [ ] TWA環境でGoogle Play Billingボタンが表示される
- [ ] 購入フローが正常に動作する
- [ ] 購入検証が正常に動作する
- [ ] Supabaseに購入情報が保存される

### 4.3 トラブルシューティング

#### Square決済が動作しない場合
1. 環境変数`SQUARE_ENVIRONMENT=production`が設定されているか確認
2. 本番環境のアクセストークンが正しいか確認
3. Square DashboardでWebhookが設定されているか確認
4. Netlifyのログでエラーを確認

#### Google Play Billingが動作しない場合
1. サービスアカウントキーのJSONが正しく設定されているか確認
2. Google Play Consoleでサービスアカウントに権限が付与されているか確認
3. 商品IDが本番環境で作成されているか確認
4. TWA環境でDigital Goods APIが利用可能か確認

## 5. 本番環境でのテスト

### 5.1 テストアカウントの設定

- Square: 本番環境でもテストモードで動作確認可能
- Google Play: ライセンステストアカウントを設定してテスト

### 5.2 段階的なロールアウト

1. まず管理者アカウントで動作確認
2. テストユーザーで動作確認
3. 本番環境で公開

## 6. 監視とログ

### 6.1 監視項目

- Square決済の成功率
- Google Play Billingの購入成功率
- Webhookの受信状況
- Supabaseへのデータ保存状況

### 6.2 ログ確認

- Netlify Functions Logs
- Square Dashboard > Transactions
- Google Play Console > 収益化 > レポート
- Supabase Dashboard > Logs

## 7. セキュリティチェックリスト

- [ ] 本番環境のアクセストークンが漏洩していないか確認
- [ ] サービスアカウントキーが適切に保護されているか確認
- [ ] Webhook署名検証が有効になっているか確認
- [ ] 環境変数が適切に設定されているか確認

## 8. 緊急時のロールバック

本番環境で問題が発生した場合：

1. `SQUARE_ENVIRONMENT=sandbox`に変更してSandbox環境に戻す
2. または、決済機能を一時的に無効化
3. 問題を修正後、再度本番環境に切り替え

---

**重要**: 本番環境への切り替え前に、必ずテスト環境で十分に動作確認を行ってください。

