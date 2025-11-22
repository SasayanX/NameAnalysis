# ランキングプライバシー機能のマイグレーション手順

## 📋 概要

`ranking_entries`テーブルにプライバシー関連のフィールドを追加するマイグレーションです。

追加されるフィールド：
- `real_name`: ユーザーの本名（非公開）
- `display_name_type`: 表示名の種類（'MASKED' または 'NICKNAME'）
- `ranking_display_name`: ランキングに表示される名前（マスキング済みまたはニックネーム）

## 🔧 方法1: Supabaseダッシュボードで実行（推奨）

### ステップ1: Supabaseダッシュボードにログイン

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択

### ステップ2: SQL Editorを開く

1. 左サイドバーから **「SQL Editor」** をクリック
2. **「New query」** ボタンをクリックして新しいクエリを作成

### ステップ3: マイグレーションSQLを実行

1. 以下のSQLをコピーして、SQL Editorに貼り付け：

```sql
-- Add privacy fields to ranking_entries table for name masking feature
-- This allows users to register with their real name while displaying masked names in the ranking

-- Step 1: Add new columns
ALTER TABLE public.ranking_entries
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS display_name_type TEXT CHECK (display_name_type IN ('MASKED', 'NICKNAME')) DEFAULT 'MASKED',
ADD COLUMN IF NOT EXISTS ranking_display_name TEXT;

-- Step 2: Migrate existing data
-- For existing entries, copy the 'name' field to 'real_name' and 'ranking_display_name'
-- and set display_name_type to 'MASKED' (default behavior)
UPDATE public.ranking_entries
SET 
  real_name = name,
  ranking_display_name = name,
  display_name_type = 'MASKED'
WHERE real_name IS NULL;

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ranking_entries_display_type 
ON public.ranking_entries(display_name_type);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN public.ranking_entries.real_name IS 'ユーザーの本名（非公開）。自分が見た場合のみ表示される。';
COMMENT ON COLUMN public.ranking_entries.display_name_type IS '表示名の種類。MASKED（本名をマスキング）またはNICKNAME（ニックネーム）。';
COMMENT ON COLUMN public.ranking_entries.ranking_display_name IS 'ランキングに表示される名前（マスキング済みまたはニックネーム）。';
```

2. **「Run」** ボタン（または `Ctrl+Enter` / `Cmd+Enter`）をクリックして実行

### ステップ4: 実行結果を確認

- 成功した場合：「Success. No rows returned」というメッセージが表示されます
- エラーが発生した場合：エラーメッセージが表示されます（既存のカラムがある場合は問題ありません）

---

## 🔧 方法2: Supabase CLIを使用（開発環境向け）

### 前提条件

1. Supabase CLIがインストールされていること
2. プロジェクトがSupabase CLIで初期化されていること

### ステップ1: Supabaseに接続

```bash
supabase link --project-ref your-project-ref
```

### ステップ2: マイグレーションを実行

```bash
supabase db push
```

または、特定のマイグレーションファイルのみ実行：

```bash
supabase migration up
```

---

## ✅ マイグレーション確認

マイグレーションが正常に完了したか確認するには：

### SQL Editorで確認

```sql
-- テーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ranking_entries'
ORDER BY ordinal_position;

-- 新しいカラムが追加されていることを確認
SELECT 
  real_name,
  display_name_type,
  ranking_display_name
FROM public.ranking_entries
LIMIT 5;
```

---

## ⚠️ 注意事項

1. **既存データの扱い**
   - 既存の`ranking_entries`レコードは自動的に`MASKED`タイプとして移行されます
   - `real_name`と`ranking_display_name`には既存の`name`値がコピーされます

2. **後方互換性**
   - 既存の`name`カラムは残っているため、既存コードとの互換性は保たれます
   - 段階的に新しいカラムを使用するように移行できます

3. **エラーが発生した場合**
   - カラムが既に存在する場合は、`ADD COLUMN IF NOT EXISTS`によりエラーになりません
   - 他のエラーが発生した場合は、エラーメッセージを確認してください

---

## 🚀 マイグレーション後のテスト

マイグレーション完了後、以下をテストしてください：

1. **ランキング登録機能**
   - 姓名判断ページで「全国ランキングに登録する」ボタンをクリック
   - プライバシー設定モーダルが表示されることを確認
   - 本名で匿名参加を選択して登録

2. **ランキング表示**
   - ランキングページにアクセス
   - 自分のエントリが本名で表示されることを確認
   - 他人のエントリがマスキングされていることを確認

3. **ニックネーム登録**
   - プライバシー設定モーダルで「ニックネームで参加する」を選択
   - ニックネームを入力して登録
   - ランキングページでニックネームが表示されることを確認

---

## 📝 関連ファイル

- マイグレーションファイル: `supabase/migrations/add_privacy_fields_to_ranking_entries.sql`
- 関連コンポーネント: `components/ranking-privacy-modal.tsx`
- 関連ロジック: `lib/ranking-repo.ts`
- ランキング表示: `app/ranking/page.tsx`

