# blog_articlesテーブルセットアップ手順

## 問題
`blog_articles`テーブルがSupabaseに存在しないため、ブログ記事が保存できません。

## 解決方法

### 1. Supabaseダッシュボードにアクセス
1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択

### 2. SQL Editorでテーブルを作成
1. 左メニューから「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQLをコピー＆ペースト

```sql
-- blog_articlesテーブル作成
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

-- ポリシー: 全員が読み取り可能（公開記事）
DO $$ BEGIN
  CREATE POLICY "anyone_can_read_blog_articles" ON public.blog_articles
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ポリシー: 認証済みユーザーが挿入可能（API経由）
DO $$ BEGIN
  CREATE POLICY "authenticated_can_insert_blog_articles" ON public.blog_articles
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

4. 「Run」ボタンをクリックして実行

### 3. テーブル作成の確認
1. 左メニューから「Table Editor」をクリック
2. `blog_articles`テーブルが表示されているか確認

### 4. テストブログ記事の生成
テーブル作成後、以下のURLにアクセスしてテスト記事を生成：

```
http://localhost:3000/api/blog-articles/test-generate
```

## 代替方法：API経由でテーブル作成

もしSupabaseダッシュボードにアクセスできない場合、以下のAPIエンドポイントを作成しました：

```
http://localhost:3000/api/blog-articles/create-table
```

ただし、Supabaseのセキュリティ設定により、通常はSQL Editorから実行する必要があります。

## トラブルシューティング

### エラー: "permission denied for schema public"
- プロジェクトのオーナー権限で実行しているか確認
- または、Supabaseのサポートに問い合わせ

### エラー: "relation already exists"
- テーブルは既に存在しています。問題ありません。

### RLSポリシーエラー
- ポリシーが既に存在する場合は、エラーは無視しても問題ありません（`EXCEPTION WHEN duplicate_object`で処理されています）

