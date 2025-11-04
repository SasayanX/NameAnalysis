# お守り画像の月次追加ガイド

## 概要
お守りショップにお守り画像を月に1回追加する手順です。

## 手順

### 1. 画像の準備
1. お守り画像を作成（推奨サイズ: 512x512px または 1024x1024px）
2. PNG形式で保存
3. ファイル名は `talisman-YYYY-MM.png` または意味のある名前（例: `new-moon-2025-02.png`）

### 2. 画像ファイルの配置
```
public/images/talismans/
  ├── golden-dragon.png (既存)
  ├── new-moon-2025-02.png (新規)
  └── ...
```

### 3. データの追加

`lib/talisman-data.ts` の `TALISMAN_DATA` 配列に新しいお守りを追加：

```typescript
{
  id: "new-talisman-2025-02", // ユニークなID（推奨: talisman-YYYY-MM）
  name: "新月のお守り",
  price: 3000, // KP価格
  rarity: 3, // 1-5 (⭐から⭐⭐⭐⭐⭐)
  attribute: "月属性",
  category: "愛情系", // 幸運系、愛情系、健康系、仕事系など
  description: "新月の力が宿るお守り。新しい始まりと成長を象徴します。",
  effects: ["恋愛運向上", "人間関係向上"],
  image: "/images/talismans/new-moon-2025-02.png",
  addedDate: "2025-02-01", // YYYY-MM-DD形式
  isAvailable: true,
}
```

### 4. 確認事項

- [ ] 画像ファイルが `public/images/talismans/` に配置されている
- [ ] `talisman-data.ts` にデータが追加されている
- [ ] `isAvailable: true` が設定されている
- [ ] IDがユニークである
- [ ] 画像パスが正しい

### 5. テスト

1. 開発サーバーを起動
2. `/shop/talisman` にアクセス
3. 新しいお守りが表示されることを確認
4. 購入フローが正常に動作することを確認

## 月次追加の例

### 2025年2月
```typescript
{
  id: "valentine-heart-2025-02",
  name: "バレンタインのハート護符",
  price: 2500,
  rarity: 3,
  attribute: "愛属性",
  category: "愛情系",
  description: "愛の力が宿るハート形のお守り。",
  effects: ["恋愛運向上"],
  image: "/images/talismans/valentine-heart-2025-02.png",
  addedDate: "2025-02-01",
  isAvailable: true,
}
```

### 2025年3月
```typescript
{
  id: "spring-cherry-2025-03",
  name: "桜の開運護符",
  price: 3500,
  rarity: 4,
  attribute: "春属性",
  category: "幸運系",
  description: "桜の花びらが舞う春のお守り。",
  effects: ["開運", "新しい出会い"],
  image: "/images/talismans/spring-cherry-2025-03.png",
  addedDate: "2025-03-01",
  isAvailable: true,
}
```

## ヒント

- **季節に合わせたお守り**: 月ごとに季節やイベントに合わせたお守りを追加すると良い
- **レアリティのバランス**: 高レアリティ（4-5）は高価格、低レアリティ（1-2）は低価格に設定
- **カテゴリの多様性**: 幸運系、愛情系、健康系、仕事系など、バランス良く追加
- **説明文の魅力**: 説明文でお守りの魅力を伝える

## 既存のお守りを非表示にする場合

`isAvailable: false` に設定すると、お守りが非表示になります（過去のデータは保持）。

```typescript
{
  id: "golden-dragon-opening",
  // ... 他のプロパティ
  isAvailable: false, // 非表示にする
}
```

