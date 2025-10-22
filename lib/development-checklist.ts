// lib/development-checklist.ts

// categories
const coreCategory = {
  id: "core",
  name: "⚙️ コア機能",
  description: "アプリケーションの基盤となる機能",
  color: "bg-blue-100 text-blue-800",
}

const qualityCategory = {
  id: "quality",
  name: "✅ 品質",
  description: "品質に関わる項目",
  color: "bg-green-100 text-green-800",
}

const businessCategory = {
  id: "business",
  name: "💰 ビジネス",
  description: "収益やビジネスに関わる機能",
  color: "bg-yellow-100 text-yellow-800",
}

// gamificationCategoryを追加
const gamificationCategory = {
  id: "gamification",
  name: "🎮 ゲーミフィケーション",
  description: "ユーザーエンゲージメント向上機能",
  color: "bg-purple-100 text-purple-800",
}

// categoriesに追加
export const categories = [
  coreCategory,
  qualityCategory,
  businessCategory,
  gamificationCategory, // 新規追加
]

// checklistItems
export const checklistItems = [
  {
    id: "user-authentication",
    title: "ユーザー認証",
    description: "メールアドレス、パスワードによる認証機能",
    category: "core",
    priority: "high",
    status: "done",
    estimatedHours: 16,
    actualHours: 20,
    businessValue: 5,
    userEngagement: 7,
    dependencies: [],
    deliverables: ["認証API", "ログインUI", "ログアウトUI"],
  },
  {
    id: "password-reset",
    title: "パスワードリセット機能",
    description: "パスワードを忘れたユーザーがリセットできる機能",
    category: "core",
    priority: "medium",
    status: "inProgress",
    estimatedHours: 8,
    actualHours: 6,
    businessValue: 3,
    userEngagement: 6,
    dependencies: ["user-authentication"],
    deliverables: ["パスワードリセットAPI", "パスワードリセットUI"],
  },
  {
    id: "input-validation",
    title: "入力バリデーション",
    description: "フォーム入力時のバリデーションチェック",
    category: "quality",
    priority: "high",
    status: "done",
    estimatedHours: 8,
    actualHours: 10,
    businessValue: 4,
    userEngagement: 5,
    dependencies: [],
    deliverables: ["バリデーションルール定義", "バリデーションエラーメッセージ"],
  },
  {
    id: "performance-monitoring",
    title: "パフォーマンス監視",
    description: "アプリケーションのパフォーマンスを監視する仕組み",
    category: "quality",
    priority: "medium",
    status: "inProgress",
    estimatedHours: 16,
    actualHours: 12,
    businessValue: 6,
    userEngagement: 3,
    dependencies: [],
    deliverables: ["監視ツール導入", "パフォーマンス指標設定", "アラート設定"],
  },
  {
    id: "payment-integration",
    title: "決済機能",
    description: "クレジットカード決済、銀行振込などの決済機能",
    category: "business",
    priority: "high",
    status: "todo",
    estimatedHours: 40,
    actualHours: 0,
    businessValue: 10,
    userEngagement: 8,
    dependencies: [],
    deliverables: ["決済API連携", "決済UI", "トランザクション管理"],
  },
  {
    id: "subscription-management",
    title: "サブスクリプション管理",
    description: "サブスクリプションの登録、変更、解約機能",
    category: "business",
    priority: "medium",
    status: "todo",
    estimatedHours: 32,
    actualHours: 0,
    businessValue: 8,
    userEngagement: 7,
    dependencies: ["payment-integration"],
    deliverables: ["サブスクリプションAPI", "サブスクリプションUI", "請求処理"],
  },
  {
    id: "login-bonus-system",
    title: "ログインボーナスシステム",
    description: "毎日ログインでポイント獲得、連続ログインボーナス",
    category: "gamification",
    priority: "medium",
    status: "planning",
    estimatedHours: 20,
    actualHours: 0,
    businessValue: 8,
    userEngagement: 9,
    dependencies: ["user-authentication", "point-system"],
    deliverables: ["ログイン検知システム", "連続ログイン日数管理", "ボーナスポイント計算", "ログインボーナスUI"],
  },

  {
    id: "point-system",
    title: "ポイント管理システム",
    description: "ポイントの獲得・消費・履歴管理システム",
    category: "gamification",
    priority: "high",
    status: "planning",
    estimatedHours: 15,
    actualHours: 0,
    businessValue: 7,
    userEngagement: 8,
    dependencies: [],
    deliverables: ["ポイント残高管理", "ポイント履歴表示", "ポイント有効期限管理", "ポイント統計ダッシュボード"],
  },

  {
    id: "fortune-point-rewards",
    title: "占い実行ポイント報酬",
    description: "姓名判断・数秘術・六星占術実行でポイント獲得",
    category: "gamification",
    priority: "medium",
    status: "planning",
    estimatedHours: 12,
    actualHours: 0,
    businessValue: 6,
    userEngagement: 8,
    dependencies: ["point-system"],
    deliverables: ["占い実行検知システム", "ポイント付与ロジック", "日次上限管理", "ポイント獲得通知"],
  },

  {
    id: "omamori-shop-system",
    title: "お守りショップシステム",
    description: "ポイントでお守り画像を購入できるショップ機能",
    category: "gamification",
    priority: "medium",
    status: "planning",
    estimatedHours: 30,
    actualHours: 0,
    businessValue: 9,
    userEngagement: 10,
    dependencies: ["point-system"],
    deliverables: ["お守り画像データベース", "ショップUI/UX", "購入システム", "レア度・価格設定", "期間限定お守り"],
  },

  {
    id: "omamori-collection",
    title: "お守りコレクション機能",
    description: "獲得したお守りの管理・表示・共有機能",
    category: "gamification",
    priority: "low",
    status: "planning",
    estimatedHours: 25,
    actualHours: 0,
    businessValue: 6,
    userEngagement: 8,
    dependencies: ["omamori-shop-system"],
    deliverables: ["コレクション図鑑", "お守り詳細表示", "お気に入り機能", "コレクション統計", "SNSシェア機能"],
  },

  {
    id: "daily-missions",
    title: "デイリーミッションシステム",
    description: "様々な行動でポイント獲得できるミッション機能",
    category: "gamification",
    priority: "low",
    status: "planning",
    estimatedHours: 35,
    actualHours: 0,
    businessValue: 8,
    userEngagement: 9,
    dependencies: ["point-system", "fortune-point-rewards"],
    deliverables: ["ミッション管理システム", "進捗追跡", "ミッション更新機能", "特別ミッション", "達成通知"],
  },
]

// checklistItemsをdevelopmentChecklistとしてエクスポート
export const developmentChecklist = checklistItems

// ChecklistItem型を定義
export type ChecklistItem = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  estimatedHours: number
  actualHours: number
  businessValue: number
  userEngagement: number
  dependencies: string[]
  deliverables: string[]
}

export function getChecklistByStatus(status: ChecklistItem["status"]) {
  return developmentChecklist.filter((item) => item.status === status)
}

export function getChecklistByCategory(category: ChecklistItem["category"]) {
  return developmentChecklist.filter((item) => item.category === category)
}

export function getProgressStats() {
  const total = developmentChecklist.length
  const completed = getChecklistByStatus("done").length
  const inProgress = getChecklistByStatus("inProgress").length
  const planned = getChecklistByStatus("planning").length
  const blocked = getChecklistByStatus("blocked").length

  return {
    total,
    completed,
    inProgress,
    planned,
    blocked,
    completionRate: Math.round((completed / total) * 100),
  }
}

export function getTotalEstimatedHours() {
  return developmentChecklist.reduce((sum, item) => sum + item.estimatedHours, 0)
}

export function getTotalActualHours() {
  return developmentChecklist.reduce((sum, item) => sum + (item.actualHours || 0), 0)
}
