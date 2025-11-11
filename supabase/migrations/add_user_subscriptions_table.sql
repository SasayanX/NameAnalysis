-- サブスクリプション状態を保存するテーブル
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  customer_email TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'failed')),
  payment_method TEXT CHECK (payment_method IN ('square', 'gmo', 'manual', 'google_play')),
  product_id TEXT,
  purchase_token TEXT UNIQUE,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renewing BOOLEAN DEFAULT FALSE,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_email ON user_subscriptions (customer_email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions (expires_at DESC);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION public.set_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_user_subscriptions_updated_at();

-- RLS設定
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサブスクリプションのみ参照可能
CREATE POLICY "Users can view their subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- サービスロール（Supabaseサービスキー）用に、アップサートを許可
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

