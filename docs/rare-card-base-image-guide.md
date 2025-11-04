# レアカード ベース画像ガイド

## 概要

レアカード画像生成では、ベース画像を指定して、その上に名前テキストとエフェクトを合成する方式に対応しています。

## 使用方法

### 1. ベース画像の準備

ベース画像を `public/images/rare-cards/` ディレクトリに配置してください。

**推奨仕様**:
- サイズ: 1200×1800px（縦向き）
- 形式: PNGまたはJPG
- 命名規則: `base-{rank}.png`（例: `base-SSS.png`, `base-SS.png`）

### 2. API呼び出し

`baseImagePath` パラメータを追加してAPIを呼び出します：

```
GET /api/rare-card/generate?lastName=大谷&firstName=翔平&rank=SSS&totalPoints=480&powerLevel=10&baseImagePath=images/rare-cards/base-SSS.png
```

### 3. テキスト配置の指定

名前テキストは以下の位置に配置されます：
- **横位置**: 中央（width / 2）
- **縦位置**: 550px（SSS）または 500px（その他）
- **フォント**: ランクに応じたフォントファミリー
- **サイズ**: 180px（SSS）または 140px（その他）
- **文字間隔**: 220px（SSS）または 180px（その他）

### 4. エフェクトの適用

- **SSSランク**: 多段影、後光エフェクト、強力な発光
- **その他ランク**: 基本的な発光エフェクト

## 画像配置例

```
public/
  images/
    rare-cards/
      base-SSS.png    # 天下無双用ベース画像
      base-SS.png     # 無敵用ベース画像
      base-S.png      # 最強用ベース画像
      base-A+.png     # 一流+用ベース画像
      base-A.png      # 優秀用ベース画像
      base-B+.png     # 良好用ベース画像
      base-B.png      # 普通用ベース画像
      base-C.png      # 平凡用ベース画像
      base-D.png      # 苦労用ベース画像
```

## カスタマイズ

### テキスト位置の調整

ベース画像のデザインに合わせて、テキスト位置を調整したい場合は、`lib/rare-card-generator.ts` の `generateRareCardWithBaseImage` 関数内の以下の値を変更してください：

```typescript
const nameStartX = width / 2  // 横位置（中央）
const nameStartY = rank === 'SSS' ? 550 : 500  // 縦位置
const charSize = rank === 'SSS' ? 180 : 140  // フォントサイズ
const charSpacing = rank === 'SSS' ? 220 : 180  // 文字間隔
```

### フォントの指定

`RANK_DESIGNS` オブジェクト内の `fontFamily` を変更することで、フォントをカスタマイズできます。

## ベース画像なしの場合

`baseImagePath` パラメータを指定しない場合、従来通り自動生成された背景が使用されます。

