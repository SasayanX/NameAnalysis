# 本番決済環境の動作確認手順

## デプロイ完了後の確認

### 1. デプロイ状態の確認

1. **Netlify Dashboard → Deploys** で最新デプロイを確認
   - ステータスが **Published** になっているか確認
   - エラーがないか確認

2. **サイトにアクセス**
   - `https://seimei.app` にアクセス
   - ページが正常に表示されるか確認

### 2. 環境変数の確認

#### 方法1: デバッグAPIで確認（推奨）

ブラウザコンソールで以下を実行：

```javascript
// Square設定の確認
fetch('/api/debug-square-config')
  .then(res => res.json())
  .then(data => {
    console.log('Square設定:', data);
    console.log('環境:', data.environment);
    console.log('Application ID:', data.applicationId);
  });

// Google Play商品IDの確認
console.log('Basic Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC || 'basic_monthly');
console.log('Premium Product ID:', process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM || 'premium_monthly');
```

#### 方法2: Squareプラン一覧APIで確認

```javascript
fetch('/api/square-subscription-plans/list')
  .then(res => res.json())
  .then(data => {
    console.log('✅ プラン一覧:', data.plans);
    console.log('📋 推奨環境変数:', data.recommendedEnvVars);
    console.log('🔑 すべてのプランID:', data.allPlanIds);
  });
```

### 3. Square決済の動作確認

#### 3.1 料金ページの確認

1. `/pricing` ページにアクセス
2. 以下を確認：
   - [ ] Square決済ボタンが表示される
   - [ ] ボタンがクリック可能
   - [ ] エラーメッセージが表示されない

#### 3.2 決済フローのテスト（慎重に）

**⚠️ 注意**: 本番環境でのテストは実際の決済が発生します。

**推奨**: まずはSquare Dashboardでテストモードを確認するか、少額でテストしてください。

1. `/pricing` ページでプランを選択
2. Square決済ボタンをクリック
3. Square決済画面が表示されるか確認
4. **テスト用カード情報**を使用（本番環境でもテスト可能）
   - カード番号: `4111 1111 1111 1111`
   - 有効期限: 未来の日付
   - CVV: 任意の3桁
   - 郵便番号: 任意

#### 3.3 Supabaseへの保存確認

1. 決済完了後、Supabase Dashboardで確認：
   - `user_subscriptions` テーブルにレコードが追加されているか
   - `square_payments` テーブルにレコードが追加されているか
   - `status` が `active` になっているか

2. アプリ内で確認：
   - マイページでプランが正しく表示されるか
   - プレミアム機能が利用可能になっているか

### 4. Google Play Billingの動作確認

#### 4.1 TWA環境での確認

1. TWAアプリを起動
2. `/pricing` ページにアクセス
3. 以下を確認：
   - [ ] Google Play Billingボタンが表示される（Squareボタンではない）
   - [ ] ボタンがクリック可能
   - [ ] エラーメッセージが表示されない

#### 4.2 購入フローのテスト

**⚠️ 注意**: 本番環境でのテストは実際の決済が発生します。

1. Google Play Billingボタンをクリック
2. Google Play決済画面が表示されるか確認
3. テストアカウントで購入を実行
4. 購入完了を確認

#### 4.3 Supabaseへの保存確認

1. 購入完了後、Supabase Dashboardで確認：
   - `user_subscriptions` テーブルにレコードが追加されているか
   - `payment_method` が `google_play` になっているか
   - `status` が `active` になっているか

2. アプリ内で確認：
   - マイページでプランが正しく表示されるか
   - プレミアム機能が利用可能になっているか

### 5. Webhookの確認

#### 5.1 Square Webhookの確認

1. **Square Dashboard → Webhooks** で確認：
   - エンドポイントURL: `https://seimei.app/api/square-webhook`
   - イベントが選択されているか

2. **Netlify Functions Logs** で確認：
   - Netlify Dashboard → Functions → Logs
   - Webhookが受信されているか
   - エラーがないか

#### 5.2 Webhookのテスト

Square DashboardからテストWebhookを送信：
1. Square Dashboard → Webhooks
2. **Send test webhook** をクリック
3. Netlify Functions Logsで受信を確認

### 6. エラーログの確認

#### 6.1 Netlify Functions Logs

1. Netlify Dashboard → Functions → Logs
2. エラーがないか確認
3. エラーがある場合は、エラーメッセージを確認

#### 6.2 ブラウザコンソール

1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブでエラーがないか確認
3. NetworkタブでAPIリクエストが正常に完了しているか確認

### 7. よくある問題と解決方法

#### 問題1: 環境変数が反映されない

**症状**: デプロイ後も古い設定が使われている

**解決方法**:
1. Netlify Dashboard → Site settings → Environment variables で設定を再確認
2. 再デプロイを実行
3. ブラウザのキャッシュをクリア（Ctrl+Shift+R）

#### 問題2: Square決済ボタンが表示されない

**症状**: `/pricing` ページでSquare決済ボタンが表示されない

**確認項目**:
- `NEXT_PUBLIC_SQUARE_APPLICATION_ID` が設定されているか
- `NEXT_PUBLIC_SQUARE_LOCATION_ID` が設定されているか
- ブラウザコンソールにエラーがないか

#### 問題3: Google Play Billingボタンが表示されない

**症状**: TWA環境でGoogle Play Billingボタンが表示されない

**確認項目**:
- TWA環境で実行しているか（`isTWAEnvironment()` が `true` か）
- `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC` が設定されているか
- `NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM` が設定されているか
- Digital Goods APIが利用可能か

#### 問題4: 決済は成功したがSupabaseに保存されない

**症状**: 決済は完了したが、アプリでプランが反映されない

**確認項目**:
- `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか（`sb_secret_` で始まるキーか）
- Supabase Dashboard → Logs でエラーがないか
- APIエンドポイント（`/api/square-subscription/create` や `/api/verify-google-play-purchase`）が正常に動作しているか

### 8. 確認チェックリスト

#### デプロイ関連
- [ ] デプロイが正常に完了している
- [ ] サイトが正常に表示される
- [ ] エラーログがない

#### 環境変数
- [ ] すべての必須環境変数が設定されている
- [ ] 環境変数が正しい値になっている
- [ ] デバッグAPIで環境変数が確認できる

#### Square決済
- [ ] `/pricing` ページでSquare決済ボタンが表示される
- [ ] 決済フローが正常に動作する（テスト）
- [ ] Supabaseにサブスクリプション情報が保存される
- [ ] Webhookが正常に受信される

#### Google Play Billing
- [ ] TWA環境でGoogle Play Billingボタンが表示される
- [ ] 購入フローが正常に動作する（テスト）
- [ ] Supabaseに購入情報が保存される

### 9. 次のステップ

すべての確認が完了したら：

1. **本番環境での動作確認**
   - 実際のユーザーでテスト（少額で）
   - 決済フロー全体を確認

2. **監視の設定**
   - Netlify Functions Logsを定期的に確認
   - Supabase Dashboardでデータを確認
   - Square Dashboardで取引を確認

3. **ドキュメントの更新**
   - 問題が発生した場合は、トラブルシューティング手順を更新

---

**重要**: 本番環境でのテストは慎重に行い、実際の決済が発生することを理解した上で実行してください。

