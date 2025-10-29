-- Supabase schema for Kanau Points & Ranking System

-- Users (optional if using auth.users)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  gender text check (gender in ('male','female')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kanau points summary per user
create table if not exists public.kanau_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  points int default 0,
  total_earned int default 0,
  total_spent int default 0,
  consecutive_login_days int default 0,
  last_login_date date,
  last_login_bonus_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Point transactions
create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text check (type in ('earn','spend')) not null,
  amount int not null,
  reason text not null,
  category text check (category in ('login_bonus','ranking_reward','ranking_entry','special_reward','purchase')) not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Special items
create table if not exists public.special_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text check (type in ('amulet','stone','crystal','scale','pearl','soul')) not null,
  effect_type text check (effect_type in ('score_boost','seasonal_bonus')) not null,
  effect_value int not null,
  description text not null,
  obtained_at timestamptz default now(),
  used_at timestamptz,
  is_used boolean default false
);

-- Ranking entries
create table if not exists public.ranking_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  season text not null,
  name text not null,
  power_score int not null,
  seasonal_bonus int default 0,
  item_bonus int default 0,
  total_score int not null,
  rank int,
  reward_points int default 0,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_kanau_points_user on public.kanau_points(user_id);
create index if not exists idx_point_tx_user_time on public.point_transactions(user_id, created_at desc);
create index if not exists idx_special_items_user on public.special_items(user_id);
create index if not exists idx_ranking_entries_season on public.ranking_entries(season);

-- Enable RLS and basic policies (assumes auth.uid() is the user_id)
alter table public.kanau_points enable row level security;
alter table public.point_transactions enable row level security;
alter table public.special_items enable row level security;
alter table public.ranking_entries enable row level security;

-- Policies: users can access only their rows
do $$ begin
  create policy "select_own_kanau_points" on public.kanau_points
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "update_own_kanau_points" on public.kanau_points
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "insert_own_kanau_points" on public.kanau_points
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "select_own_point_tx" on public.point_transactions
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "insert_own_point_tx" on public.point_transactions
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "select_own_items" on public.special_items
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "update_own_items" on public.special_items
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "insert_own_items" on public.special_items
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "select_ranking_entries" on public.ranking_entries
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "insert_own_ranking_entry" on public.ranking_entries
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ユーザープロファイルテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 決済履歴テーブル
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INTEGER, -- 金額（円）
  currency TEXT DEFAULT 'jpy',
  status TEXT CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
  plan_type TEXT CHECK (plan_type IN ('basic', 'pro', 'premium')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 利用履歴テーブル
CREATE TABLE usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type TEXT, -- 'detailed_analysis', 'compatibility', 'fortune_flow' など
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ポリシー設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- プロファイルのポリシー
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 決済履歴のポリシー
CREATE POLICY "Users can view own payment history" ON payment_history FOR SELECT USING (auth.uid() = user_id);

-- 利用履歴のポリシー
CREATE POLICY "Users can view own usage history" ON usage_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage history" ON usage_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- プロファイル更新時のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 新規ユーザー登録時に自動でプロファイルを作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ language plpgsql security definer;

-- 新規ユーザー登録時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- X（Twitter）自動投稿用テーブル
CREATE TABLE IF NOT EXISTS public.twitter_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name text NOT NULL,
  first_name text NOT NULL,
  tweet_id text UNIQUE NOT NULL,
  tweet_content text NOT NULL,
  posted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 収集した人名テーブル
CREATE TABLE IF NOT EXISTS public.collected_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name text NOT NULL,
  first_name text NOT NULL,
  source text NOT NULL,
  collected_at timestamptz DEFAULT now(),
  analyzed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_twitter_posts_name ON public.twitter_posts(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_posted_at ON public.twitter_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_collected_names_source ON public.collected_names(source);
CREATE INDEX IF NOT EXISTS idx_collected_names_collected_at ON public.collected_names(collected_at DESC);

-- RLS設定（誰でも読み取り可能、認証不要で投稿履歴を保存）
ALTER TABLE public.twitter_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_names ENABLE ROW LEVEL SECURITY;

-- ポリシー: 全員が読み取り可能、サービスロールが書き込み可能
DO $$ BEGIN
  CREATE POLICY "anyone_can_read_twitter_posts" ON public.twitter_posts
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "anyone_can_read_collected_names" ON public.collected_names
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ブログ記事テーブル（自動生成記事用）
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
