# オートパイロット ブログ記事生成 トラブルシューティング

## 問題: 19時の記事が追加されない、デプロイしても反映されない

### 確認事項

#### 1. Supabase `blog_articles`テーブルの存在確認

**SQLでテーブルを作成:**

```sql
-- Supabase Dashboard → SQL Editor で実行
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

CREATE POLICY "blog_articles_select_public" ON public.blog_articles
  FOR SELECT
  USING (true);

-- 管理者のみ書き込み可能（オプション）
CREATE POLICY "blog_articles_insert_service_role" ON public.blog_articles
  FOR INSERT
  WITH CHECK (true);
```

#### 2. Netlifyのスケジュール設定確認

**`netlify.toml`の設定:**
```toml
[[scheduled.functions]]
  name = "autopilot-execute"
  cron = "0 22 * * *"  # 7時 JST (UTC 22:00 前日)

[[scheduled.functions]]
  name = "autopilot-execute"
  cron = "0 10 * * *"  # 19時 JST (UTC 10:00)
```

**確認方法:**
1. Netlify Dashboard → Functions → Scheduled Functions
2. 2つのスケジュールが表示されているか確認
3. 最後の実行時間とステータスを確認

#### 3. 環境変数の確認

**Netlify Dashboard → Site settings → Environment variables:**

必須環境変数:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (オプション、RLS回避用)
- `TWITTER_API_KEY` (X投稿用)
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

#### 4. 手動実行でテスト

**APIエンドポイントを直接呼び出し:**

```bash
# ローカル環境
curl -X POST http://localhost:3001/api/autopilot/execute

# 本番環境
curl -X POST https://seimei.app/api/autopilot/execute
```

**または、ブラウザで:**
```
https://seimei.app/api/autopilot/execute
```

**レスポンス例:**
```json
{
  "success": true,
  "timestamp": "2025-11-04T10:00:00.000Z",
  "expansion": {
    "processedNames": 5,
    "missingKanji": 0,
    "addedKanji": 0,
    "errors": 0
  },
  "sharing": {
    "shareableResults": 1,
    "sharedName": "大谷翔平",
    "forcedShare": false,
    "twitter": {
      "sent": true,
      "tweetId": "1234567890",
      "error": null
    },
    "blog": {
      "generated": true,
      "articleId": "uuid-here",
      "error": null
    },
    "email": {
      "sent": true,
      "error": null
    }
  }
}
```

#### 5. ログの確認

**Netlify Dashboard → Functions → Logs:**

1. `autopilot-execute` 関数のログを確認
2. エラーメッセージを確認
3. スケジュール実行のタイムスタンプを確認

**よくあるエラー:**

- `Supabase環境変数が設定されていません`
  - → 環境変数を確認・設定
- `ブログ記事保存エラー: relation "blog_articles" does not exist`
  - → テーブルを作成（上記SQLを実行）
- `duplicate key value violates unique constraint "blog_articles_slug_key"`
  - → 同じslugの記事が既に存在（重複チェック）

#### 6. 記事一覧ページの確認

**`/articles`ページで記事が表示されるか確認:**

1. `https://seimei.app/articles` にアクセス
2. 「自動生成記事」セクションを確認
3. 最新の記事が表示されているか確認

**データベースから直接確認:**

```sql
-- Supabase Dashboard → SQL Editor
SELECT 
  slug,
  title,
  last_name,
  first_name,
  published_at,
  created_at
FROM public.blog_articles
ORDER BY published_at DESC
LIMIT 10;
```

#### 7. デプロイ後の確認

**デプロイが完了したら:**

1. Netlify Dashboard → Deploys で最新のデプロイを確認
2. 環境変数が正しく設定されているか再確認
3. スケジュール関数が有効になっているか確認
4. 手動実行でテスト

### トラブルシューティング手順

#### ステップ1: テーブル作成確認
```sql
-- Supabaseで実行
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'blog_articles';
```

#### ステップ2: 手動実行テスト
ブラウザまたはcurlで `/api/autopilot/execute` にPOSTリクエスト

#### ステップ3: ログ確認
Netlify Dashboard → Functions → Logs でエラーを確認

#### ステップ4: 環境変数確認
Netlify Dashboard → Site settings → Environment variables で確認

#### ステップ5: スケジュール確認
Netlify Dashboard → Functions → Scheduled Functions で確認

### 即座に解決する方法

1. **手動で記事を生成:**
   ```bash
   curl -X POST https://seimei.app/api/autopilot/execute
   ```

2. **テーブルが存在しない場合:**
   - 上記のSQLをSupabaseで実行

3. **環境変数が設定されていない場合:**
   - Netlify Dashboardで環境変数を設定
   - 再デプロイ

4. **スケジュールが動作していない場合:**
   - Netlify Dashboard → Functions → Scheduled Functions で確認
   - `netlify.toml`の設定を確認
   - 再デプロイ

### 次のステップ

問題が解決しない場合:
1. Netlifyのログを確認
2. Supabaseのログを確認
3. 手動実行のレスポンスを確認
4. エラーメッセージを共有して調査

