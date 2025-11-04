# レアカード フロントエンド実装ガイド

## 概要

「**背景＝AIで固定（ランク別）＋名前＝動的重ね**」方式でレアカードを実装しました。

## 実装方式

### 1. ベース画像（AI生成）

- **ランク別**にベース画像を用意
- サイズ: 1024×1536（縦）または 1200×630（横）
- **セーフゾーン**: 上下120px / 左右80px
- 背景にうっすら龍紋・光粒子・縁の発光を入れる（**文字は入れない**）
- ファイル名: `card_base_SSS_v1.png`, `card_base_SS_v1.png` など

### 2. フロントエンドで名前を合成

- **SVGオーバーレイ方式**を使用
- ベース画像の上にSVGで名前テキストを重ねる
- 縦書き: CSS `writing-mode: vertical-rl` または SVG `text`要素
- 光彩: 多段`text-shadow` + SVGフィルター（外側発光＋内側陰影）
- 文字は中央固定、行間は文字数で自動可変

### 3. PNG出力（共有用）

- ブラウザで`<canvas>`に描画→`toDataURL()`で即DL or シェア
- 共有テキストも同時生成（例：「SSS 天下無双 / 480pt」）

## コンポーネント構成

### `RareCard.tsx`

メインのレアカード表示コンポーネント

**Props:**
- `lastName`: 姓
- `firstName`: 名
- `rank`: ランク（'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'）
- `title`: 称号（例: "天下無双"）
- `score`: スコア
- `powerLevel`: パワーレベル（1-10）
- `baseSrc`: ベース画像パス（オプション）
- `width`: 幅（デフォルト: 1024）
- `height`: 高さ（デフォルト: 1536）

**特徴:**
- SVGベースのレンダリング
- ランク別の色設定
- セーフゾーンを考慮した自動レイアウト
- 縦書き文字の自動サイズ調整

### `RareCardWithActions.tsx`

ダウンロード・共有機能付きのラッパーコンポーネント

**機能:**
- ダウンロード（PNG）
- 共有（Web Share API）
- クリップボードにコピー

### `lib/rare-card-utils.ts`

ユーティリティ関数

- `renderCardPNG()`: SVGをPNG Blobに変換
- `downloadCardPNG()`: PNGをダウンロード
- `blobToDataURL()`: BlobをData URLに変換
- `generateShareText()`: SNS共有用テキストを生成
- `shareCard()`: Web Share APIで共有

## 使用方法

### 基本的な使用例

```tsx
import RareCardWithActions from '@/components/RareCardWithActions'

<RareCardWithActions
  lastName="大谷"
  firstName="翔平"
  rank="SSS"
  title="天下無双"
  score={480}
  powerLevel={10}
  baseSrc="/images/rare-cards/card_base_SSS_v1.png"
  width={1024}
  height={1536}
/>
```

### ランク別の称号

```tsx
const rankTitles = {
  SSS: '天下無双',
  SS: '無敵',
  S: '最強',
  'A+': '一流',
  A: '優秀',
  'B+': '良好',
  B: '普通',
  C: '平凡',
  D: '苦労',
}
```

## デザイン仕様

### ランク別の色設定

```typescript
const rankColors = {
  SSS: { main: '#FEE28A', glow: '#FFD24D', shadow: '#A67C00', bg: '#FFD700' },
  SS: { main: '#E8E8E8', glow: '#C8C8C8', shadow: '#808080', bg: '#F5F5F5' },
  S: { main: '#FF6B6B', glow: '#FF5252', shadow: '#C62828', bg: '#FF8A80' },
  // ...
}
```

### フォント

- **明朝 or 筆字系**: `'Hannari','Yu Mincho','Hiragino Mincho ProN',serif`
- 商用可フォント: 源ノ明朝、衡山毛筆フォント等（ライセンス確認必要）

### セーフゾーン

- **上下**: 120px
- **左右**: 80px
- 名前が被らないように確保

### 出力サイズ

- **アプリ内**: 1024×1536
- **SNS**: 1200×630
- **ストーリーズ**: 1080×1920（今後対応）

## ベース画像の準備

### ファイル配置

```
public/
  images/
    rare-cards/
      card_base_SSS_v1.png
      card_base_SS_v1.png
      card_base_S_v1.png
      card_base_A+_v1.png
      card_base_A_v1.png
      card_base_B+_v1.png
      card_base_B_v1.png
      card_base_C_v1.png
      card_base_D_v1.png
```

### ベース画像の要件

1. **サイズ**: 1024×1536（縦）推奨
2. **セーフゾーン**: 上下120px / 左右80pxを空ける
3. **背景**: ランク別のテーマカラー
   - SSS: 純金
   - SS: 白金
   - S: 朱金
   - など
4. **装飾**: うっすら龍紋・光粒子・縁の発光を入れる（文字は入れない）

## テストページ

`/test-rare-card` でテストできます。

- 名前、ランク、スコアを入力
- リアルタイムでプレビュー
- ダウンロード・共有機能をテスト

## 今後の拡張

1. **複数サイズ対応**: 1200×630（SNS）、1080×1920（ストーリーズ）
2. **フォント最適化**: 専用フォントの追加
3. **アニメーション**: 微細なアニメーション効果
4. **パフォーマンス**: 画像の最適化とキャッシュ

