# ランキング報酬システム

## 概要

四季制ランキングの報酬を自動配布するシステムです。各シーズン終了時に自動的にランキングを確定し、順位に応じた報酬ポイント（Kp）を配布します。

---

## シーズン構成

### 四季制ランキング

| シーズン | 期間 | 終了日 |
|---------|------|--------|
| 🌸 春の陣 | 3月〜5月 | 5月31日 23:59 |
| ☀️ 夏の陣 | 6月〜8月 | 8月31日 23:59 |
| 🍂 秋の陣 | 9月〜11月 | 11月30日 23:59 |
| ❄️ 冬の陣 | 12月〜2月 | 2月28日/29日 23:59 |

---

## 報酬テーブル

| 順位 | 報酬（Kp） | 称号 | タグライン |
|------|-----------|------|------------|
| 1位 | 500 | 叶龍王 | この名、天下に響く |
| 2位 | 300 | 名魂覇者 | 響命の翼 |
| 3位 | 200 | 名龍将 | 運命を刻む者 |
| 4位 | 150 | 運命導士 | - |
| 5位 | 120 | 開運師範 | - |
| 6位 | 100 | 光名士 | - |
| 7位 | 80 | 名探士 | - |
| 8位 | 60 | 福名士 | - |
| 9位 | 50 | 響魂者 | - |
| 10位 | 40 | 名の旅人 | - |
| 11-100位 | 30-10 | 叶の挑戦者 | 線形減衰 |

### 報酬計算式（11-100位）

```typescript
rewardPoints = Math.round(30 - ((rank - 11) / 89) * 20)
```

- 11位: 30 Kp
- 55位: 20 Kp
- 100位: 10 Kp

---

## 自動配布システム

### 実行タイミング

Netlify Scheduled Functionsを使用して、各シーズン終了時に自動実行されます。

| シーズン | 実行日時（JST） | Cron式（UTC） |
|---------|----------------|---------------|
| 春の陣 | 5月31日 23:59 | `59 14 31 5 *` |
| 夏の陣 | 8月31日 23:59 | `59 14 31 8 *` |
| 秋の陣 | 11月30日 23:59 | `59 14 30 11 *` |
| 冬の陣 | 2月28日/29日 23:59 | `59 14 28,29 2 *` |

### 処理フロー

```
1. シーズン終了時刻になる
   ↓
2. Netlify Scheduled Function が起動
   ↓
3. /api/ranking/finalize-season にPOSTリクエスト
   ↓
4. ランキングエントリを取得（スコア順）
   ↓
5. 各エントリに順位を確定
   ↓
6. 報酬ポイントを計算
   ↓
7. ranking_entries テーブルを更新（rank, reward_points）
   ↓
8. ユーザーに報酬ポイントを付与（addPointsSupa）
   ↓
9. point_transactions に記録
   ↓
10. 完了
```

---

## API仕様

### POST /api/ranking/finalize-season

シーズンを確定し、報酬を配布します。

#### 認証

```
Authorization: Bearer <CRON_SECRET>
```

環境変数 `CRON_SECRET` に設定された値を使用します。

#### リクエスト

手動実行の場合、URLパラメータでシーズンを指定できます：

```
POST /api/ranking/finalize-season?season=2025_spring
```

#### レスポンス

```json
{
  "success": true,
  "message": "ランキング確定処理が完了しました",
  "season": "2025_spring",
  "processedCount": 150,
  "successCount": 150,
  "failedCount": 0,
  "totalRewards": 8500,
  "errors": []
}
```

### GET /api/ranking/finalize-season

ステータス確認用エンドポイントです。

#### レスポンス

```json
{
  "message": "ランキング確定API - 稼働中",
  "previousSeason": "2025_spring",
  "currentSeason": "2025_summer",
  "usage": "POST /api/ranking/finalize-season",
  "auth": "Bearer <CRON_SECRET>",
  "manualExecution": "POST /api/ranking/finalize-season?season=2025_spring"
}
```

---

## 手動実行方法

### Netlifyダッシュボードから

1. Netlify Dashboard → Functions
2. `ranking-finalize-season` を選択
3. 「Trigger Function」をクリック

### APIから直接実行

```bash
curl -X POST https://seimei.app/api/ranking/finalize-season?season=2025_spring \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## データベーススキーマ

### ranking_entries テーブル

```sql
CREATE TABLE ranking_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  season TEXT NOT NULL,
  name TEXT NOT NULL,
  real_name TEXT,
  display_name_type TEXT,
  ranking_display_name TEXT,
  power_score INT NOT NULL,
  seasonal_bonus INT DEFAULT 0,
  item_bonus INT DEFAULT 0,
  total_score INT NOT NULL,
  rank INT,                    -- 確定後に設定
  reward_points INT DEFAULT 0, -- 確定後に設定
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### point_transactions テーブル

報酬付与時に以下のレコードが追加されます：

```sql
INSERT INTO point_transactions (
  user_id,
  type,
  amount,
  reason,
  category
) VALUES (
  '<user_id>',
  'earn',
  500,
  '2025_springランキング報酬（1位: 叶龍王）',
  'special_reward'
);
```

---

## トラブルシューティング

### 報酬が配布されない場合

1. **Netlify Functions のログを確認**
   - Netlify Dashboard → Functions → ranking-finalize-season → Logs

2. **CRON_SECRET が設定されているか確認**
   - Netlify Dashboard → Site settings → Environment variables
   - `CRON_SECRET` が設定されているか確認

3. **手動で実行してテスト**
   ```bash
   curl -X POST https://seimei.app/api/ranking/finalize-season?season=2025_spring \
     -H "Authorization: Bearer <CRON_SECRET>"
   ```

4. **データベースを確認**
   - `ranking_entries` テーブルで `rank` と `reward_points` が設定されているか確認
   - `point_transactions` テーブルで報酬が記録されているか確認

---

## 今後の拡張

### 年間ランキング（大晦日）

将来的に実装予定：

| 順位 | 称号 | 報酬 |
|------|------|------|
| 1位 | 叶龍王2025 | 10000 Kp |
| 2位 | 響命王 | 3000 Kp |
| 3位 | 名導士 | 1000 Kp |

### 通知機能

- シーズン終了時にユーザーに通知
- 報酬受け取りの案内
- 順位と称号の通知

### 称号表示

- ユーザープロフィールに称号を表示
- 名前カードに称号バッジを表示

---

## 関連ファイル

- `lib/ranking-repo.ts` - ランキング関連のユーティリティ関数
- `app/api/ranking/finalize-season/route.ts` - シーズン確定API
- `netlify/functions/ranking-finalize-season.ts` - Netlify Scheduled Function
- `netlify.toml` - Netlifyの設定（Cron設定含む）
- `docs/kanau-ranking-system-spec.md` - ランキングシステム全体の仕様書

