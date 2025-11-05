# Supabase Storage セットアップガイド

## 概要

ランクカード画像を永続的に保存し、共有URLが404にならないようにするため、Supabase Storageを使用します。

## セットアップ手順

### 1. Supabase Storageバケットの作成

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから「Storage」を選択
4. 「Create a new bucket」をクリック
5. 以下の設定でバケットを作成：
   - **Name**: `rare-cards`
   - **Public bucket**: ✅ **有効にする（重要）** - 公開URLを取得するために必要
   - **File size limit**: 10MB（デフォルト）
   - **Allowed MIME types**: `image/png`（必要に応じて追加）

### 2. Storageポリシーの設定（RLS）

バケット作成後、以下のポリシーを設定します：

#### アップロードポリシー（認証済みユーザーのみ）

```sql
-- 認証済みユーザーは自分のフォルダにのみアップロード可能
CREATE POLICY "Users can upload their own cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'rare-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 読み取りポリシー（公開）

```sql
-- すべてのユーザー（認証なし含む）が読み取り可能
CREATE POLICY "Public read access for rare cards"
ON storage.objects FOR SELECT
USING (bucket_id = 'rare-cards');
```

#### 削除ポリシー（認証済みユーザーのみ）

```sql
-- 認証済みユーザーは自分のフォルダのファイルのみ削除可能（10日間の自動削除用）
CREATE POLICY "Users can delete their own cards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'rare-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. 環境変数の確認

以下の環境変数が設定されていることを確認：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ファイル構造

Supabase Storage内のファイル構造：

```
rare-cards/
  └── {userId}/
      └── card_{姓}_{名}_{ランク}_{timestamp}.png
```

例：
```
rare-cards/
  └── 911579d6-19f2-4991-a11e-5ed29a2a9e17/
      └── card_佐々木_靖隆_SS_1234567890.png
```

## 公開URLの形式

アップロードされた画像は以下の形式で公開URLが取得されます：

```
https://{project-id}.supabase.co/storage/v1/object/public/rare-cards/{userId}/{filename}
```

このURLは永続的で、再デプロイ後も有効です。

## トラブルシューティング

### エラー: "new row violates row-level security policy"

→ Storageポリシーが正しく設定されていない可能性があります。上記のポリシーを確認してください。

### エラー: "Bucket not found"

→ `rare-cards` バケットが作成されていないか、名前が間違っています。

### エラー: "Public URL returns 404"

→ バケットが「Public」に設定されていない可能性があります。バケット設定を確認してください。

## 料金・制限

### 無料プラン
- **ストレージ容量**: 1GBまで無料
- **保存期間**: 無制限（削除しない限り永続的に保存）
- **帯域幅**: 月間5GB
- **自動停止**: 7日間アクセスがないと一時停止（データは保持）

### 有料プラン
- **Proプラン（$25/月）**: 100GBストレージ、250GB帯域幅
- 詳細は `docs/supabase-storage-pricing.md` を参照

## 自動削除機能

**10日間の自動削除**が実装されています：
- 新しいカードを発行する際に、10日以上古いカードを自動的に削除
- Storageから画像ファイルを削除
- データベースから発行履歴を削除
- ストレージ容量を効率的に管理

## 注意事項

1. **ストレージ容量**: Supabase無料プランでは1GBのストレージが利用可能です
2. **ファイルサイズ**: デフォルトで50MBまでアップロード可能（設定で変更可能）
3. **コスト**: 無料プランで十分な容量がある場合、追加コストはかかりません
4. **保存期間**: 10日間（自動削除機能により、10日以上経過したカードは削除されます）

