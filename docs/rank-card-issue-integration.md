# ランクカード発行機能の統合ガイド

## 概要

ランクカード発行機能（③版）を既存のランク表示コンポーネントに統合する方法です。

## 実装内容

### 1. 定数定義

`constants/kp.ts` - KP関連の定数

```typescript
export const KP_COST_ISSUE = 5;  // 発行に必要なKP
export const KP_REWARD_SHARE = 10;  // 共有で還元されるKP
```

### 2. モーダルコンポーネント

`components/IssueCardModal.tsx` - 発行確認モーダル

### 3. 発行セクションコンポーネント

`components/RankCardIssueSection.tsx` - 発行ボタンと発行済みカード表示

### 4. API エンドポイント

- `app/api/issue-card/route.ts` - カード発行（KP消費 + 画像生成）
- `app/api/share-card-reward/route.ts` - 共有後のKP還元

## 統合方法

### `components/name-ranking-card.tsx` に追加

```tsx
import RankCardIssueSection from "@/components/RankCardIssueSection"

// NameRankingCardコンポーネント内（isPremium の場合のみ表示）
{isPremium && (
  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <RankCardIssueSection
      lastName={lastName}
      firstName={firstName}
      rank={rankingResult.powerRank}
      totalPoints={Math.floor(rankingResult.totalPoints)}
      powerLevel={rankingResult.powerLevel}
      baseImagePath={`/images/rare-cards/card_base_${rankingResult.powerRank}_v1.png`}
    />
  </div>
)}
```

## Supabaseテーブル作成

発行履歴を保存するテーブル（オプション）:

**SQLファイル**: `supabase/migrations/create_issued_cards_table.sql`

SupabaseダッシュボードのSQL Editorで実行してください。

```sql
-- issued_cards テーブル
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
```

## 使用例

### 基本的な使用

```tsx
"use client"
import RankCardIssueSection from "@/components/RankCardIssueSection"

export default function ResultPage() {
  const lastName = "大谷"
  const firstName = "翔平"
  const rank = "SSS"
  const totalPoints = 480
  const powerLevel = 10

  return (
    <div className="p-6">
      <RankCardIssueSection
        lastName={lastName}
        firstName={firstName}
        rank={rank}
        totalPoints={totalPoints}
        powerLevel={powerLevel}
      />
    </div>
  )
}
```

## 動作フロー

1. **発行ボタンクリック**
   - `IssueCardModal`が表示される
   - KP残高を確認
   - 不足している場合はエラー表示

2. **発行確認**
   - 「発行して運命を刻む」ボタンをクリック
   - `/api/issue-card` を呼び出し
   - KP消費（5KP）
   - 画像生成（`generateRareCardImage`）
   - 画像をSupabase Storageにアップロード（`rare-cards`バケット）
   - 永続的な公開URLを取得
   - 発行履歴保存（Supabase）

3. **共有**
   - 「シェアして10KP還元」ボタンをクリック
   - Web Share API またはクリップボードコピー
   - `/api/share-card-reward` を呼び出し
   - KP還元（10KP、1日1回制限）

## 注意事項

1. **画像保存先**: Supabase Storageの`rare-cards`バケットに保存されます（永続的な公開URL）
   - 詳細なセットアップ手順は `docs/supabase-storage-setup.md` を参照
   - バケットが存在しない場合、エラーが発生します
2. **KP残高**: 発行前に必ずサーバー側で残高を再確認
3. **共有制限**: 1日1回の制限を設定（`addPointsSupa`の`checkDailyLimit`を使用）
4. **認証**: 発行・共有には認証が必要（`useAuth`フックを使用）
5. **URL共有**: 公開URLは永続的で、再デプロイ後も404エラーになりません

## カスタマイズ

- **ベース画像**: `baseImagePath`プロパティでランク別のベース画像を指定
- **モーダル文言**: `components/IssueCardModal.tsx`を編集
- **KP価格**: `constants/kp.ts`を編集

