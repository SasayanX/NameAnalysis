# square_paymentsテーブルの作成方法

`square_payments`テーブルが存在しない場合の作成手順です。

## 📋 方法1: Supabaseダッシュボードで実行（推奨）

1. Supabaseダッシュボードにログイン
2. 左メニューから「SQL Editor」を選択
3. 以下のSQLをコピー＆ペーストして実行：

```sql
-- Square決済情報を保存するテーブル
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

-- ポリシー: 誰でも読み取り可能
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
```

4. 「Run」ボタンをクリックして実行

## 📋 方法2: マイグレーションファイルを使用

`supabase/migrations/create_square_payments_table.sql` ファイルが作成されています。

Supabase CLIを使用している場合：

```bash
supabase db push
```

## ✅ 確認方法

テーブルが作成されたか確認：

```sql
-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'square_payments';

-- テーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'square_payments'
ORDER BY ordinal_position;
```

## 🔍 テーブル構造

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | uuid | 主キー |
| `payment_id` | text | Squareのpayment.id（ユニーク） |
| `order_id` | text | Squareのorder_id |
| `customer_email` | text | 購入者のメールアドレス |
| `plan` | text | プラン（'basic' または 'premium'） |
| `amount` | int | 金額（円単位） |
| `currency` | text | 通貨（デフォルト: 'JPY'） |
| `status` | text | 決済状況（'pending', 'completed', 'failed'） |
| `webhook_received_at` | timestamptz | Webhook受信時刻 |
| `activated_at` | timestamptz | プラン有効化時刻 |
| `expires_at` | timestamptz | プラン有効期限 |
| `metadata` | jsonb | その他の情報（JSON形式） |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

## 🚨 トラブルシューティング

### エラー: "relation already exists"
テーブルが既に存在する場合、`if not exists`によりスキップされます。問題ありません。

### エラー: "permission denied"
サービスロールキーを使用していることを確認してください。

### RLSポリシーのエラー
ポリシーが既に存在する場合、`exception when duplicate_object then null`によりスキップされます。

