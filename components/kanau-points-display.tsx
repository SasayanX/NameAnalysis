"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Coins, 
  Gift, 
  Calendar, 
  Star, 
  Crown,
  Sparkles,
  Gem,
  Scale,
  Heart
} from "lucide-react"
import { KanauPointsManager, type KanauPointsUser, type SpecialItem } from "@/lib/kanau-points-system"
import { useAuth } from "@/components/auth/auth-provider"
import { processLoginBonusSupa, getOrCreatePointsSummary, addPointsSupa } from "@/lib/kanau-points-supabase"
import { SubscriptionManager } from "@/lib/subscription-manager"

interface KanauPointsDisplayProps {
  userId: string
  onLoginBonus?: (bonus: any) => void
}

const ITEM_ICONS = {
  amulet: <Gem className="h-4 w-4" />,
  stone: <Star className="h-4 w-4" />,
  crystal: <Sparkles className="h-4 w-4" />,
  scale: <Scale className="h-4 w-4" />,
  pearl: <Crown className="h-4 w-4" />,
  soul: <Heart className="h-4 w-4" />
}

const ITEM_COLORS = {
  amulet: "bg-green-100 text-green-800 border-green-200",
  stone: "bg-blue-100 text-blue-800 border-blue-200",
  crystal: "bg-purple-100 text-purple-800 border-purple-200",
  scale: "bg-amber-100 text-amber-800 border-amber-200",
  pearl: "bg-pink-100 text-pink-800 border-pink-200",
  soul: "bg-red-100 text-red-800 border-red-200"
}

