// カナウポイントシステム - 基盤実装
export interface KanauPointsUser {
  userId: string
  points: number
  totalEarned: number
  totalSpent: number
  lastLoginDate: string
  consecutiveLoginDays: number
  lastLoginBonusDate: string
  specialItems: SpecialItem[]
  createdAt: string
  updatedAt: string
}

export interface SpecialItem {
  id: string
  name: string
  type: 'amulet' | 'stone' | 'crystal' | 'scale' | 'pearl' | 'soul'
  effect: {
    type: 'score_boost' | 'seasonal_bonus'
    value: number
    description: string
  }
  obtainedAt: string
  usedAt?: string
  isUsed: boolean
}

export interface PointsTransaction {
  id: string
  userId: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  category: 'login_bonus' | 'ranking_reward' | 'ranking_entry' | 'special_reward' | 'purchase'
  metadata?: Record<string, any>
  timestamp: string
}

export interface LoginBonusConfig {
  basePoints: number
  consecutiveBonus: (days: number) => number
  specialRewards: {
    [key: number]: {
      item: Omit<SpecialItem, 'id' | 'obtainedAt' | 'usedAt' | 'isUsed'>
      message: string
    }
  }
}

// ログインボーナス設定
export const LOGIN_BONUS_CONFIG: LoginBonusConfig = {
  basePoints: 1,
  consecutiveBonus: (days: number) => Math.min(days - 1, 100), // 最大100日分のボーナス
  specialRewards: {
    5: {
      item: {
        name: '小吉の護符',
        type: 'amulet',
        effect: {
          type: 'score_boost',
          value: 5,
          description: '姓名判断スコア+5点（1回限り）'
        }
      },
      message: '5日連続ログイン達成！小吉の護符を獲得しました。'
    },
    10: {
      item: {
        name: '中吉の護符',
        type: 'amulet',
        effect: {
          type: 'score_boost',
          value: 10,
          description: '姓名判断スコア+10点（1回限り）'
        }
      },
      message: '10日連続ログイン達成！中吉の護符を獲得しました。'
    },
    14: {
      item: {
        name: '大吉の護符',
        type: 'amulet',
        effect: {
          type: 'score_boost',
          value: 15,
          description: '姓名判断スコア+15点（1回限り）'
        }
      },
      message: '14日連続ログイン達成！大吉の護符を獲得しました。'
    },
    21: {
      item: {
        name: '運命の石',
        type: 'stone',
        effect: {
          type: 'seasonal_bonus',
          value: 5,
          description: 'ランキング参加時の季節ボーナス+5%'
        }
      },
      message: '21日連続ログイン達成！運命の石を獲得しました。'
    },
    30: {
      item: {
        name: '龍の鱗片',
        type: 'scale',
        effect: {
          type: 'seasonal_bonus',
          value: 10,
          description: 'ランキング参加時の季節ボーナス+10%'
        }
      },
      message: '30日連続ログイン達成！龍の鱗片を獲得しました。'
    },
    50: {
      item: {
        name: '叶の宝珠',
        type: 'pearl',
        effect: {
          type: 'seasonal_bonus',
          value: 15,
          description: 'ランキング参加時の季節ボーナス+15%'
        }
      },
      message: '50日連続ログイン達成！叶の宝珠を獲得しました。'
    },
    100: {
      item: {
        name: '名魂の結晶',
        type: 'soul',
        effect: {
          type: 'seasonal_bonus',
          value: 20,
          description: 'ランキング参加時の季節ボーナス+20%'
        }
      },
      message: '100日連続ログイン達成！名魂の結晶を獲得しました。'
    }
  }
}

export class KanauPointsManager {
  private static instance: KanauPointsManager
  private users: Map<string, KanauPointsUser> = new Map()
  private transactions: PointsTransaction[] = []

  static getInstance(): KanauPointsManager {
    if (!KanauPointsManager.instance) {
      KanauPointsManager.instance = new KanauPointsManager()
    }
    return KanauPointsManager.instance
  }

  // ユーザー初期化
  initializeUser(userId: string): KanauPointsUser {
    const now = new Date().toISOString()
    const user: KanauPointsUser = {
      userId,
      points: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastLoginDate: now,
      consecutiveLoginDays: 0,
      lastLoginBonusDate: '',
      specialItems: [],
      createdAt: now,
      updatedAt: now
    }
    this.users.set(userId, user)
    return user
  }

  // ユーザー取得
  getUser(userId: string): KanauPointsUser | null {
    return this.users.get(userId) || null
  }

