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

-- Step 3: Add NOT NULL constraints after data migration
-- Note: We'll add NOT NULL constraints in a separate migration if needed
-- For now, we allow NULL for backward compatibility during migration period

-- Step 4: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ranking_entries_display_type 
ON public.ranking_entries(display_name_type);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN public.ranking_entries.real_name IS 'ユーザーの本名（非公開）。自分が見た場合のみ表示される。';
COMMENT ON COLUMN public.ranking_entries.display_name_type IS '表示名の種類。MASKED（本名をマスキング）またはNICKNAME（ニックネーム）。';
COMMENT ON COLUMN public.ranking_entries.ranking_display_name IS 'ランキングに表示される名前（マスキング済みまたはニックネーム）。';

