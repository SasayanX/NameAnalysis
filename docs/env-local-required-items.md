# .env.local に記載が必要な項目

## 📋 必須項目（基本的な動作に必要）

### Square決済（サンドボックス環境でテストする場合）

```env
# Square Payment Links（サンドボックス用）
# Square Developerダッシュボードで「Sandbox」に切り替えてから作成
# → 作成したPayment Linkは自動的にサンドボックス環境で動作します
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/サンドボックス用のリンク
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/サンドボックス用のリンク

# Square APIを直接呼び出す場合（Webhook処理など）のみ必要
# Payment Linkだけを使う場合は不要
SQUARE_ENVIRONMENT=sandbox
```

**重要**: 
- **Payment Linkは、作成された環境（Sandbox/Production）に自動的に紐づきます**
- **「Sandbox」スイッチをON/OFFしても、既存のPayment Linkの環境は変わりません**
  - Sandbox環境で作成したPayment Link → 常にSandbox環境で動作（スイッチON/OFFに関係なく）
  - Production環境で作成したPayment Link → 常にProduction環境で動作（スイッチON/OFFに関係なく）
- **スイッチは「どの環境のデータを見るか」を切り替えるだけです**

**既存のPayment Linkがどちらの環境で作成されたか確認する方法**:
1. Square Developerダッシュボードにログイン
2. 「Sandbox」スイッチを**ON**にして、Payment Linkが表示されるか確認
3. 「Sandbox」スイッチを**OFF**（Production）にして、Payment Linkが表示されるか確認
4. どちらの環境で表示されるかで、そのPayment Linkがどちらの環境で作成されたかが分かります

**作り直しが必要な場合**:
- ✅ **既存のPayment LinkがProduction環境で作成されたもの** → Sandbox環境でテストする場合は、Sandbox環境で新しいPayment Linkを作成する必要があります（スイッチをONにしても既存のリンクはProduction環境のまま）
- ❌ **既存のPayment LinkがSandbox環境で作成されたもの** → そのままSandbox環境でテストできます（作り直し不要）

**環境別のPayment Link**:
- **Sandbox環境で作成**: `https://square.link/u/xxxxx`（テスト用、実際の課金なし）
- **Production環境で作成**: `https://square.link/u/yyyyy`（本番用、実際の課金あり）
→ 同じプランでも、環境が違えば異なるリンクになります

**`SQUARE_ENVIRONMENT=sandbox` について**:
- この設定は、Square APIを直接呼び出す場合（Webhook処理など）にのみ必要です
- Payment Linkだけを使う場合は、この設定は不要です（Payment Link自体が環境に紐づいているため）

本番環境に切り替える場合は、以下も設定が必要です：

```env
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=sq0idp-xxxxx
SQUARE_ACCESS_TOKEN=EAAAExxxxxx
SQUARE_LOCATION_ID=LMxxxxxx
SQUARE_WEBHOOK_SIGNATURE_KEY=xxxxx
```

---

## 🔧 オプション項目（機能を使う場合のみ必要）

### Supabase（データベース機能を使用する場合）

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### メール送信（お問い合わせフォームなど）

```env
# Resend API（推奨）
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=your-email@example.com
SEND_AUTO_REPLY=false
```

### Twitter/X API（自動投稿機能を使用する場合）

```env
# テキストのみのツイート（推奨）
TWITTER_BEARER_TOKEN=xxxxx

# 画像付きツイート（OAuth 1.0aが必要）
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
TWITTER_ACCESS_TOKEN=xxxxx
TWITTER_ACCESS_TOKEN_SECRET=xxxxx
```

### Google Play Billing（Androidアプリ内課金を使用する場合）

```env
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC=basic_monthly
NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM=premium_monthly
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=./google-play-service-account-key.json
# または
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON={"type":"service_account",...}
```

### 分析・監視（Google Analytics、Clarityなど）

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=clarity-project-id
```

---

## 🎯 最小構成（動作確認のみ）

基本的な動作確認だけなら、以下だけでOK：

```env
# Square Payment Links（サンドボックス用）
# Square Developerダッシュボードで「Sandbox」に切り替えてから作成
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/サンドボックス用のリンク
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/サンドボックス用のリンク
```

**重要**: 
- **Square Developerダッシュボードで「Sandbox」に切り替えて作成したPayment Linkは、自動的にサンドボックス環境で動作します**
- **Sandbox環境とProduction環境で作成したPayment Linkは異なります**（同じプランでも別のリンク）
- Sandbox環境で作成したPayment Linkは、テストカードで決済でき、実際の課金は発生しません
- Production環境で作成したPayment Linkを使うと実際に課金されます
- 環境を切り替える場合は、それぞれの環境でPayment Linkを再作成する必要があります

---

## 📝 設定手順

1. プロジェクトルートに `.env.local` ファイルを作成（存在しない場合）
2. 上記の必須項目をコピー＆ペースト
3. 各項目の値を実際の値に置き換え
4. 開発サーバーを再起動（`npm run dev`）

**重要**: `.env.local` はGit管理外なので、機密情報を安全に保存できます。

