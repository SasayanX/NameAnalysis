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
    id: "golden-dragon-nozomi-miko",
    name: "金龍護符 - 巫女ノゾミ",
    price: 5000,
    rarity: 4,
    attribute: "光属性",
    category: "幸運系",
    description:
      "この御守は、巫女姿の金雨希味をあしらっており「行動力と金運」の向上に効果があると伝えられています。\n持つ者の“叶う力”を高める象徴です。\n※参考文献：民明書房刊『叶龍伝』",
    effects: ["行動力大幅向上", "金運向上", "信頼運向上", "守護力向上"],
    image: "/images/kanau-nozomi-miko-golden-dragon.png",
    exchangeRate: "1 Kp = 叶力1.2倍",
    addedDate: "2025-02-01",
    isAvailable: true,
  },
  {
    id: "golden-dragon-opening",
    name: "金龍護符 - 和装ノゾミ",
    price: 10000,
    rarity: 5,
    attribute: "光属性",
    category: "幸運系",
    description:
      "この御守は、和服姿の金雨希味をあしらっており「霊力覚醒と守護力」の向上に効果があると伝えられています。\n持つ者の“叶う力”を高める象徴です。\n※参考文献：民明書房刊『叶龍伝』",
    effects: ["行動力極大向上", "金運向上", "信頼運向上", "守護力向上", "霊力覚醒"],
    image: "/images/golden-talisman.png",
    exchangeRate: "1 Kp = 叶力1.5倍",
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

