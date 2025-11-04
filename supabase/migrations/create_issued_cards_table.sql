-- ランクカード発行履歴テーブル
CREATE TABLE IF NOT EXISTS issued_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  total_points INTEGER NOT NULL,
  power_level INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_issued_cards_user_id ON issued_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_issued_cards_created_at ON issued_cards(created_at DESC);

-- RLS設定
ALTER TABLE issued_cards ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のカードのみ閲覧可能
CREATE POLICY "Users can view their own cards"
  ON issued_cards FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のカードのみ作成可能
CREATE POLICY "Users can create their own cards"
  ON issued_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

