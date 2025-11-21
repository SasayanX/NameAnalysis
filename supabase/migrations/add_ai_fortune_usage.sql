-- AI鑑定使用回数管理テーブル
CREATE TABLE IF NOT EXISTS public.ai_fortune_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  limit_per_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- 龍の息吹アイテム管理テーブル（special_itemsを拡張）
-- typeに'dragon_breath'を追加する必要があるが、既存のspecial_itemsテーブルを使用
-- ただし、effect_typeに'ai_fortune_usage'を追加

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ai_fortune_usage_user_date ON public.ai_fortune_usage(user_id, usage_date DESC);

-- RLS設定
ALTER TABLE public.ai_fortune_usage ENABLE ROW LEVEL SECURITY;

-- ポリシー
DO $$ BEGIN
  CREATE POLICY "select_own_ai_fortune_usage" ON public.ai_fortune_usage
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "update_own_ai_fortune_usage" ON public.ai_fortune_usage
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "insert_own_ai_fortune_usage" ON public.ai_fortune_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- special_itemsテーブルのtypeに'dragon_breath'を追加（既存のCHECK制約を更新）
-- 注意: 既存のCHECK制約を削除して再作成する必要がある
-- ただし、これは既存データに影響する可能性があるため、慎重に実行

-- まず、既存のCHECK制約を確認してから更新
-- ALTER TABLE public.special_items DROP CONSTRAINT IF EXISTS special_items_type_check;
-- ALTER TABLE public.special_items ADD CONSTRAINT special_items_type_check 
--   CHECK (type IN ('amulet','stone','crystal','scale','pearl','soul','dragon_breath'));

-- effect_typeに'ai_fortune_usage'を追加
ALTER TABLE public.special_items DROP CONSTRAINT IF EXISTS special_items_effect_type_check;
ALTER TABLE public.special_items ADD CONSTRAINT special_items_effect_type_check 
  CHECK (effect_type IN ('score_boost','seasonal_bonus','ai_fortune_usage'));

-- typeに'dragon_breath'を追加
ALTER TABLE public.special_items DROP CONSTRAINT IF EXISTS special_items_type_check;
ALTER TABLE public.special_items ADD CONSTRAINT special_items_type_check 
  CHECK (type IN ('amulet','stone','crystal','scale','pearl','soul','dragon_breath'));

-- usage_countカラムを追加（龍の息吹の使用回数を保存）
ALTER TABLE public.special_items
ADD COLUMN IF NOT EXISTS usage_count INTEGER;

