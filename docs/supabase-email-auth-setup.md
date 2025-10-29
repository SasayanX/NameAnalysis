# Supabase メール認証設定ガイド

## メールが届かない場合の対処法

### 1. Supabaseダッシュボードでメール確認を無効化（推奨：開発環境）

開発環境では、メール確認をスキップして直接ログインできるようにすることを推奨します。

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **Auth** に移動
4. **"Enable Email Confirmations"** のチェックを**外す**
5. 保存

これにより、新規登録時にメール確認なしでログインできます。

### 2. カスタムSMTP設定（本番環境向け）

本番環境でメール認証を使用する場合は、カスタムSMTPサーバーを設定する必要があります。

1. Supabaseダッシュボードにログイン
2. **Settings** → **Auth** → **SMTP Settings** に移動
3. 以下を設定：
   - **Enable Custom SMTP**: ON
   - **SMTP Host**: メールサービス提供者のSMTPサーバー（例: smtp.gmail.com）
   - **SMTP Port**: 通常 587 または 465
   - **SMTP User**: メールアドレス
   - **SMTP Pass**: アプリパスワード（通常のパスワードではない）
   - **Sender Email**: 送信元メールアドレス
   - **Sender Name**: 送信者名（例: "まいにち姓名判断"）

#### Gmailを使用する場合

1. Googleアカウント設定で「アプリパスワード」を生成
2. 2段階認証を有効にする必要があります
3. 生成されたアプリパスワードをSMTP Passに設定

### 3. メールテンプレートのカスタマイズ

Supabaseダッシュボードでメールテンプレートをカスタマイズできます。

1. **Authentication** → **Email Templates** に移動
2. **Confirmation Email** を編集
3. 必要に応じてデザインや文言を変更

### 4. Google認証を使用（推奨）

メール認証の問題を回避するために、Google認証の使用を推奨します。

1. Google Cloud ConsoleでOAuth設定
2. SupabaseダッシュボードでGoogleプロバイダーを有効化
3. ユーザーはメール確認なしで即座にログイン可能

## トラブルシューティング

### メールが届かない

- **スパムフォルダを確認**: メールがスパムフォルダに入っている可能性があります
- **メールアドレスの確認**: 正しいメールアドレスを入力しているか確認
- **Supabaseログ確認**: Supabaseダッシュボードの **Logs** → **Auth Logs** でエラーを確認

### メール確認リンクが無効

- リンクは24時間で期限切れになる可能性があります
- 再度メールを送信するか、Supabaseダッシュボードから手動でユーザーを確認する

## 開発環境での推奨設定

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

開発環境では、**メール確認を無効化**することを強く推奨します。
これにより、迅速に開発とテストを行うことができます。

