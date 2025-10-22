export interface GamificationFeature {
  id: string
  title: string
  description: string
  phase: "planning" | "development" | "testing" | "completed"
  priority: "critical" | "high" | "medium" | "low"
  estimatedHours: number
  businessValue: number // 1-10
  userEngagement: number // 1-10
  dependencies: string[]
  deliverables: string[]
  pointRewards?: {
    action: string
    points: number
    dailyLimit?: number
  }[]
}

export const gamificationRoadmap: GamificationFeature[] = [
  // Phase 1: 基本ポイントシステム
  {
    id: "login-bonus-core",
    title: "ログインボーナス基盤",
    description: "毎日ログインでポイント獲得システム",
    phase: "planning",
    priority: "high",
    estimatedHours: 20,
    businessValue: 8,
    userEngagement: 9,
    dependencies: ["error-handling", "user-authentication"],
    deliverables: ["ログイン検知システム", "連続ログイン日数管理", "ボーナスポイント計算", "ログインボーナスUI"],
    pointRewards: [
      { action: "daily_login", points: 10 },
      { action: "consecutive_7days", points: 50 },
      { action: "consecutive_30days", points: 200 },
    ],
  },

  // Phase 2: ポイント管理
  {
    id: "point-system",
    title: "ポイント管理システム",
    description: "ポイントの獲得・消費・履歴管理",
    phase: "planning",
    priority: "high",
    estimatedHours: 15,
    businessValue: 7,
    userEngagement: 8,
    dependencies: ["login-bonus-core"],
    deliverables: ["ポイント残高管理", "ポイント履歴表示", "ポイント有効期限管理", "ポイント統計ダッシュボード"],
  },

  // Phase 3: お守りショップ
  {
    id: "omamori-shop-system",
    title: "お守りショップ",
    description: "ポイントでお守り画像を購入",
    phase: "planning",
    priority: "medium",
    estimatedHours: 30,
    businessValue: 9,
    userEngagement: 10,
    dependencies: ["point-system"],
    deliverables: ["お守り画像データベース", "ショップUI/UX", "購入システム", "レア度・価格設定", "期間限定お守り"],
  },

  // Phase 4: コレクション機能
  {
    id: "collection-system",
    title: "お守りコレクション",
    description: "獲得したお守りの管理・表示",
    phase: "planning",
    priority: "medium",
    estimatedHours: 25,
    businessValue: 6,
    userEngagement: 8,
    dependencies: ["omamori-shop-system"],
    deliverables: ["コレクション図鑑", "お守り詳細表示", "お気に入り機能", "コレクション統計", "SNSシェア機能"],
  },

  // Phase 5: デイリーミッション
  {
    id: "daily-missions",
    title: "デイリーミッション",
    description: "様々な行動でポイント獲得",
    phase: "planning",
    priority: "low",
    estimatedHours: 35,
    businessValue: 8,
    userEngagement: 9,
    dependencies: ["point-system"],
    deliverables: ["ミッション管理システム", "進捗追跡", "ミッション更新機能", "特別ミッション", "達成通知"],
    pointRewards: [
      { action: "name_analysis", points: 5, dailyLimit: 50 },
      { action: "article_read", points: 3, dailyLimit: 15 },
      { action: "share_result", points: 10, dailyLimit: 30 },
      { action: "profile_complete", points: 20 },
    ],
  },

  // Phase 6: 高度なゲーミフィケーション
  {
    id: "advanced-gamification",
    title: "高度なゲーミフィケーション",
    description: "ランキング、実績、特別イベント",
    phase: "planning",
    priority: "low",
    estimatedHours: 40,
    businessValue: 7,
    userEngagement: 10,
    dependencies: ["daily-missions", "collection-system"],
    deliverables: ["ユーザーランキング", "実績システム", "季節イベント", "限定お守り", "友達招待ボーナス"],
  },
]

export const omamoriBenefits = [
  {
    category: "恋愛運",
    omamori: ["縁結び守", "恋愛成就守", "結婚守"],
    effects: ["恋愛運アップ", "出会い運向上", "結婚運強化"],
  },
  {
    category: "仕事運",
    omamori: ["出世守", "商売繁盛守", "学業守"],
    effects: ["昇進運アップ", "商売繁盛", "学習効率向上"],
  },
  {
    category: "健康運",
    omamori: ["健康守", "病気平癒守", "安産守"],
    effects: ["健康運向上", "病気回復", "安全出産"],
  },
  {
    category: "金運",
    omamori: ["金運守", "宝くじ守", "投資守"],
    effects: ["金運アップ", "宝くじ運向上", "投資成功"],
  },
  {
    category: "厄除け",
    omamori: ["厄除け守", "交通安全守", "災難除け守"],
    effects: ["厄払い", "交通安全", "災難回避"],
  },
]

export function getGamificationProgress() {
  const total = gamificationRoadmap.length
  const completed = gamificationRoadmap.filter((f) => f.phase === "completed").length
  const inDevelopment = gamificationRoadmap.filter((f) => f.phase === "development").length

  return {
    total,
    completed,
    inDevelopment,
    completionRate: Math.round((completed / total) * 100),
    totalHours: gamificationRoadmap.reduce((sum, f) => sum + f.estimatedHours, 0),
    avgEngagement: gamificationRoadmap.reduce((sum, f) => sum + f.userEngagement, 0) / total,
  }
}

export function getPointEconomyBalance() {
  const dailyEarnings = [
    { source: "ログインボーナス", points: 10 },
    { source: "姓名判断実行", points: 25 }, // 5pt × 5回
    { source: "記事閲覧", points: 15 }, // 3pt × 5記事
    { source: "結果シェア", points: 30 }, // 10pt × 3回
  ]

  const omamorPrices = [
    { rarity: "コモン", price: 50 },
    { rarity: "レア", price: 150 },
    { rarity: "スーパーレア", price: 300 },
    { rarity: "ウルトラレア", price: 500 },
  ]

  const dailyTotal = dailyEarnings.reduce((sum, item) => sum + item.points, 0)

  return {
    dailyEarnings,
    dailyTotal,
    omamorPrices,
    daysForRareOmamori: Math.ceil(150 / dailyTotal),
    daysForUltraRare: Math.ceil(500 / dailyTotal),
  }
}
