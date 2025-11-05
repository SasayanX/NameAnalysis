# Supabase RLS（Row Level Security）エラー修正ガイド

## 問題

サーバーサイドAPIからSupabaseにアクセスする際、以下のエラーが発生する場合があります：

```
new row violates row-level security policy for table "kanau_points"
```

## 原因

サーバーサイドAPIでは、ANONキーを使用しているため、RLSポリシーによってアクセスが拒否されます。

## 解決方法

サーバーサイドAPIでは、**サービスロールキー**を使用する必要があります。サービスロールキーはRLSポリシーをバイパスします。

### 1. Supabaseダッシュボードでサービスロールキーを取得

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. Settings → API
4. "Service Role Key" セクションの "Reveal" をクリック
5. サービスロールキーをコピー

**⚠️ 重要**: サービスロールキーは非常に強力です。絶対に公開しないでください！

### 2. 環境変数に設定

`.env.local` ファイルに以下を追加：

```env
# 既存の設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# サーバーサイド用（RLSをバイパス）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 実装内容

以下の変更を行いました：

1. **`lib/supabase-server.ts`**: サーバーサイド用Supabaseクライアントを追加
2. **`lib/kanau-points-supabase.ts`**: サーバーサイド/クライアントサイドを自動判定して適切なクライアントを使用
3. **`app/api/issue-card/route.ts`**: サーバーサイド用クライアントを使用

### 4. 動作確認

1. 開発サーバーを再起動
2. ランクカード発行を試す
3. エラーが解消されていることを確認

## セキュリティ注意事項

- **サービスロールキーは絶対に公開しない**
- `.env.local` をGitにコミットしない（`.gitignore`に追加済み）
- 本番環境では、Vercel/Netlifyの環境変数設定でサービスロールキーを設定
- サービスロールキーはサーバーサイドでのみ使用（`NEXT_PUBLIC_`プレフィックスを付けない）

## トラブルシューティング

### エラーが続く場合

1. 環境変数が正しく設定されているか確認
   ```bash
   # 開発環境の場合
   cat .env.local | grep SUPABASE
   ```

2. 開発サーバーを再起動
   ```bash
   npm run dev
   ```

3. Supabaseダッシュボードでサービスロールキーが有効か確認

4. コンソールログを確認（`🎴 ランクカード発行API:` などのログが表示される）

