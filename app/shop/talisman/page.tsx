"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Coins, 
  Gift, 
  Star,
  Sparkles,
  Share2,
  Crown,
  PenTool,
  Zap,
  CircleDollarSign
} from "lucide-react"
import { KanauPointsManager, type KanauPointsUser } from "@/lib/kanau-points-system"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrCreatePointsSummary, addPointsSupa, spendPointsSupa } from "@/lib/kanau-points-supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAvailableTalismans, type Talisman } from "@/lib/talisman-data"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { GooglePlayBillingDetector } from "@/lib/google-play-billing-detector"
import { getGooglePlayProductId } from "@/lib/google-play-product-ids"
import Link from "next/link"

// 巫女 金雨 希実のメッセージ
const RYDIA_MESSAGES = {
  purchaseSuccess: [
    "あなたの名に、今…金龍の力が宿りました✨",
    "この護符が、あなたの運命を好転へと導きます",
    "開運の波が、あなたの周りに広がっていくでしょう",
  ],
  insufficientPoints: "残念ながら、Kpが不足しています。ログインボーナスや毎日の行動でKpを獲得できます。",
  specialReward: "おめでとうございます！特別な護符（季節限定）を授かりました🎁"
}

export default function TalismanShopPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<KanauPointsUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPurchaseEffect, setShowPurchaseEffect] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<string>("")
  const [showShareBonus, setShowShareBonus] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [hasSharedToday, setHasSharedToday] = useState(false)
  const [hasAcquiredTalisman, setHasAcquiredTalisman] = useState(false)
  const [isGooglePlayAvailable, setIsGooglePlayAvailable] = useState(false)
  const [isInitializingGooglePlay, setIsInitializingGooglePlay] = useState(false)
  
  // 利用可能なお守り一覧（初回計算のみ）
  const availableTalismans = useMemo(() => getAvailableTalismans(), [])
  
  // KP購入のお守りと円購入のアイテムに分ける
  const kpTalismans = useMemo(() => availableTalismans.filter(t => !t.purchaseType || t.purchaseType === "kp"), [availableTalismans])
  const yenItems = useMemo(() => availableTalismans.filter(t => t.purchaseType === "yen"), [availableTalismans])
  
  // URLパラメータから初期タブを取得
  const getInitialTab = (): "kp" | "yen" => {
    if (typeof window === "undefined") return "kp"
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    return tab === "yen" ? "yen" : "kp"
  }

  const [activeTab, setActiveTab] = useState<"kp" | "yen">(getInitialTab())
  const [selectedTalismanId, setSelectedTalismanId] = useState<string | null>(() => kpTalismans[0]?.id ?? null)
  const [selectedYenItemId, setSelectedYenItemId] = useState<string | null>(() => yenItems[0]?.id ?? null)
  
  // URLパラメータが変更されたときにタブを更新
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab === "yen" && activeTab !== "yen") {
      setActiveTab("yen")
      setSelectedYenItemId(yenItems[0]?.id ?? null)
    } else if (tab === "kp" && activeTab !== "kp") {
      setActiveTab("kp")
      setSelectedTalismanId(kpTalismans[0]?.id ?? null)
    }
  }, [activeTab, kpTalismans, yenItems])
  
  const currentTalisman = useMemo(() => {
    if (activeTab === "kp") {
      if (kpTalismans.length === 0) return null
      if (!selectedTalismanId) return kpTalismans[0]
      return kpTalismans.find((t) => t.id === selectedTalismanId) || kpTalismans[0]
    } else {
      if (yenItems.length === 0) return null
      if (!selectedYenItemId) return yenItems[0]
      return yenItems.find((t) => t.id === selectedYenItemId) || yenItems[0]
    }
  }, [activeTab, kpTalismans, yenItems, selectedTalismanId, selectedYenItemId])

  useEffect(() => {
    setImageError(false)
  }, [currentTalisman?.id])

  useEffect(() => {
    const init = async () => {
      if (authUser) {
        try {
          const summary = await getOrCreatePointsSummary(authUser.id)
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
          
          // 今日すでにシェアボーナスを獲得しているかチェック
          const { hasEarnedPointsToday } = await import("@/lib/kanau-points-supabase")
          const shared = await hasEarnedPointsToday(authUser.id, "お守りショップSNS共有ボーナス")
          setHasSharedToday(shared)
        } catch (e) {
          console.error("Failed to load user points:", e)
        } finally {
          setIsLoading(false)
        }
      } else {
        // ゲストモード（ローカルストレージ）
        const pointsManager = KanauPointsManager.getInstance()
        pointsManager.loadFromStorage()
        const userId = "demo_user_001"
        let userData = pointsManager.getUser(userId)
        if (!userData) {
          userData = pointsManager.initializeUser(userId)
        }
        setUser(userData)
        
        // 今日すでにシェアボーナスを獲得しているかチェック
        const today = new Date().toDateString()
        const lastShareDate = localStorage.getItem("talisman_share_date")
        setHasSharedToday(lastShareDate === today)
        
        setIsLoading(false)
      }
    }
    init()
  }, [authUser])

  // Google Play Billingの初期化
  useEffect(() => {
    const initGooglePlay = async () => {
      if (GooglePlayBillingDetector.isTWAEnvironment()) {
        setIsInitializingGooglePlay(true)
        try {
          const available = await GooglePlayBillingDetector.initialize()
          setIsGooglePlayAvailable(available)
        } catch (error) {
          console.warn('[Talisman Shop] Google Play Billing initialization failed:', error)
          setIsGooglePlayAvailable(false)
        } finally {
          setIsInitializingGooglePlay(false)
        }
      }
    }
    initGooglePlay()
  }, [])

  // 購入完了後の処理（URLパラメータから検知）
  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const purchase = params.get("purchase")
    const userId = params.get("userId")
    const plan = params.get("plan")

    if (purchase === "dragon-breath" && userId && plan && authUser?.id === userId) {
      // 購入確認APIを呼び出し
      const verifyPurchase = async () => {
        try {
          let paymentLinkId = params.get("paymentLinkId")
          if (!paymentLinkId || paymentLinkId === "{PAYMENT_LINK_ID}") {
            paymentLinkId = localStorage.getItem("dragon_breath_payment_link_id")
          }

          if (!paymentLinkId || paymentLinkId === "{PAYMENT_LINK_ID}") {
            setPurchaseMessage("購入処理を確認中です。しばらくお待ちください...")
            setTimeout(() => {
              setPurchaseMessage("")
              window.history.replaceState({}, "", window.location.pathname)
            }, 5000)
            return
          }

          const response = await fetch("/api/dragon-breath/verify-purchase", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentLinkId,
              userId,
            }),
          })

          const result = await response.json()

          if (result.success) {
            setPurchaseMessage("購入が完了しました！龍の息吹が付与されました。")
            setShowPurchaseEffect(true)
            localStorage.removeItem("dragon_breath_payment_link_id")
            setTimeout(() => {
              setShowPurchaseEffect(false)
              setPurchaseMessage("")
              window.history.replaceState({}, "", window.location.pathname)
            }, 5000)
          } else {
            setPurchaseMessage(result.error || "購入確認に失敗しました。しばらく時間をおいてから再度お試しください。")
          }
        } catch (error) {
          console.error("購入確認エラー:", error)
          setPurchaseMessage("購入確認中にエラーが発生しました")
        }
      }

      verifyPurchase()
    }
  }, [authUser])

  const handlePurchase = async () => {
    if (!currentTalisman) {
      setPurchaseMessage("お守りが選択されていません")
      return
    }

    // 円購入の場合は別の処理
    if (currentTalisman.purchaseType === "yen") {
      if (!authUser) {
        setPurchaseMessage("ログインが必要です")
        return
      }

      setIsPurchasing(true)

      try {
        // 現在のプランを取得
        const subscriptionManager = SubscriptionManager.getInstance()
        const subscriptionInfo = subscriptionManager.getSubscriptionInfo()
        const currentPlan = subscriptionInfo.plan || "free"

        // Google Play Billingが利用可能な場合は、Google Play Billingを使用
        if (isGooglePlayAvailable && GooglePlayBillingDetector.isTWAEnvironment()) {
          try {
            const productId = getGooglePlayProductId('dragonBreath')
            const purchase = await GooglePlayBillingDetector.purchase(productId)

            // 購入確認APIを呼び出し
            const response = await fetch("/api/dragon-breath/purchase-google-play", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: authUser.id,
                plan: currentPlan,
                purchaseToken: purchase.purchaseToken,
                productId: purchase.itemId || productId,
              }),
            })

            const result = await response.json()

            if (!result.success) {
              setPurchaseMessage(result.error || "購入処理中にエラーが発生しました")
              return
            }

            setPurchaseMessage("購入が完了しました！龍の息吹が付与されました。")
            setShowPurchaseEffect(true)
            setTimeout(() => {
              setShowPurchaseEffect(false)
              setPurchaseMessage("")
            }, 5000)
          } catch (error: any) {
            console.error("Google Play Billing purchase failed:", error)
            setPurchaseMessage(error.message || "Google Play Billingでの購入に失敗しました")
          } finally {
            setIsPurchasing(false)
          }
          return
        }

        // Square決済を使用（Web版またはGoogle Play Billingが利用できない場合）
        // メールアドレスを取得
        const customerEmail = localStorage.getItem("customerEmail") || authUser.email
        if (!customerEmail) {
          setPurchaseMessage("メールアドレスが必要です")
          return
        }

        // 円購入APIを呼び出し
        const response = await fetch("/api/dragon-breath/purchase-yen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: authUser.id,
            plan: currentPlan,
            customerEmail,
          }),
        })

        const result = await response.json()

        console.log('龍の息吹購入レスポンス:', result)

        if (!result.success) {
          const errorMessage = result.error || "購入処理中にエラーが発生しました"
          const detailsMessage = result.details ? `\n詳細: ${JSON.stringify(result.details)}` : ""
          setPurchaseMessage(errorMessage + detailsMessage)
          console.error('龍の息吹購入エラー:', result)
          return
        }

        // Payment Link IDをlocalStorageに保存（リダイレクト後の確認用）
        if (result.paymentLinkId) {
          localStorage.setItem("dragon_breath_payment_link_id", result.paymentLinkId)
        }

        // Payment Linkにリダイレクト
        if (result.paymentLinkUrl) {
          window.location.href = result.paymentLinkUrl
        }
      } catch (error) {
        console.error("Purchase failed:", error)
        setPurchaseMessage("購入処理中にエラーが発生しました")
      } finally {
        setIsPurchasing(false)
      }
      return
    }

    // KP購入の処理
    if (!user || user.points < currentTalisman.price) {
      setPurchaseMessage(RYDIA_MESSAGES.insufficientPoints)
      return
    }

    setIsPurchasing(true)

    try {
      if (authUser) {
        // API経由で購入（ポイント消費 + お守り保存）
        const response = await fetch("/api/talisman/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            talismanId: currentTalisman.id,
            userId: authUser.id,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          setPurchaseMessage(result.error || "購入処理中にエラーが発生しました")
          return
        }

        // ポイント残高を更新
        const summary = await getOrCreatePointsSummary(authUser.id)
        setUser({
          ...user,
          points: result.remainingPoints,
          totalSpent: summary.total_spent,
        } as KanauPointsUser)
      } else {
        // ローカルマネージャ（ゲストモード）
        const pointsManager = KanauPointsManager.getInstance()
        pointsManager.spendPoints("demo_user_001", currentTalisman.price, `お守り購入: ${currentTalisman.name}`)
        const updated = pointsManager.getUser("demo_user_001")
        if (updated) setUser(updated)
        pointsManager.saveToStorage()
      }

      // 購入成功エフェクト
      const randomMessage = RYDIA_MESSAGES.purchaseSuccess[Math.floor(Math.random() * RYDIA_MESSAGES.purchaseSuccess.length)]
      setPurchaseMessage(randomMessage)
      setShowPurchaseEffect(true)
      setHasAcquiredTalisman(true)

      // 特別報酬の抽選（10%の確率）
      const hasSpecialReward = Math.random() < 0.1
      if (hasSpecialReward) {
        setTimeout(() => {
          setPurchaseMessage(RYDIA_MESSAGES.specialReward)
        }, 2000)
      }

      setTimeout(() => {
        setShowPurchaseEffect(false)
        setPurchaseMessage("")
      }, 5000)
    } catch (error) {
      console.error("Purchase failed:", error)
      setPurchaseMessage("購入処理中にエラーが発生しました")
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleShare = async () => {
    if (typeof window === "undefined") return

    if (!hasAcquiredTalisman) {
      alert("まずはお守りを授かってからシェアしてください。")
      return
    }

    const shareText = currentTalisman ? `あなたも「${currentTalisman.name}」を授かりました✨\n#カナウ護符 #AI姓名判断 #開運アプリ\nhttps://seimei.app/shop/talisman` : ""
    const shareReason = "お守りショップSNS共有ボーナス"
    const shareTitle = currentTalisman ? `${currentTalisman.name}を授かりました` : "金龍護符を授かりました"
    
    try {
      // 日次制限チェック（ゲストモード）
      if (!authUser) {
        const today = new Date().toDateString()
        const lastShareDate = localStorage.getItem("talisman_share_date")
        if (lastShareDate === today) {
          alert("今日はすでにシェアボーナスを獲得済みです。明日またお試しください！")
          return
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: "https://seimei.app/shop/talisman",
        })
        
        // シェアボーナス付与（日次制限あり）
        if (authUser) {
          try {
            await addPointsSupa(authUser.id, 20, shareReason, "special_reward", true)
            const summary = await getOrCreatePointsSummary(authUser.id)
            setUser({
              ...user,
              points: summary.points,
              totalEarned: summary.total_earned,
            } as KanauPointsUser)
            setShowShareBonus(true)
            setHasSharedToday(true) // 獲得済みフラグを更新
            setTimeout(() => setShowShareBonus(false), 3000)
          } catch (error: any) {
            if (error.message.includes("すでに")) {
              alert("今日はすでにシェアボーナスを獲得済みです。明日またお試しください！")
              setHasSharedToday(true)
            } else {
              throw error
            }
          }
        } else {
          // ゲストモード：localStorageで制限
          const pointsManager = KanauPointsManager.getInstance()
          pointsManager.addPoints("demo_user_001", 20, shareReason)
          const updated = pointsManager.getUser("demo_user_001")
          if (updated) setUser(updated)
          pointsManager.saveToStorage()
          
          // 今日の日付を保存
          localStorage.setItem("talisman_share_date", new Date().toDateString())
          setHasSharedToday(true) // 獲得済みフラグを更新
          
          setShowShareBonus(true)
          setTimeout(() => setShowShareBonus(false), 3000)
        }
      } else {
        // フォールバック：クリップボードにコピー
        await navigator.clipboard.writeText(shareText)
        alert("シェアテキストをクリップボードにコピーしました！")
        
        // フォールバックでもポイント付与（ただし、共有成功の確認はできないため制限付き）
        if (authUser) {
          try {
            await addPointsSupa(authUser.id, 20, shareReason, "special_reward", true)
            const summary = await getOrCreatePointsSummary(authUser.id)
            setUser({
              ...user,
              points: summary.points,
              totalEarned: summary.total_earned,
            } as KanauPointsUser)
            setShowShareBonus(true)
            setHasSharedToday(true) // 獲得済みフラグを更新
            setTimeout(() => setShowShareBonus(false), 3000)
          } catch (error: any) {
            if (error.message.includes("すでに")) {
              alert("今日はすでにシェアボーナスを獲得済みです。")
              setHasSharedToday(true)
            }
          }
        } else {
          const today = new Date().toDateString()
          const lastShareDate = localStorage.getItem("talisman_share_date")
          if (lastShareDate !== today) {
            const pointsManager = KanauPointsManager.getInstance()
            pointsManager.addPoints("demo_user_001", 20, shareReason)
            const updated = pointsManager.getUser("demo_user_001")
            if (updated) setUser(updated)
            pointsManager.saveToStorage()
            localStorage.setItem("talisman_share_date", today)
            setHasSharedToday(true) // 獲得済みフラグを更新
            setShowShareBonus(true)
            setTimeout(() => setShowShareBonus(false), 3000)
          } else {
            alert("今日はすでにシェアボーナスを獲得済みです。")
            setHasSharedToday(true)
          }
        }
      }
    } catch (error: any) {
      console.error("Share failed:", error)
      if (error.message && !error.message.includes("すでに")) {
        // ユーザーがシェアをキャンセルした場合はエラーを表示しない
        if (error.name !== "AbortError") {
          alert("シェア処理中にエラーが発生しました")
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentTalisman) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">現在利用可能なお守りがありません</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canAfford = currentTalisman?.purchaseType === "yen" ? true : (user ? user.points >= (currentTalisman?.price || 0) : false)
  const purchaseProgress = currentTalisman?.purchaseType === "yen" ? 100 : (user ? (user.points / (currentTalisman?.price || 1)) * 100 : 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="h-6 w-6 animate-pulse" />
            <Badge className="bg-white/20 text-white border-white/30">
              Kanau Kiryu監修
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
            🐉 金龍護符シリーズ
          </h1>
          <p className="text-xl md:text-2xl font-medium text-yellow-100">
            {currentTalisman?.category || "開運上昇"}
          </p>
          <p className="text-lg text-yellow-50 italic">
            巫女 金雨希味が筆で描く運命の守り
          </p>
        </div>
      </div>

      {/* タブセクション */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as "kp" | "yen")
        if (value === "kp") {
          setSelectedTalismanId(kpTalismans[0]?.id ?? null)
        } else {
          setSelectedYenItemId(yenItems[0]?.id ?? null)
        }
        setPurchaseMessage("")
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kp" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            KP購入のお守り
          </TabsTrigger>
          <TabsTrigger value="yen" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            円購入のアイテム
          </TabsTrigger>
        </TabsList>

        {/* KP購入タブ */}
        <TabsContent value="kp" className="space-y-6">
          {/* 護符セレクション */}
          <Card className="border-2 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-semibold">授与する護符を選択</h2>
                <p className="text-sm text-muted-foreground">ラインアップから1つ選んで授与を受けられます</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {kpTalismans.map((talisman) => {
                  const isSelected = talisman.id === selectedTalismanId
                  return (
                    <button
                      key={talisman.id}
                      type="button"
                      onClick={() => {
                        setSelectedTalismanId(talisman.id)
                        setPurchaseMessage("")
                      }}
                      className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-yellow-500 ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-500/30"
                          : "border-transparent hover:border-yellow-300 hover:bg-yellow-50/60 dark:hover:bg-yellow-900/20"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0 rounded-lg border-2 border-yellow-200 bg-white/80 p-2 dark:border-yellow-700 dark:bg-yellow-950/40">
                          <Image
                            src={talisman.image}
                            alt={talisman.name}
                            width={110}
                            height={110}
                            className="h-24 w-24 object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold leading-tight">{talisman.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{talisman.description}</p>
                            </div>
                            <Badge className="bg-yellow-600 text-white">
                              {talisman.price.toLocaleString()} Kp
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{talisman.attribute}</span>
                            <span>•</span>
                            <span>{talisman.category}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array(talisman.rarity)
                              .fill(null)
                              .map((_, index) => (
                                <Star key={index} className="h-3 w-3 fill-current" />
                              ))}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute -right-3 -top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow">
                          選択中
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 円購入タブ */}
        <TabsContent value="yen" className="space-y-6">
          {/* アイテムセレクション */}
          <Card className="border-2 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-semibold">購入するアイテムを選択</h2>
                <p className="text-sm text-muted-foreground">ラインアップから1つ選んで購入できます</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {yenItems.map((item) => {
                  const isSelected = item.id === selectedYenItemId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedYenItemId(item.id)
                        setPurchaseMessage("")
                      }}
                      className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-yellow-500 ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-500/30"
                          : "border-transparent hover:border-yellow-300 hover:bg-yellow-50/60 dark:hover:bg-yellow-900/20"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0 rounded-lg border-2 border-yellow-200 bg-white/80 p-2 dark:border-yellow-700 dark:bg-yellow-950/40">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={110}
                            height={110}
                            className="h-24 w-24 object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold leading-tight">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            <Badge className="bg-green-600 text-white">
                              ¥{item.price.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.attribute}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute -right-3 -top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow">
                          選択中
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* カード展示セクション */}
      {currentTalisman && (
      <Card className="overflow-hidden border-2 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{currentTalisman?.name || ""}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-yellow-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {currentTalisman?.attribute || ""}
                </Badge>
                <Badge className="bg-purple-600 text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  {currentTalisman?.category || ""}
                </Badge>
                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-2 border-yellow-300">
                  {Array(currentTalisman?.rarity || 1).fill(null).map((_, i) => (
                    <Star key={i} className="h-3 w-3 inline fill-current" />
                  ))}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* 護符画像 */}
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="relative w-full h-full rounded-lg border-4 border-yellow-400 dark:border-yellow-600 overflow-hidden bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-900/30">
              {!imageError ? (
                <Image
                  src={currentTalisman?.image || ""}
                  alt={currentTalisman?.name || ""}
                  fill
                  className="object-contain p-4"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Crown className="h-16 w-16 mx-auto text-yellow-600 dark:text-yellow-400 animate-pulse" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">護符イメージ</p>
                  </div>
                </div>
              )}
              {/* 光るエフェクト */}
              {showPurchaseEffect && (
                <div className="absolute inset-0 bg-yellow-300/50 rounded-lg animate-ping pointer-events-none"></div>
              )}
            </div>
          </div>

          {/* 価格情報 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {currentTalisman?.purchaseType === "yen" ? (
                <>
                  <CircleDollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-muted-foreground">価格</p>
                  <p className="text-lg font-bold">¥{currentTalisman?.price?.toLocaleString() || "0"}</p>
                </>
              ) : (
                <>
                  <Coins className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-sm text-muted-foreground">価格</p>
                  <p className="text-lg font-bold">{currentTalisman?.price?.toLocaleString() || "0"} Kp</p>
                </>
              )}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Gift className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <p className="text-sm text-muted-foreground">特典</p>
              <p className="text-xs">巫女 金雨 希実のメッセージ</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Star className="h-5 w-5 mx-auto mb-1 text-red-600" />
              <p className="text-sm text-muted-foreground">提供期間</p>
              <p className="text-xs">無期限</p>
            </div>
          </div>

          {/* 説明セクション */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">護符の由来</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentTalisman?.description || ""}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              特に「{currentTalisman?.effects?.join("」「") || ""}」を高める効果があるとされています。
            </p>
          </div>

          {/* 購入・加護エリア */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">残高</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{user?.points.toLocaleString() || 0} Kp</span>
                </div>
              </div>

              {currentTalisman?.purchaseType === "yen" ? (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">決済方法</p>
                  {isGooglePlayAvailable && GooglePlayBillingDetector.isTWAEnvironment() ? (
                    <p className="text-lg font-bold text-blue-600">Google Play Billing</p>
                  ) : (
                    <p className="text-lg font-bold text-green-600">Square決済</p>
                  )}
                </div>
              ) : (
                <>
                  {!canAfford && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>購入まで</span>
                        <span>{Math.ceil((currentTalisman?.price || 0) - (user?.points || 0))} Kp</span>
                      </div>
                      <Progress value={Math.min(purchaseProgress, 100)} className="h-2" />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>交換レート</span>
                <span>{currentTalisman?.exchangeRate || "特典あり"}</span>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={(currentTalisman?.purchaseType !== "yen" && !canAfford) || isPurchasing}
                className={`w-full h-14 text-lg font-bold ${
                  (currentTalisman?.purchaseType === "yen" || canAfford)
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                {isPurchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    処理中...
                  </>
                ) : currentTalisman?.purchaseType === "yen" ? (
                  <>
                    <CircleDollarSign className="h-5 w-5 mr-2" />
                    ¥{currentTalisman?.price?.toLocaleString() || "0"}で購入する
                  </>
                ) : canAfford ? (
                  <>
                    <PenTool className="h-5 w-5 mr-2" />
                    今すぐ授かる ({currentTalisman?.price?.toLocaleString() || "0"} Kp)
                  </>
                ) : (
                  "Kpが不足しています"
                )}
              </Button>

              {/* 購入成功メッセージ */}
              {showPurchaseEffect && purchaseMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription className="font-medium text-green-800 dark:text-green-200">
                    ✨ {purchaseMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* エラーメッセージ */}
              {purchaseMessage && !showPurchaseEffect && !purchaseMessage.includes("おめでとう") && (
                <Alert variant="destructive">
                  <AlertDescription>{purchaseMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* SNS共有ボーナスセクション */}
          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center space-y-2">
                <h4 className="font-semibold">あなたも「{currentTalisman?.name || ""}」を授かりました✨</h4>
                <p className="text-sm text-muted-foreground">
                  #カナウ護符 #AI姓名判断 #開運アプリ
                </p>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
                disabled={hasSharedToday || !hasAcquiredTalisman}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {hasSharedToday
                  ? "今日はすでに獲得済み"
                  : !hasAcquiredTalisman
                    ? "授与後にシェア可能"
                    : "シェアして +20 Kp 獲得"}
              </Button>
              {hasSharedToday ? (
                <p className="text-xs text-center text-muted-foreground">
                  明日またお試しください
                </p>
              ) : !hasAcquiredTalisman ? (
                <p className="text-xs text-center text-muted-foreground">
                  先にお守りを授かるとシェアボーナスが解放されます
                </p>
              ) : null}
              {showShareBonus && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Gift className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    +20 Kp 獲得しました！
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* コレクションへのリンク */}
          {authUser && (
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href="/shop/talisman/collection">
                    <Crown className="h-4 w-4 mr-2" />
                    あなたのお守りコレクションを見る
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}

