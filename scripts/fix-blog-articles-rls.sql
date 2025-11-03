-- blog_articlesテーブルのRLS設定を修正
-- SupabaseのSQL Editorで実行してください

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

-- 確認: 現在のポリシーを表示
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

