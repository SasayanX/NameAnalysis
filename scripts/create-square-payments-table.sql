-- Square決済情報を保存するテーブル
-- Webhookで受け取った決済情報を保存し、フロントエンドで取得できるようにする

create table if not exists public.square_payments (
  id uuid primary key default gen_random_uuid(),
  payment_id text unique not null, -- Squareのpayment.id
  order_id text, -- Squareのorder_id
  customer_email text, -- 購入者のメールアドレス
  plan text check (plan in ('basic', 'premium')) not null, -- プラン
  amount int not null, -- 金額（円単位）
  currency text default 'JPY', -- 通貨
  status text check (status in ('pending', 'completed', 'failed')) not null, -- 決済状況
  webhook_received_at timestamptz default now(), -- Webhook受信時刻
  activated_at timestamptz, -- プラン有効化時刻
  expires_at timestamptz, -- プラン有効期限
  metadata jsonb, -- その他の情報
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックス
create index if not exists idx_square_payments_customer_email on public.square_payments(customer_email);
create index if not exists idx_square_payments_payment_id on public.square_payments(payment_id);
create index if not exists idx_square_payments_status on public.square_payments(status);
create index if not exists idx_square_payments_created_at on public.square_payments(created_at desc);

-- RLS有効化
alter table public.square_payments enable row level security;

-- ポリシー: 誰でも読み取り可能（認証が無効な場合のため）
do $$ begin
  create policy "anyone_can_read_square_payments" on public.square_payments
    for select using (true);
exception when duplicate_object then null; end $$;

-- ポリシー: サーバー側で書き込み可能
do $$ begin
  create policy "anyone_can_insert_square_payments" on public.square_payments
    for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "anyone_can_update_square_payments" on public.square_payments
    for update using (true);
exception when duplicate_object then null; end $$;

-- コメント
comment on table public.square_payments is 'Square決済情報を保存するテーブル';
comment on column public.square_payments.payment_id is 'Squareのpayment.id';
comment on column public.square_payments.customer_email is '購入者のメールアドレス（プラン有効化の識別に使用）';
comment on column public.square_payments.plan is 'プラン（basic/premium）';
comment on column public.square_payments.status is '決済状況';
comment on column public.square_payments.activated_at is 'プラン有効化時刻（フロントエンドで設定）';

