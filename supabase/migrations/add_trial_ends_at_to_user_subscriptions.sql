-- user_subscriptionsテーブルにtrial_ends_atカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- インデックスを追加（トライアル終了日の検索用）
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_ends_at ON user_subscriptions (trial_ends_at DESC);

