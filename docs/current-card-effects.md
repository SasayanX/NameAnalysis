# 現在適用されているカードエフェクト一覧

## 名前テキストに適用されているエフェクト

### 1. 後光エフェクト（SSSランクのみ）
- **位置**: メインテキストと同じ位置
- **色**: グロー色（`colors.glow`）
- **不透明度**: 0.6
- **フィルター**: 
  - サーバーサイド: **なし**（削除済み）
  - フロントエンド: `url(#strong-glow)`（まだ残っている）

### 2. 多段影
- **位置**: メインテキストから (x+2, y+3) にオフセット
- **色**: 影色（`colors.shadow`）
- **不透明度**: 0.6
- **フィルター**: なし

### 3. メインテキスト
- **フォント**: KSW闘龍, font-weight: 700
- **縁取り**:
  - SSランク: `stroke-width="0.3"`, `stroke-opacity="0.2"`
  - その他: `stroke-width="0.2"`, `stroke-opacity="0.2"`
  - `stroke-linejoin="miter"`, `stroke-linecap="butt"`
- **フィルター**: **なし**（削除済み）
- **レンダリング**:
  - `text-rendering="optimizeLegibility"`
  - `shape-rendering="crispEdges"`

### 4. 内側ハイライト
- **位置**: メインテキストから (x-1, y-2) にオフセット
- **色**: 白（`rgba(255,255,255,0.4)`）
- **不透明度**: 0.5
- **サイズ**: メインテキストの98%
- **フィルター**: なし

## 定義されているフィルター（メインテキストには適用されていない）

### glow-colored-${rank}
最小限のぼかしとグロー：
- **内側グロー**: `stdDeviation="1"`, `flood-opacity="0.15"`
- **外側グロー**: `stdDeviation="2"`, `flood-opacity="0.1"`
- **影**: `stdDeviation="0.5"`, `flood-opacity="0.1"`

### strong-glow（SSS用）
- **ぼかし**: `stdDeviation="1"`

## その他の要素に適用されているフィルター

### ランク表示（左上のバッジ）
- SSS: `url(#strong-glow)`
- その他: `url(#glow-${rank})`

### ランク名（右上）
- SSS: `url(#strong-glow)`
- その他: `url(#glow-${rank})`

### ポイント表示（下部）
- SSS: `url(#strong-glow)`
- その他: `url(#glow)`

### SSS特別演出
- 龍のシルエット、光輪、火花などに `url(#strong-glow)` が適用されている

## フロントエンド（components/RareCard.tsx）

### メインテキスト
- **フィルター**: なし（削除済み）
- **textShadow**: CSSの`textShadow`スタイルが適用されている
  - `0 0 6px ${colors.glow}, 0 0 14px ${colors.glow}, 0 4px 4px ${colors.shadow}`

### 後光エフェクト（SSSのみ）
- **フィルター**: `url(#strong-glow)`（まだ残っている）

## まとめ

**名前テキスト（メイン）:**
- ✅ 縁取り: 最小限（0.2-0.3px, opacity 0.2）
- ✅ フィルター: なし（削除済み）
- ✅ レンダリング: くっきり（crispEdges, optimizeLegibility）
- ✅ 多段影: あり（opacity 0.6）
- ✅ 内側ハイライト: あり（opacity 0.5）

**フロントエンドの後光エフェクト:**
- ⚠️ まだフィルターが残っている（`filter="url(#strong-glow)"`）

