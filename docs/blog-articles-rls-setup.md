# ブログ記事テーブルのRLS設定

## 問題

ブログ記事の削除が実行されない場合、RLS（Row Level Security）が正しく設定されていない可能性があります。

## 解決方法

### 1. SupabaseダッシュボードでSQL Editorを開く

1. Supabaseダッシュボードにログイン
2. 左メニューから「SQL Editor」を選択
3. 「New Query」をクリック

### 2. RLS設定スクリプトを実行

以下のSQLスクリプトをコピーして実行してください：

```sql
-- RLSを有効化
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "anyone_can_read_blog_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "authenticated_can_insert_blog_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "authenticated_can_update_blog_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "authenticated_can_delete_blog_articles" ON public.blog_articles;

-- ポリシー: 全員が読み取り可能（公開記事）
CREATE POLICY "anyone_can_read_blog_articles" ON public.blog_articles
  FOR SELECT
  USING (true);

-- ポリシー: 全員が挿入可能（API経由）
CREATE POLICY "anyone_can_insert_blog_articles" ON public.blog_articles
  FOR INSERT
  WITH CHECK (true);

-- ポリシー: 全員が更新可能
CREATE POLICY "anyone_can_update_blog_articles" ON public.blog_articles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ポリシー: 全員が削除可能（管理用）
CREATE POLICY "anyone_can_delete_blog_articles" ON public.blog_articles
  FOR DELETE
  USING (true);
```

### 3. ポリシーの確認

以下のSQLで現在のポリシーを確認できます：

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'blog_articles';
```

### 4. ファイルから実行（推奨）

`scripts/fix-blog-articles-rls.sql`ファイルをSupabaseのSQL Editorに貼り付けて実行することもできます。

## 注意事項

- RLSを有効にすると、ポリシーがない操作はすべて拒否されます
- 上記のポリシーは開発・テスト用です。本番環境では適切な認証・認可を実装してください
- 削除ポリシーは`USING (true)`で全員が削除可能になっています。必要に応じて制限してください

## トラブルシューティング

### 削除がまだできない場合

1. **RLSが有効か確認**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'blog_articles';
   ```
   `rowsecurity`が`true`であることを確認

2. **ポリシーが存在するか確認**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'blog_articles';
   ```

3. **サーバーログを確認**
   - 管理ページで削除を試行
   - ブラウザの開発者ツール（F12）→ コンソールタブでエラーを確認
   - ネットワークタブでAPIレスポンスを確認

4. **Supabaseクライアントの認証状態を確認**
   - `lib/supabase-client.ts`を確認
   - サービスロールキーが設定されているか確認

