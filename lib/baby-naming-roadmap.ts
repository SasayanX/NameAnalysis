export interface BabyNamingFeature {
  id: string
  title: string
  description: string
  phase: "planning" | "development" | "testing" | "completed"
  priority: "critical" | "high" | "medium" | "low"
  estimatedHours: number
  businessValue: number // 1-10
  technicalComplexity: number // 1-10
  dependencies: string[]
  deliverables: string[]
}

export const babyNamingRoadmap: BabyNamingFeature[] = [
  // Phase 1: 基盤機能
  {
    id: "naming-core-engine",
    title: "命名エンジン基盤",
    description: "苗字に最適な名前を生成するコアアルゴリズム",
    phase: "planning",
    priority: "critical",
    estimatedHours: 45,
    businessValue: 10,
    technicalComplexity: 8,
    dependencies: ["error-handling", "stroke-data-optimization"],
    deliverables: ["最適画数パターン計算", "五行バランス分析", "音韻調和チェック", "名前候補生成アルゴリズム"],
  },

  // Phase 2: ユーザーインターフェース
  {
    id: "naming-wizard-ui",
    title: "名付けウィザード",
    description: "段階的に条件を設定できる直感的なUI",
    phase: "planning",
    priority: "high",
    estimatedHours: 25,
    businessValue: 9,
    technicalComplexity: 6,
    dependencies: ["naming-core-engine"],
    deliverables: ["苗字入力フォーム", "性別・条件選択UI", "リアルタイム候補表示", "候補名前詳細表示"],
  },

  // Phase 3: 高度な条件設定
  {
    id: "advanced-naming-conditions",
    title: "高度な名付け条件",
    description: "詳細な条件指定による精密な名前生成",
    phase: "planning",
    priority: "medium",
    estimatedHours: 30,
    businessValue: 8,
    technicalComplexity: 7,
    dependencies: ["naming-wizard-ui"],
    deliverables: [
      "避けたい漢字指定",
      "好みの意味・イメージ選択",
      "読み方パターン指定",
      "画数範囲指定",
      "季節・干支考慮",
    ],
  },

  // Phase 4: データベース強化
  {
    id: "comprehensive-name-database",
    title: "包括的名前データベース",
    description: "豊富な人名用漢字と読み方データベース",
    phase: "planning",
    priority: "medium",
    estimatedHours: 35,
    businessValue: 7,
    technicalComplexity: 5,
    dependencies: ["naming-core-engine"],
    deliverables: [
      "人名用漢字2000字以上",
      "読み方バリエーション",
      "漢字の意味・イメージ",
      "使用頻度統計",
      "トレンド分析",
    ],
  },

  // Phase 5: プレミアム機能
  {
    id: "premium-naming-features",
    title: "プレミアム名付け機能",
    description: "高度な分析とカスタマイズ機能",
    phase: "planning",
    priority: "low",
    estimatedHours: 40,
    businessValue: 9,
    technicalComplexity: 8,
    dependencies: ["advanced-naming-conditions", "comprehensive-name-database"],
    deliverables: [
      "AI推奨名前生成",
      "家族名前との相性分析",
      "将来運勢シミュレーション",
      "名前の社会的印象分析",
      "PDF命名書作成",
    ],
  },
]

export function getBabyNamingProgress() {
  const total = babyNamingRoadmap.length
  const completed = babyNamingRoadmap.filter((f) => f.phase === "completed").length
  const inDevelopment = babyNamingRoadmap.filter((f) => f.phase === "development").length

  return {
    total,
    completed,
    inDevelopment,
    completionRate: Math.round((completed / total) * 100),
    totalHours: babyNamingRoadmap.reduce((sum, f) => sum + f.estimatedHours, 0),
    businessValue: babyNamingRoadmap.reduce((sum, f) => sum + f.businessValue, 0) / total,
  }
}

export function getHighPriorityFeatures() {
  return babyNamingRoadmap
    .filter((f) => f.priority === "critical" || f.priority === "high")
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
}
