-- blog_articlesテーブル作成スクリプト
-- SupabaseのSQL Editorで実行してください

CREATE TABLE IF NOT EXISTS public.blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  last_name text NOT NULL,
  first_name text NOT NULL,
  analysis_result jsonb,
  keywords text[] DEFAULT ARRAY[]::text[],
  category text DEFAULT '姓名判断実例',
  tweet_id text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON public.blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON public.blog_articles(category);
CREATE INDEX IF NOT EXISTS idx_blog_articles_keywords ON public.blog_articles USING GIN(keywords);

-- RLS設定
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

