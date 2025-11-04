# フレームシステム 技術仕様書

## 概要

鑑定カードのフレームシステム（収集・交換・錬成機能）の実装仕様書。
実装は将来予定だが、仕様をメモとして保存。

## 1. ドメインモデル（TypeScript）

```typescript
// rank & rarity
export type Rank = "SSS" | "SS" | "S" | "A+" | "A" | "B+" | "B" | "C" | "D";
export type Rarity = "normal" | "rare" | "super_rare" | "legend";

// フレームのタグ（錬成素材用）
export type FrameTag =
  | "dragon" | "sun" | "thunder" | "flame" | "bamboo" | "star" | "moon"
  | "leaf" | "paper" | "wood" | "ink" | "snow" | "platinum" | "gold";

// セット名
export type FrameSet = "god_dragon" | "blue_bamboo" | "azure_sky" | "rin_wind" | "event_seasonal";

// フレーム定義
export interface FrameDef {
  id: string;                 // "frame_sss_tenkamuso_v1"
  rank: Rank;
  rarity: Rarity;
  titleJP: string;            // 表示名（例：天下無双）
  baseImageUrl: string;       // 名前無しベース画像
  placeholderRect: { x: number; y: number; w: number; h: number }; // 名前描画領域(px)
  textStyle: {
    vertical: boolean;        // 縦書き
    fontFamily: string;       // 例: "Hannari, 'Yu Mincho', serif"
    fontSize: number;         // 例: 144
    color: string;            // 推奨文字色 (hex)
    shadow: string;           // text-shadow 値
  };
  set?: FrameSet;             // 所属セット
  tags: FrameTag[];           // 錬成素材タグ
  glowHint?: "warm" | "cool" | "neutral"; // 色温度ヒント
}

// 所持フレーム
export interface UserFrame {
  frameId: string;
  obtainedAt: string; // ISO
  source: "self" | "friend" | "reward" | "craft" | "shop";
  ownerId: string;
}

// 錬成ルール
export interface CraftRule {
  id: string;                 // "craft_kaguya_v1"
  requiredTags: FrameTag[];   // ["bamboo","star","moon"]
  resultFrameId: string;      // 生成される隠しフレームID
  hidden: boolean;            // true: 条件満たすまでUIに出さない
  rewardKP: number;           // 付与KP
  specialCutscene?: "kaguya" | "aurora_dragon" | "spring";
}

// 交換
export interface TradeTicket {
  fromUserId: string;
  toUserId: string;
  frameId: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

// 鑑定カード（生成用）
export interface NameCardIssue {
  name: string;             // 佐々木靖隆
  rank: Rank;               // 診断ランク（任意、自由発行モードでは不要）
  frameId: string;          // 使用フレーム
  score?: number;           // 任意表示 (例:463)
  meta?: Record<string, any>;
}
```

## 2. マスタJSON（例・一部）

