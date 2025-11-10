 "use client"
 
 import { useEffect, useState } from "react"
 import { Card, CardContent } from "@/components/ui/card"
 import { Badge } from "@/components/ui/badge"
 import { Button } from "@/components/ui/button"
 import { Gift, Sparkles, X } from "lucide-react"
 import { processLoginBonusSupa, getOrCreatePointsSummary } from "@/lib/kanau-points-supabase"
 import { useAuth } from "@/components/auth/auth-provider"
 import { SubscriptionManager } from "@/lib/subscription-manager"
 
 interface LoginBonusData {
   basePoints: number
   consecutiveBonus: number
   totalPoints: number
   consecutiveDays: number
   specialReward?: {
     name: string
     type: string
   }
   message: string
 }
 
 export function LoginBonusNotification() {
   const { user } = useAuth()
   const [showNotification, setShowNotification] = useState(false)
   const [bonusData, setBonusData] = useState<LoginBonusData | null>(null)
   const [isProcessing, setIsProcessing] = useState(false)
   const [hasClaimed, setHasClaimed] = useState(false)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)
   const [migratedPoints, setMigratedPoints] = useState<number | null>(null)
 
   useEffect(() => {
     let cancelled = false
 
     const prepareLoginBonus = async () => {
       if (!user) return
 
       try {
         const summary = await getOrCreatePointsSummary(user.id)
         const today = new Date().toISOString().split("T")[0]
         const lastBonus = summary.last_login_bonus_date || ""
 
         if (lastBonus === today) {
           // 既に受け取り済み
           return
         }
 
         const manager = SubscriptionManager.getInstance()
         const currentPlan = manager.getCurrentPlan()
         const plan = currentPlan.id as "free" | "basic" | "premium"
         const basePoints = plan === "free" ? 1 : plan === "basic" ? 2 : 3
 
         if (cancelled) return
 
         setBonusData({
           basePoints,
           consecutiveBonus: 0,
           totalPoints: basePoints,
           consecutiveDays: summary.consecutive_login_days || 0,
           message: "本日のログインボーナスを受け取りましょう！",
         })
         setErrorMessage(null)
         setHasClaimed(false)
         setShowNotification(true)
       } catch (error) {
         console.error("ログインボーナス状態取得エラー:", error)
       }
     }
 
     setShowNotification(false)
     setBonusData(null)
     setHasClaimed(false)
     setErrorMessage(null)
 
     if (user) {
       prepareLoginBonus()
     }
 
     return () => {
       cancelled = true
     }
   }, [user?.id])
 
   const handleClaim = async () => {
     if (!user || isProcessing) return
 
     setIsProcessing(true)
     setErrorMessage(null)
 
     try {
       const manager = SubscriptionManager.getInstance()
       const currentPlan = manager.getCurrentPlan()
       const plan = currentPlan.id as "free" | "basic" | "premium"
 
       const result = await processLoginBonusSupa(user.id, plan)
 
       if (result.bonus.totalPoints === 0) {
         // 既に受け取り済みの場合はそのまま閉じる
         setBonusData({
           basePoints: 0,
           consecutiveBonus: 0,
           totalPoints: 0,
           consecutiveDays: result.bonus.consecutiveDays || 0,
           message: result.bonus.message,
         })
         setHasClaimed(true)
         setTimeout(() => setShowNotification(false), 3000)
         return
       }
 
       setBonusData({
         basePoints: result.bonus.basePoints,
         consecutiveBonus: result.bonus.consecutiveBonus || 0,
         totalPoints: result.bonus.totalPoints,
         consecutiveDays: result.bonus.consecutiveDays || 0,
         specialReward: result.bonus.specialReward
           ? {
               name: result.bonus.specialReward.name,
               type: result.bonus.specialReward.type,
             }
           : undefined,
         message: result.bonus.message,
       })
       setHasClaimed(true)
       setTimeout(() => setShowNotification(false), 8000)
     } catch (error) {
       console.error("ログインボーナス受け取りエラー:", error)
       setErrorMessage("ログインボーナスの受け取りに失敗しました。接続状況を確認して再試行してください。")
     } finally {
       setIsProcessing(false)
     }
   }
 
   // ゲストKP移行通知をリッスン（従来の挙動を維持）
   useEffect(() => {
     const handleMigration = (event: CustomEvent<{ points: number }>) => {
       setMigratedPoints(event.detail.points)
       setBonusData({
         basePoints: 0,
         consecutiveBonus: 0,
         totalPoints: event.detail.points,
         consecutiveDays: 0,
         message: `ゲストモードで獲得した${event.detail.points}KPを引き継ぎました！`,
       })
       setHasClaimed(true)
       setErrorMessage(null)
       setShowNotification(true)
 
       setTimeout(() => {
         setShowNotification(false)
         setMigratedPoints(null)
       }, 10000)
     }
 
     window.addEventListener("guest-points-migrated", handleMigration as EventListener)
     return () => {
       window.removeEventListener("guest-points-migrated", handleMigration as EventListener)
     }
   }, [])
 
   if (!showNotification || !bonusData) return null
 
   const canClose = hasClaimed || migratedPoints !== null || !!errorMessage
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
       <Card className="relative w-full max-w-md border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 shadow-2xl overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-pink-200/20 animate-pulse" />
         <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
 
         <CardContent className="relative z-10 p-6 space-y-6">
           <div className="flex items-start justify-between">
             <div className="flex items-center gap-2">
               <Gift className="h-6 w-6 text-yellow-600 animate-bounce" />
               <h3 className="font-bold text-lg text-yellow-800">
                 {migratedPoints ? "ゲストKP移行完了！" : hasClaimed ? "ログインボーナス獲得！" : "本日のログインボーナス"}
               </h3>
             </div>
             {canClose && (
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-6 w-6 text-gray-500 hover:text-gray-700"
                 onClick={() => setShowNotification(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
             )}
           </div>
 
           <div className="text-center animate-in zoom-in duration-300 space-y-4">
             <div>
               <div className={`text-4xl font-bold ${hasClaimed || migratedPoints ? "text-green-600" : "text-yellow-600"} mb-2 animate-pulse`}>
                 +{hasClaimed || migratedPoints ? bonusData.totalPoints : bonusData.basePoints}Kp
               </div>
               <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
                 <Badge variant="outline" className="bg-white/50 border-yellow-300">
                   基礎{bonusData.basePoints}Kp
                 </Badge>
                 {bonusData.consecutiveBonus > 0 && (
                   <Badge variant="outline" className="bg-white/50 border-yellow-300">
                     連続ボーナス+{bonusData.consecutiveBonus}Kp
                   </Badge>
                 )}
               </div>
             </div>
 
             <p className="text-sm text-yellow-800 whitespace-pre-line">
               {bonusData.message}
             </p>
 
             {!hasClaimed && migratedPoints === null && (
               <div className="space-y-3">
                 {errorMessage && (
                   <p className="text-sm text-red-600">{errorMessage}</p>
                 )}
                 <Button
                   onClick={handleClaim}
                   disabled={isProcessing}
                   className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                 >
                   {isProcessing ? "受け取り中..." : "受け取る"}
                 </Button>
               </div>
             )}
 
             {hasClaimed && bonusData.specialReward && (
               <Badge className="mx-auto flex w-fit items-center gap-1 bg-green-100 text-green-800 border-green-200">
                 <Sparkles className="h-4 w-4" />
                 {bonusData.specialReward.name}
               </Badge>
             )}
           </div>
 
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(10)].map((_, i) => (
               <Sparkles
                 key={i}
                 className="absolute text-yellow-400 animate-ping"
                 style={{
                   left: `${20 + i * 8}%`,
                   top: `${30 + i * 5}%`,
                   animationDelay: `${i * 0.2}s`,
                   animationDuration: "2s",
                 }}
                 size={16}
               />
             ))}
           </div>
         </CardContent>
       </Card>
     </div>
   )
 }
 
