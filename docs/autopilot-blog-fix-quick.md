# オートパイロット ブログ記事生成 クイック修正

## 問題
- 19時の記事が追加されない
- デプロイしても自動生成記事が反映されない

## 即座に確認すべき3点

### 1. Supabaseテーブルの存在確認

**Supabase Dashboard → SQL Editor で以下を実行:**

```sql
-- テーブルが存在するか確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'blog_articles';
```

**結果が空の場合、以下を実行:**

```sql
-- テーブル作成
CREATE TABLE IF NOT EXISTS public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  analysis_result JSONB,
  keywords TEXT[],
  category TEXT,
  tweet_id TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON public.blog_articles(published_at DESC);

-- RLS設定（公開読み取り可能）
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_articles_select_public" ON public.blog_articles;
CREATE POLICY "blog_articles_select_public" ON public.blog_articles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "blog_articles_insert_service_role" ON public.blog_articles;
CREATE POLICY "blog_articles_insert_service_role" ON public.blog_articles
  FOR INSERT
  WITH CHECK (true);
```

### 2. 手動実行でテスト

**ブラウザで以下にアクセス:**
```
https://seimei.app/api/autopilot/execute
```

**または curl:**
```bash
curl -X POST https://seimei.app/api/autopilot/execute
```

**成功レスポンス例:**
```json
{
  "success": true,
  "sharing": {
    "blog": {
      "generated": true,
      "articleId": "uuid-here",
      "error": null
    }
  }
}
```

**エラーが発生した場合:**
- `relation "blog_articles" does not exist` → テーブルを作成（上記1を実行）
- `Supabase環境変数が設定されていません` → Netlify環境変数を設定

### 3. Netlify環境変数の確認

**Netlify Dashboard → Site settings → Environment variables:**

以下の環境変数が設定されているか確認:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (オプション)

## デプロイ後の確認

1. **Netlify Dashboard → Deploys** で最新デプロイを確認
2. **Netlify Dashboard → Functions → Scheduled Functions** でスケジュールを確認
3. **手動実行でテスト**（上記2を実行）
4. **`/articles`ページで記事を確認**

## 次のステップ

問題が解決しない場合:
1. **Netlify Dashboard → Functions → Logs** でエラーログを確認
2. **Supabase Dashboard → Logs** でエラーログを確認
3. 手動実行のレスポンス全体を確認

詳細は `docs/autopilot-blog-troubleshooting.md` を参照してください。