```json
{
  "frames": [
    {
      "id": "frame_sss_tenkamuso_v1",
      "rank": "SSS",
      "rarity": "legend",
      "titleJP": "天下無双",
      "baseImageUrl": "/assets/frames/SSS_tenkamuso_base.png",
      "placeholderRect": { "x": 360, "y": 160, "w": 300, "h": 1220 },
      "textStyle": {
        "vertical": true,
        "fontFamily": "Hannari, 'Yu Mincho', serif",
        "fontSize": 144,
        "color": "#FFF8D9",
        "shadow": "0 0 8px #FFD76A, 0 0 18px #FFF8D9, 0 4px 4px #B8860B"
      },
      "set": "god_dragon",
      "tags": ["dragon", "gold"],
      "glowHint": "warm"
    },
    {
      "id": "frame_ss_mutei_platinum_v1",
      "rank": "SS",
      "rarity": "legend",
      "titleJP": "無敵",
      "baseImageUrl": "/assets/frames/SS_mutei_platinum_base.png",
      "placeholderRect": { "x": 360, "y": 160, "w": 300, "h": 1220 },
      "textStyle": {
        "vertical": true,
        "fontFamily": "Hannari, 'Yu Mincho', serif",
        "fontSize": 136,
        "color": "#F2F7FF",
        "shadow": "0 0 8px #BFD1FF, 0 0 18px #F2F7FF, 0 4px 4px #8FA7CC"
      },
      "set": "god_dragon",
      "tags": ["platinum", "thunder"],
      "glowHint": "cool"
    },
    {
      "id": "frame_s_saikyo_crimson_v1",
      "rank": "S",
      "rarity": "super_rare",
      "titleJP": "最強",
      "baseImageUrl": "/assets/frames/S_saikyo_crimson_base.png",
      "placeholderRect": { "x": 360, "y": 160, "w": 300, "h": 1220 },
      "textStyle": {
        "vertical": true,
        "fontFamily": "Hannari, 'Yu Mincho', serif",
        "fontSize": 136,
        "color": "#FFE1CC",
        "shadow": "0 0 8px #FF8040, 0 0 18px #FFE1CC, 0 4px 4px #993300"
      },
      "set": "god_dragon",
      "tags": ["flame", "dragon"],
      "glowHint": "warm"
    },
    {
      "id": "frame_aplus_ichiryu_ao_v1",
      "rank": "A+",
      "rarity": "super_rare",
      "titleJP": "一流",
      "baseImageUrl": "/assets/frames/Aplus_ichiryu_ao_base.png",
      "placeholderRect": { "x": 360, "y": 160, "w": 300, "h": 1220 },
      "textStyle": {
        "vertical": true,
        "fontFamily": "Hannari, 'Yu Mincho', serif",
        "fontSize": 130,
        "color": "#DDE8FF",
        "shadow": "0 0 8px #B0C8FF, 0 0 18px #DDE8FF, 0 4px 4px #203060"
      },
      "set": "blue_bamboo",
      "tags": ["bamboo", "gold"],
      "glowHint": "neutral"
    },
    {
      "id": "frame_a_yushuu_green_v1",
      "rank": "A",
      "rarity": "rare",
      "titleJP": "優秀",
      "baseImageUrl": "/assets/frames/A_yushuu_green_base.png",
      "placeholderRect": { "x": 360, "y": 160, "w": 300, "h": 1220 },
      "textStyle": {
        "vertical": true,
        "fontFamily": "Hannari, 'Yu Mincho', serif",
        "fontSize": 124,
        "color": "#EAF5CC",
        "shadow": "0 0 8px #BFE87A, 0 0 18px #EAF5CC, 0 4px 4px #667A3A"
      },
      "set": "blue_bamboo",
      "tags": ["leaf", "dragon"],
      "glowHint": "neutral"
    }
  ],
  "craftRules": [
    {
      "id": "craft_kaguya_v1",
      "requiredTags": ["bamboo", "star", "moon"],
      "resultFrameId": "frame_secret_kaguya_hime",
      "hidden": true,
      "rewardKP": 100,
      "specialCutscene": "kaguya"
    },
    {
      "id": "craft_aurora_dragon_v1",
      "requiredTags": ["dragon", "star"],
      "resultFrameId": "frame_secret_aurora_dragon",
      "hidden": true,
      "rewardKP": 80,
      "specialCutscene": "aurora_dragon"
    }
  ]
}
```

## 3. 画面フロー（要点）

```
[Home]
  ├─ 現在の鑑定カードプレビュー（回転/スワイプ）
  ├─ ボタン：鑑定する / フレーム / 交換 / 錬成 / ショップ
  └─ 通知バナー（コンプリート / 錬成成功）

[鑑定]
  ├─ 名前入力 → スコア算出 → ランク決定
  ├─ 推奨フレーム提案（同ランク系）
  └─ 「発行」→ カード生成 → 保存/共有

[フレーム一覧]
  ├─ 所持／未所持タブ（グリッド）
  ├─ アイテム絞り込み（ランク・セット・タグ）
  └─ フレーム選択 →「このフレームで発行」

[交換（フレンド）]
  ├─ QR/IDでフレンド追加
  ├─ 1日1回 交換申請（任意フレーム）
  └─ 承認 → 相手のフレームが自分の一覧に追加（source: "friend"）

[錬成]
  ├─ 3枠にフレームをドラッグ
  ├─ 条件一致 → 「錬成」ボタン有効
  ├─ 成功演出（カットシーン）→ 新フレーム獲得（source: "craft"）
  └─ SNSシェア → KP還元

[ショップ(KP)]
  ├─ 錬成確率UP護符 / 限定BGM / 効果音 / 限定背景
  └─ KP購入（外部決済 or 付与）
```

## 4. 実装ユーティリティ（錬成・発行・交換）

```typescript
// 所持フレーム群から指定タグを含むかチェック
export function hasTags(frames: FrameDef[], tags: FrameTag[]): boolean {
  const ownedTags = new Set(frames.flatMap(f => f.tags));
  return tags.every(t => ownedTags.has(t));
}

// 錬成判定
export function tryCraft(
  chosenFrames: FrameDef[],
  rules: CraftRule[]
): { success: boolean; rule?: CraftRule } {
  for (const rule of rules) {
    const ok = rule.requiredTags.every(tag =>
      chosenFrames.some(f => f.tags.includes(tag))
    );
    if (ok) return { success: true, rule };
  }
  return { success: false };
}

// カード描画：<img base> + 縦書きテキストを重ねてPNG化（ブラウザ）
export async function renderCardPNG(svgEl: SVGSVGElement): Promise<Blob> {
  const data = new XMLSerializer().serializeToString(svgEl);
  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  await img.decode();
  const canvas = document.createElement("canvas");
  const vb = svgEl.viewBox.baseVal;
  canvas.width = vb && vb.width ? vb.width : svgEl.clientWidth;
  canvas.height = vb && vb.height ? vb.height : svgEl.clientHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return await new Promise((res) => canvas.toBlob((b)=>res(b!), "image/png"));
}
```