export function KanauPointsDisplay({ userId, onLoginBonus }: KanauPointsDisplayProps) {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<KanauPointsUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [loginBonusResult, setLoginBonusResult] = useState<any>(null)

  const pointsManager = KanauPointsManager.getInstance()

  useEffect(() => {
    // データ読み込み
    const init = async () => {
      if (authUser) {
        // Supabase経由
        try {
          const summary = await getOrCreatePointsSummary(authUser.id)
          // Supabase summaryをローカル表示用型に寄せる
          const mapped: KanauPointsUser = {
            userId: authUser.id,
            points: summary.points,
            totalEarned: summary.total_earned,
            totalSpent: summary.total_spent,
            consecutiveLoginDays: summary.consecutive_login_days,
            lastLoginDate: summary.last_login_date || "",
            lastLoginBonusDate: summary.last_login_bonus_date || "",
            specialItems: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setUser(mapped)
          setIsLoading(false)
          const today = new Date().toISOString().split('T')[0]
          if ((summary.last_login_bonus_date || "") !== today) setShowLoginBonus(true)
        } catch (e) {
          console.error(e)
          setIsLoading(false)
        }
      } else {
        // ローカルマネージャ
        pointsManager.loadFromStorage()
        let userData = pointsManager.getUser(userId)
        if (!userData) {
          userData = pointsManager.initializeUser(userId)
        }
        setUser(userData)
        setIsLoading(false)
        const today = new Date().toISOString().split('T')[0]
        if (userData.lastLoginBonusDate !== today) setShowLoginBonus(true)
      }
    }
    init()
  }, [userId, authUser])

  const handleLoginBonus = async () => {
    if (authUser) {
      // 現在のプランを取得
      const manager = SubscriptionManager.getInstance()
      const currentPlan = manager.getCurrentPlan()
      const plan = currentPlan.id as "free" | "basic" | "premium"
      
      const result = await processLoginBonusSupa(authUser.id, plan)
      const mapped: KanauPointsUser = {
        userId: authUser.id,
        points: result.user.points,
        totalEarned: result.user.total_earned,
        totalSpent: result.user.total_spent,
        consecutiveLoginDays: result.user.consecutive_login_days,
        lastLoginDate: result.user.last_login_date || "",
        lastLoginBonusDate: result.user.last_login_bonus_date || "",
        specialItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setUser(mapped)
      setLoginBonusResult(result.bonus)
      setShowLoginBonus(false)
      if (onLoginBonus) onLoginBonus(result.bonus)
      return
    }

    const result = pointsManager.processLoginBonus(userId)
    setUser(result.user)
    setLoginBonusResult(result.bonus)
    setShowLoginBonus(false)
    pointsManager.saveToStorage()
    if (onLoginBonus) onLoginBonus(result.bonus)
  }

  const handleUseItem = (itemId: string) => {
    const success = pointsManager.useSpecialItem(userId, itemId)
    if (success) {
      const updatedUser = pointsManager.getUser(userId)
      if (updatedUser) {
        setUser(updatedUser)
        pointsManager.saveToStorage()
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">ユーザー情報を読み込めませんでした。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* ログインボーナスモーダル */}
      {showLoginBonus && (() => {
        // 現在のプランを取得して基礎ポイントを計算
        const manager = SubscriptionManager.getInstance()
        const currentPlan = manager.getCurrentPlan()
        const plan = currentPlan.id as "free" | "basic" | "premium"
        const basePoints = plan === "free" ? 1 : plan === "basic" ? 2 : 3
        const planNames = {
          free: "無料",
          basic: "ベーシック",
          premium: "プレミアム",
        }
        const planName = planNames[plan] || "無料"
        // 基礎Kp × 連続日数で計算（30日で上限）
        const consecutiveDays = user.consecutiveLoginDays + 1
        const effectiveConsecutiveDays = Math.min(consecutiveDays, 30)
        const totalPoints = basePoints * effectiveConsecutiveDays
        
        return (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Gift className="h-5 w-5" />
              本日のログインボーナス
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800 mb-2">
                連続{consecutiveDays}日目
              </div>
              <div className="text-sm text-yellow-600 mb-2">
                {planName}プラン特典
              </div>
              <div className="text-lg text-yellow-700">
                基礎{basePoints}Kp × {effectiveConsecutiveDays}日{consecutiveDays > 30 ? "（上限）" : ""} = 合計{totalPoints}Kp
              </div>
            </div>
            <Button 
              onClick={handleLoginBonus}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              受け取る
            </Button>
          </CardContent>
        </Card>
        )
      })()}

      {/* ログインボーナス結果表示 */}
      {loginBonusResult && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-800 mb-2">
                {loginBonusResult.message}
              </div>
              <div className="text-2xl font-bold text-green-600">
                +{loginBonusResult.totalPoints}Kp
              </div>
              {loginBonusResult.specialReward && (
                <div className="mt-2">
                  <Badge className={`${ITEM_COLORS[loginBonusResult.specialReward.type]} flex items-center gap-1 w-fit mx-auto`}>
                    {ITEM_ICONS[loginBonusResult.specialReward.type]}
                    {loginBonusResult.specialReward.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* メイン表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            カナウポイント
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ポイント表示 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {user.points.toLocaleString()}Kp
            </div>
            <div className="text-sm text-muted-foreground">
              累計獲得: {user.totalEarned.toLocaleString()}Kp | 累計消費: {user.totalSpent.toLocaleString()}Kp
            </div>
          </div>

          {/* 連続ログイン情報 */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">連続ログイン</span>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {user.consecutiveLoginDays}日
            </Badge>
          </div>

          {/* 特別アイテム */}
          {user.specialItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">所持アイテム</h4>
              <div className="grid grid-cols-2 gap-2">
                {user.specialItems
                  .filter(item => !item.isUsed)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border ${ITEM_COLORS[item.type]} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        {ITEM_ICONS[item.type]}
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                      {item.effect.type === 'score_boost' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUseItem(item.id)}
                        >
                          使用
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 次の特別報酬までの日数 */}
          <div className="text-center text-sm text-muted-foreground">
            {user.consecutiveLoginDays < 5 && (
              <p>次の特別報酬まで: {5 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 5 && user.consecutiveLoginDays < 10 && (
              <p>次の特別報酬まで: {10 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 10 && user.consecutiveLoginDays < 14 && (
              <p>次の特別報酬まで: {14 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 14 && user.consecutiveLoginDays < 21 && (
              <p>次の特別報酬まで: {21 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 21 && user.consecutiveLoginDays < 30 && (
              <p>次の特別報酬まで: {30 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 30 && user.consecutiveLoginDays < 50 && (
              <p>次の特別報酬まで: {50 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 50 && user.consecutiveLoginDays < 100 && (
              <p>次の特別報酬まで: {100 - user.consecutiveLoginDays}日</p>
            )}
            {user.consecutiveLoginDays >= 100 && (
              <p className="text-yellow-600 font-medium">最高レベルの特別報酬を獲得済み！</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* デバッグ: Kp付与（開発時のみ表示） */}
      {(process.env.NODE_ENV !== "production") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">デバッグモード: Kp付与</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {[5, 50, 500].map((amt) => (
              <Button key={amt} size="sm" variant="outline" onClick={async () => {
                try {
                  if (authUser) {
                    await addPointsSupa(authUser.id, amt, `デバッグ付与 +${amt}Kp`)
                    const summary = await getOrCreatePointsSummary(authUser.id)
                    setUser({
                      ...user,
                      points: summary.points,
                      totalEarned: summary.total_earned,
                    } as KanauPointsUser)
                  } else {
                    pointsManager.addPoints(userId, amt, `デバッグ付与 +${amt}Kp`)
                    const updated = pointsManager.getUser(userId)
                    if (updated) setUser(updated)
                    pointsManager.saveToStorage()
                  }
                } catch (e) {
                  // no-op
                }
              }}>
                +{amt}Kp 付与
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
