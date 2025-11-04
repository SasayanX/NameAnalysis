-- issued_cardsテーブルの確認用クエリ

-- テーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'issued_cards'
ORDER BY ordinal_position;

-- インデックスを確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'issued_cards';

-- RLSポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'issued_cards';

