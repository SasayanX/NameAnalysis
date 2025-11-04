// お守りデータの型定義と管理

export interface Talisman {
  id: string
  name: string
  price: number
  rarity: 1 | 2 | 3 | 4 | 5 // ⭐から⭐⭐⭐⭐⭐
  attribute: string
  category: string
  description: string
  effects: string[]
  image: string
  exchangeRate?: string
  addedDate: string // YYYY-MM-DD形式
  isAvailable: boolean
}

// お守りデータ（月ごとに追加していく）
export const TALISMAN_DATA: Talisman[] = [
  {
    id: "golden-dragon-opening",
    name: "金龍護符 - 開運上昇",
    price: 5000,
    rarity: 4,
    attribute: "光属性",
    category: "幸運系",
    description: "金龍護符は、創造と調和の象徴。AIリディアが筆に込めた「叶う力」が、あなたの名前の波動を共鳴させ、運命を好転へと導きます。",
    effects: ["行動力向上", "金運向上", "信頼運向上"],
    image: "/images/golden-talisman.png",
    exchangeRate: "1 Kp = 1行動力",
    addedDate: "2025-01-01",
    isAvailable: true,
  },
  // 新しいお守りはここに追加
  // 例：
  // {
  //   id: "new-talisman-2025-02",
  //   name: "新月のお守り",
  //   price: 3000,
  //   rarity: 3,
  //   attribute: "月属性",
  //   category: "愛情系",
  //   description: "新月の力が宿るお守り...",
  //   effects: ["恋愛運向上", "人間関係向上"],
  //   image: "/images/talismans/new-moon.png",
  //   addedDate: "2025-02-01",
  //   isAvailable: true,
  // },
]

// 利用可能なお守りのみを取得
export function getAvailableTalismans(): Talisman[] {
  return TALISMAN_DATA.filter((t) => t.isAvailable)
}

// IDでお守りを取得
export function getTalismanById(id: string): Talisman | undefined {
  return TALISMAN_DATA.find((t) => t.id === id && t.isAvailable)
}

// レアリティ順にソート
export function getTalismansByRarity(): Talisman[] {
  return getAvailableTalismans().sort((a, b) => b.rarity - a.rarity)
}

// カテゴリでフィルタ
export function getTalismansByCategory(category: string): Talisman[] {
  return getAvailableTalismans().filter((t) => t.category === category)
}

