// ポイント管理システム
export interface UserProfile {
  id: string
  points: number
  omamoriCollection: Omamori[]
  loginStreak: number
  lastLoginDate: string
  totalLoginDays: number
  shareCount: number
}

export interface Omamori {
  id: string
  name: string
  rarity: 'basic' | 'lucky' | 'element' | 'special'
  imageUrl: string
  description: string
  effect: string
  price: number
  acquiredDate: string
}

export interface LoginBonus {
  dailyPoints: number
  streakBonuses: {
    3: number
    7: number
    14: number
    30: number
  }
}

// ポイントシステム設定
export const POINT_SYSTEM_CONFIG = {
  // ポイント獲得方法
  earning: {
    dailyLogin: 10,
    nameAnalysis: 1,
    shareResult: 20,
    weeklyBonus: 100,
  },
  
  // 連続ログインボーナス
  streakBonuses: {
    3: 50,
    7: 100,
    14: 200,
    30: 500,
  },
  
  // お守り価格
  omamoriPrices: {
    basic: 50,
    lucky: 200,
    element: 500,
    special: 1000,
  }
}

// お守りデータ
export const OMAMORI_DATA: Omamori[] = [
  {
    id: 'basic-1',
    name: '基本お守り',
    rarity: 'basic',
    imageUrl: '/images/omamori/basic.png',
    description: '基本的な運気向上のお守り',
    effect: '基本的な運気向上',
    price: 50,
    acquiredDate: ''
  },
  {
    id: 'lucky-1',
    name: '幸運のお守り',
    rarity: 'lucky',
    imageUrl: '/images/omamori/lucky.png',
    description: '金運・仕事運向上のお守り',
    effect: '金運・仕事運向上',
    price: 200,
    acquiredDate: ''
  },
  {
    id: 'element-1',
    name: '五行のお守り',
    rarity: 'element',
    imageUrl: '/images/omamori/element.png',
    description: '五行バランス調整のお守り',
    effect: '五行バランス調整',
    price: 500,
    acquiredDate: ''
  },
  {
    id: 'special-1',
    name: '金雨輝龍のお守り',
    rarity: 'special',
    imageUrl: '/images/omamori/special.png',
    description: '全運気大幅向上の特別なお守り',
    effect: '全運気大幅向上',
    price: 1000,
    acquiredDate: ''
  }
]

// ローカルストレージ管理
export class PointManager {
  private static STORAGE_KEY = 'mainichi-ai-user-profile'
  
  // ユーザープロファイル取得
  static getUserProfile(): UserProfile {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile()
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      return this.getDefaultProfile()
    }
    
    try {
      return JSON.parse(stored)
    } catch {
      return this.getDefaultProfile()
    }
  }
  
  // ユーザープロファイル保存
  static saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile))
  }
  
  // デフォルトプロファイル
  static getDefaultProfile(): UserProfile {
    return {
      id: this.generateUserId(),
      points: 0,
      omamoriCollection: [],
      loginStreak: 0,
      lastLoginDate: '',
      totalLoginDays: 0,
      shareCount: 0
    }
  }
  
  // ユーザーID生成
  static generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  // ポイント追加
  static addPoints(points: number): UserProfile {
    const profile = this.getUserProfile()
    profile.points += points
    this.saveUserProfile(profile)
    return profile
  }
  
  // ポイント消費
  static spendPoints(points: number): boolean {
    const profile = this.getUserProfile()
    if (profile.points < points) {
      return false
    }
    
    profile.points -= points
    this.saveUserProfile(profile)
    return true
  }
  
  // お守り購入
  static buyOmamori(omamoriId: string): boolean {
    const omamori = OMAMORI_DATA.find(o => o.id === omamoriId)
    if (!omamori) return false
    
    const profile = this.getUserProfile()
    if (profile.points < omamori.price) return false
    
    // 既に持っているかチェック
    if (profile.omamoriCollection.some(o => o.id === omamoriId)) {
      return false
    }
    
    // ポイント消費
    if (!this.spendPoints(omamori.price)) return false
    
    // お守り追加
    const newOmamori = {
      ...omamori,
      acquiredDate: new Date().toISOString()
    }
    profile.omamoriCollection.push(newOmamori)
    this.saveUserProfile(profile)
    
    return true
  }
  
  // ログインボーナス処理
  static processLoginBonus(): { profile: UserProfile; bonusPoints: number; message: string } {
    const profile = this.getUserProfile()
    const today = new Date().toDateString()
    const lastLogin = profile.lastLoginDate ? new Date(profile.lastLoginDate).toDateString() : ''
    
    let bonusPoints = 0
    let message = ''
    
    if (lastLogin !== today) {
      // 毎日ログインボーナス
      bonusPoints += POINT_SYSTEM_CONFIG.earning.dailyLogin
      
      // 連続ログインボーナス
      if (lastLogin === '') {
        // 初回ログイン
        profile.loginStreak = 1
        message = '初回ログインボーナス！10ポイント獲得！'
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toDateString()
        
        if (lastLogin === yesterdayStr) {
          // 連続ログイン
          profile.loginStreak += 1
          
          // 連続ログインボーナス
          const streakBonus = POINT_SYSTEM_CONFIG.streakBonuses[profile.loginStreak as keyof typeof POINT_SYSTEM_CONFIG.streakBonuses]
          if (streakBonus) {
            bonusPoints += streakBonus
            message = `${profile.loginStreak}日連続ログイン！${streakBonus}ポイントボーナス！`
          } else {
            message = `${profile.loginStreak}日連続ログイン！10ポイント獲得！`
          }
        } else {
          // 連続ログイン中断
          profile.loginStreak = 1
          message = 'ログインボーナス！10ポイント獲得！'
        }
      }
      
      // プロファイル更新
      profile.lastLoginDate = today
      profile.totalLoginDays += 1
      profile.points += bonusPoints
      
      this.saveUserProfile(profile)
    } else {
      message = '今日は既にログインボーナスを受け取りました'
    }
    
    return { profile, bonusPoints, message }
  }
  
  // シェアボーナス処理
  static processShareBonus(platform: string): { profile: UserProfile; bonusPoints: number } {
    const profile = this.getUserProfile()
    const bonusPoints = POINT_SYSTEM_CONFIG.earning.shareResult
    
    profile.points += bonusPoints
    profile.shareCount += 1
    
    this.saveUserProfile(profile)
    
    return { profile, bonusPoints }
  }
  
  // 姓名判断ボーナス処理
  static processAnalysisBonus(): { profile: UserProfile; bonusPoints: number } {
    const profile = this.getUserProfile()
    const bonusPoints = POINT_SYSTEM_CONFIG.earning.nameAnalysis
    
    profile.points += bonusPoints
    
    this.saveUserProfile(profile)
    
    return { profile, bonusPoints }
  }
}