  // ログインボーナス処理
  processLoginBonus(userId: string): {
    user: KanauPointsUser
    bonus: {
      basePoints: number
      consecutiveBonus: number
      totalPoints: number
      specialReward?: SpecialItem
      message: string
    }
  } {
    let user = this.getUser(userId)
    if (!user) {
      user = this.initializeUser(userId)
    }

    const today = new Date().toISOString().split('T')[0]
    const lastLoginDate = user.lastLoginDate.split('T')[0]
    
    // 連続ログイン日数の計算
    let consecutiveDays = user.consecutiveLoginDays
    if (lastLoginDate === today) {
      // 今日既にログインボーナスを受け取っている場合
      return {
        user,
        bonus: {
          basePoints: 0,
          consecutiveBonus: 0,
          totalPoints: 0,
          message: '本日は既にログインボーナスを受け取っています。'
        }
      }
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastLoginDate === yesterdayStr) {
      // 連続ログイン継続
      consecutiveDays += 1
    } else if (lastLoginDate < yesterdayStr) {
      // 連続ログインが途切れた場合
      consecutiveDays = 1
    } else {
      // 初回ログイン
      consecutiveDays = 1
    }

    // ボーナス計算
    const basePoints = LOGIN_BONUS_CONFIG.basePoints
    const consecutiveBonus = LOGIN_BONUS_CONFIG.consecutiveBonus(consecutiveDays)
    const totalPoints = basePoints + consecutiveBonus

    // 特別報酬チェック
    let specialReward: SpecialItem | undefined
    let message = `連続${consecutiveDays}日目のログインボーナス！基本${basePoints}Kp + 連続ボーナス${consecutiveBonus}Kp = 合計${totalPoints}Kp`

    if (LOGIN_BONUS_CONFIG.specialRewards[consecutiveDays]) {
      const rewardConfig = LOGIN_BONUS_CONFIG.specialRewards[consecutiveDays]
      specialReward = {
        id: `item_${userId}_${Date.now()}`,
        ...rewardConfig.item,
        obtainedAt: new Date().toISOString(),
        isUsed: false
      }
      user.specialItems.push(specialReward)
      message = rewardConfig.message
    }

    // ユーザー情報更新
    user.points += totalPoints
    user.totalEarned += totalPoints
    user.consecutiveLoginDays = consecutiveDays
    user.lastLoginDate = new Date().toISOString()
    user.lastLoginBonusDate = today
    user.updatedAt = new Date().toISOString()

    // トランザクション記録
    this.addTransaction(userId, 'earn', totalPoints, 'ログインボーナス', 'login_bonus', {
      consecutiveDays,
      basePoints,
      consecutiveBonus,
      specialReward: specialReward?.name
    })

    this.users.set(userId, user)

    return {
      user,
      bonus: {
        basePoints,
        consecutiveBonus,
        totalPoints,
        specialReward,
        message
      }
    }
  }

  // ポイント消費
  spendPoints(userId: string, amount: number, reason: string, category: PointsTransaction['category'] = 'purchase'): boolean {
    const user = this.getUser(userId)
    if (!user || user.points < amount) {
      return false
    }

    user.points -= amount
    user.totalSpent += amount
    user.updatedAt = new Date().toISOString()

    this.addTransaction(userId, 'spend', amount, reason, category)
    this.users.set(userId, user)

    return true
  }

  // ポイント付与
  addPoints(userId: string, amount: number, reason: string, category: PointsTransaction['category'] = 'special_reward'): boolean {
    const user = this.getUser(userId)
    if (!user) {
      return false
    }

    user.points += amount
    user.totalEarned += amount
    user.updatedAt = new Date().toISOString()

    this.addTransaction(userId, 'earn', amount, reason, category)
    this.users.set(userId, user)

    return true
  }

  // トランザクション追加
  private addTransaction(
    userId: string,
    type: 'earn' | 'spend',
    amount: number,
    reason: string,
    category: PointsTransaction['category'],
    metadata?: Record<string, any>
  ): void {
    const transaction: PointsTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      amount,
      reason,
      category,
      metadata,
      timestamp: new Date().toISOString()
    }
    this.transactions.push(transaction)
  }

  // トランザクション履歴取得
  getTransactionHistory(userId: string, limit: number = 50): PointsTransaction[] {
    return this.transactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  // 特別アイテム使用
  useSpecialItem(userId: string, itemId: string): boolean {
    const user = this.getUser(userId)
    if (!user) return false

    const item = user.specialItems.find(i => i.id === itemId && !i.isUsed)
    if (!item) return false

    item.isUsed = true
    item.usedAt = new Date().toISOString()
    user.updatedAt = new Date().toISOString()

    this.users.set(userId, user)
    return true
  }

  // 季節ボーナス計算（ランキング参加時）
  calculateSeasonalBonus(userId: string, baseBonus: number): number {
    const user = this.getUser(userId)
    if (!user) return baseBonus

    let totalBonus = baseBonus
    const activeItems = user.specialItems.filter(item => 
      !item.isUsed && item.effect.type === 'seasonal_bonus'
    )

    for (const item of activeItems) {
      totalBonus += item.effect.value
    }

    return Math.min(totalBonus, 50) // 最大50%まで
  }

  // 姓名判断スコアボーナス計算
  calculateScoreBonus(userId: string, baseScore: number): number {
    const user = this.getUser(userId)
    if (!user) return baseScore

    let totalBonus = 0
    const activeItems = user.specialItems.filter(item => 
      !item.isUsed && item.effect.type === 'score_boost'
    )

    for (const item of activeItems) {
      totalBonus += item.effect.value
    }

    return baseScore + totalBonus
  }

  // データ永続化（実際の実装ではFirebase等に保存）
  saveToStorage(): void {
    // ローカルストレージに保存（開発用）
    if (typeof window !== 'undefined') {
      localStorage.setItem('kanau_points_users', JSON.stringify(Array.from(this.users.entries())))
      localStorage.setItem('kanau_points_transactions', JSON.stringify(this.transactions))
    }
  }

  // データ読み込み
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const usersData = localStorage.getItem('kanau_points_users')
      const transactionsData = localStorage.getItem('kanau_points_transactions')

      if (usersData) {
        this.users = new Map(JSON.parse(usersData))
      }
      if (transactionsData) {
        this.transactions = JSON.parse(transactionsData)
      }
    }
  }
}