## 5. React：カード合成コンポーネント（名前重ね）

```tsx
import Image from "next/image";
import { FrameDef } from "@/types";

export function NameCard({ name, frame, w=1024, h=1536 }:{
  name: string; frame: FrameDef; w?: number; h?: number;
}) {
  const rect = frame.placeholderRect;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <image href={frame.baseImageUrl} x="0" y="0" width={w} height={h} />
      <defs>
        <filter id="emboss">
          <feDiffuseLighting in="SourceGraphic" lightingColor="#fff6cc" surfaceScale="2" result="light">
            <feDistantLight azimuth="225" elevation="40" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0.7" k3="0" k4="0"/>
        </filter>
      </defs>
      <foreignObject x={rect.x} y={rect.y} width={rect.w} height={rect.h}>
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            writingMode: frame.textStyle.vertical ? "vertical-rl" : "horizontal-tb",
            fontFamily: frame.textStyle.fontFamily,
            fontSize: `${frame.textStyle.fontSize}px`,
            lineHeight: 1.05,
            letterSpacing: "2px",
            color: frame.textStyle.color,
            textShadow: frame.textStyle.shadow,
            filter: "url(#emboss)"
          }}>
            {name}
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
```

## 6. API設計（Next.js Route Handlers）

```typescript
// POST /api/trade
// body: { toUserId, frameId }
// 1日1回制限はサーバーでチェック
// 成功で TradeTicket を返す

// POST /api/trade/accept
// body: { ticketId } → 所持フレーム配布

// POST /api/craft
// body: { frameIds: string[] }
// サーバー側で rule 判定 → resultFrameId を付与 & KP加算

// POST /api/issue
// body: NameCardIssue
// 画像生成（sharp or canvas）→ 署名つきURL返却
```

## 7. カラーパレット（ランク別推奨）

| ランク | 文字色     | 外光      | 影色      |
| --- | ------- | ------- | ------- |
| SSS | #FFF8D9 | #FFD76A | #B8860B |
| SS  | #F2F7FF | #BFD1FF | #8FA7CC |
| S   | #FFE1CC | #FF8040 | #993300 |
| A+  | #DDE8FF | #B0C8FF | #203060 |
| A   | #EAF5CC | #BFE87A | #667A3A |
| B+  | #DCE8FF | #99BFFF | #334A66 |
| B   | #F5F5F5 | #CCCCCC | #555555 |
| C   | #F2E0C6 | #E5B67E | #5C3A24 |
| D   | #FFD1A6 | #CC5A2E | #330000 |

## 8. 演出フック

* **錬成成功**：`dispatch({ type: "CUTSCENE", payload: "kaguya" })`
* **コンプリート**：セット揃い検知 → `toast("コンプリート！")`＋フレーム付与
* **共有**：保存完了時にシェアモーダル → 投稿でKP還元

## 9. テスト観点（要点）

* 錬成の**順序依存無し**（タグ合計で判定）
* 自由発行モードで**低ランクユーザーも上位フレームに名前を載せられる**
* 交換は**1日1回**／不正防止（自分へ戻しループ禁止）
* 出力画像の**縦横2比率**（1024×1536 / 1200×630）対応

## 10. データベーススキーマ（Supabase）

```sql
-- フレーム所持情報
CREATE TABLE IF NOT EXISTS public.user_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  frame_id TEXT NOT NULL,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT CHECK (source IN ('self', 'friend', 'reward', 'craft', 'shop')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交換チケット
CREATE TABLE IF NOT EXISTS public.trade_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  frame_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_frames_user ON public.user_frames(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_tickets_from_user ON public.trade_tickets(from_user_id);
CREATE INDEX IF NOT EXISTS idx_trade_tickets_to_user ON public.trade_tickets(to_user_id);

-- RLS設定
ALTER TABLE public.user_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_tickets ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の所持フレームを閲覧可能
CREATE POLICY "user_frames_select_own" ON public.user_frames
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の交換チケットを閲覧可能
CREATE POLICY "trade_tickets_select_own" ON public.trade_tickets
  FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
```

## 実装優先順位

1. **Phase 1**: フレーム一覧表示・選択機能
2. **Phase 2**: カード生成（既存のRareCardコンポーネントを拡張）
3. **Phase 3**: 錬成機能
4. **Phase 4**: 交換機能
5. **Phase 5**: ショップ統合

## 参考

- 既存の`components/RareCard.tsx`を基盤として拡張
- `lib/rare-card-utils.ts`のユーティリティ関数を活用
- Supabaseの`user_frames`テーブルで所持フレームを管理

