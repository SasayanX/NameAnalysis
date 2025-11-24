"use client"

import React, { useRef, useEffect, useMemo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PdfExportButton } from "@/components/pdf-export-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LockIcon, Settings, Baby, Sparkles, Brain, Lightbulb, Target, Star, BookOpen, RefreshCw } from "lucide-react"
import Link from "next/link"

// コンポーネントの遅延読み込み
import { NameAnalysisResult } from "@/components/name-analysis-result"
import { SimpleAnalysisResult } from "@/components/simple-analysis-result"
import { VerticalNameDisplay } from "@/components/vertical-name-display"
import { DailyFortuneCard } from "@/components/daily-fortune-card"
import { SixStarChart } from "@/components/six-star-chart"
import { NameRankingCard } from "@/components/name-ranking-card"
import { CompatibilityAnalyzer } from "@/components/compatibility-analyzer"
import { AdvancedFiveElementsChart } from "@/components/advanced-five-elements-chart"
import { FortuneFlowTable } from "@/components/fortune-flow-table"
import { CompanyNameResult } from "@/components/company-name-result"
import { TrialBanner } from "@/components/trial-banner"
import { KanauPointsHeader } from "@/components/kanau-points-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShareButtons, generateAiFortuneShareContent } from "@/components/share-buttons"
import { useSubscription, SubscriptionManager } from "@/lib/subscription-manager"
import { NumerologyResultComponent } from "@/components/numerology-result"
import { BabyNamingTool } from "@/components/baby-naming-tool"

// 型とユーティリティ
import type { StarPersonType } from "@/lib/fortune-flow-calculator"
import { normalizeStarPersonType, calculateStarPersonFromBirthdate } from "@/lib/fortune-flow-calculator"
import { UsageTracker } from "@/lib/usage-tracker"
import { calculateNumerology } from "@/lib/numerology"
import { calculateGogyo } from "@/lib/advanced-gogyo"

// メモ化されたコンポーネント
const MemoizedVerticalNameDisplay = React.memo(VerticalNameDisplay)
const MemoizedDailyFortuneCard = React.memo(DailyFortuneCard)

// デフォルトの使用状況オブジェクト
const DEFAULT_USAGE = {
  personalAnalysis: 0,
  companyAnalysis: 0,
  compatibilityAnalysis: 0,
  numerologyAnalysis: 0,
  babyNaming: 0,
  pdfExport: 0,
  historyStorage: 0,
}

export default function ClientPage() {
  // サブスクリプション状態（ヘッダー表示用）
  const subscription = useSubscription()

  // 基本的な状態管理
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [birthdate, setBirthdate] = useState<string>("")
  const [results, setResults] = useState<any>(null)
  const [sixStar, setSixStar] = useState<any>(null)
  const [advancedResults, setAdvancedResults] = useState<any>(null)
  const [aiFortune, setAiFortune] = useState<any>(null)
  const [isLoadingAiFortune, setIsLoadingAiFortune] = useState(false)
  const [aiFortuneUsage, setAiFortuneUsage] = useState<{ count: number; limit: number }>({ count: 0, limit: 1 })
  const [availableDragonBreathItems, setAvailableDragonBreathItems] = useState<any[]>([])

  const [companyName, setCompanyName] = useState("")
  const [companyResults, setCompanyResults] = useState<any>(null)

  const [activeSection, setActiveSection] = useState<"fortune" | "compatibility" | "baby-naming">("fortune")
  const [nameType, setNameType] = useState<"person" | "company">("person")
  const [activeTab, setActiveTab] = useState("simple")
  const [selectedStarType, setSelectedStarType] = useState<StarPersonType>("水星人+")
  const [calculatedStarType, setCalculatedStarType] = useState<StarPersonType | null>(null)
  const [forceUpdateKey, setForceUpdateKey] = useState(0)
  const [tabsKey, setTabsKey] = useState(0)

  const resultsRef = useRef<HTMLDivElement>(null)

  // 使用制限管理
  const [usageTracker] = useState(() => UsageTracker.getInstance())
  const [usageStatus, setUsageStatus] = useState(() => {
    try {
      return usageTracker.getUsageStatus()
    } catch (error) {
      console.error("Failed to get usage status:", error)
      return {
        plan: "free" as const,
        isInTrial: false,
        trialDaysRemaining: 0,
        todayUsage: DEFAULT_USAGE,
        limits: {
          personalAnalysis: -1,
          companyAnalysis: -1,
          compatibilityAnalysis: -1,
          numerologyAnalysis: -1,
          babyNaming: -1,
          pdfExport: -1,
          historyStorage: -1,
        },
        canUseFeature: () => ({ allowed: true, remaining: -1 }),
      }
    }
  })

  // プラン状態をusageStatusから取得（確実に初期値を設定）
  const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">(() => {
    const plan = usageStatus?.plan || "free"
    // 無効な値の場合は"free"にフォールバック
    if (plan !== "free" && plan !== "basic" && plan !== "premium") {
      console.warn("Invalid plan value:", plan, "falling back to 'free'")
      return "free"
    }
    return plan as "free" | "basic" | "premium"
  })
  const [isInTrial, setIsInTrial] = useState(() => usageStatus.isInTrial || false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(() => usageStatus.trialDaysRemaining || 0)
  
  // クライアントサイドでマウントされたかどうか（ハイドレーションエラー回避用）
  const [mounted, setMounted] = useState(false)

  // ページ読み込み時にサブスクリプション状態を同期
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const syncSubscription = async () => {
      try {
        // TWA環境の検出
        const isTWA = typeof navigator !== "undefined" && 
          (navigator.userAgent?.includes("twa") || 
           navigator.userAgent?.includes("androidbrowserhelper") ||
           (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))
        
        if (isTWA) {
          console.log("[TWA] 🔄 サブスクリプション同期を開始します...")
          console.log("[TWA] localStorage確認:", {
            customerEmail: localStorage.getItem("customerEmail"),
            userId: localStorage.getItem("userId"),
          })
        }
        
        const subscriptionManager = SubscriptionManager.getInstance()
        
        // 同期前に少し待機（localStorageの保存が完了するのを待つ）
        // TWA環境ではより長く待機（認証情報の保存が完了するのを待つ）
        const waitTime = isTWA ? 800 : 300
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        // 認証情報を再確認（localStorageから直接取得）
        const customerEmail = localStorage.getItem("customerEmail")
        const userId = localStorage.getItem("userId")
        if (isTWA) {
          console.log("[TWA] 同期前の認証情報確認:", {
            customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : null,
            userId: userId ? `${userId.substring(0, 8)}***` : null,
          })
        }
        
        if (!userId && !customerEmail) {
          console.warn("[TWA] ⚠️ 認証情報が見つかりません。ログインが必要です。")
          // 認証情報がない場合は、freeプランのままなので同期完了として扱う
          setSubscriptionSynced(true)
          return
        }
        
        await subscriptionManager.syncSubscriptionFromServer()
        
        // 同期後の状態を確認
        const currentPlan = subscriptionManager.getCurrentPlan()
        const isActive = subscriptionManager.isSubscriptionActive()
        
        console.log("✅ ページ読み込み時: サブスクリプション状態を同期しました", {
          plan: currentPlan.id,
          isActive,
        })
        
        // usageStatusを再取得して更新（プラン変更を反映）
        const updatedUsageStatus = usageTracker.getUsageStatus()
        setUsageStatus(updatedUsageStatus)
        setCurrentPlan(updatedUsageStatus.plan as "free" | "basic" | "premium")
        setIsInTrial(updatedUsageStatus.isInTrial || false)
        setTrialDaysRemaining(updatedUsageStatus.trialDaysRemaining || 0)
        setSubscriptionSynced(true) // 同期完了フラグを設定
        
        console.log("✅ usageStatusを更新しました:", {
          plan: updatedUsageStatus.plan,
          isInTrial: updatedUsageStatus.isInTrial,
        })
        
        if (isTWA) {
          console.log("[TWA] ✅ 同期完了:", {
            plan: currentPlan.id,
            isActive,
            subscription: subscriptionManager.getSubscriptionInfo(),
            updatedPlan: updatedUsageStatus.plan,
          })
          
          // プランが有効になっていない場合の警告
          if (!isActive && currentPlan.id !== "free") {
            console.warn("[TWA] ⚠️ プランが有効になっていません:", {
              plan: currentPlan.id,
              isActive,
              subscription: subscriptionManager.getSubscriptionInfo(),
            })
          }
        }
      } catch (error) {
        console.error("❌ ページ読み込み時: サブスクリプション状態の同期エラー:", error)
        // エラーが発生した場合でも、同期試行は完了したものとして扱う
        setSubscriptionSynced(true)
        
        // TWA環境でのエラー詳細
        const isTWA = typeof navigator !== "undefined" && 
          (navigator.userAgent?.includes("twa") || 
           navigator.userAgent?.includes("androidbrowserhelper") ||
           (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))
        
        if (isTWA && error instanceof Error) {
          console.error("[TWA] ❌ 同期エラー詳細:", {
            message: error.message,
            stack: error.stack,
            localStorage: {
              customerEmail: localStorage.getItem("customerEmail"),
              userId: localStorage.getItem("userId"),
            },
          })
        }
      }
    }
    
    syncSubscription()
  }, [])

  // URLパラメータでプレミアムモードを強制（開発環境・スクリーンショット用）
  // 本番環境では無効化（セキュリティのため）
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // 開発環境でのみ動作するように制限
    const isDevelopment = 
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      process.env.NEXT_PUBLIC_ALLOW_PLAN_PARAM === "true"
    
    // 本番環境ではURLパラメータを削除して終了
    if (!isDevelopment) {
      const params = new URLSearchParams(window.location.search)
      if (params.has("plan") || params.has("premium")) {
        params.delete("plan")
        params.delete("premium")
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
        window.history.replaceState({}, "", newUrl)
      }
      return
    }
    
    const params = new URLSearchParams(window.location.search)
    const premiumParam = params.get("premium")
    const planParam = params.get("plan")?.toLowerCase() // タイポ対応のため小文字化
    
    // タイポ対応: "premiun" → "premium"
    const normalizedPlan = planParam === "premiun" ? "premium" : planParam
    
    // 既存のプラン設定を確認
    let shouldUpdate = false
    let targetPlan: "free" | "basic" | "premium" | null = null
    
    if (premiumParam === "true" || normalizedPlan === "premium") {
      targetPlan = "premium"
      // 既存のプランが既にpremiumで有効な場合はスキップ
      try {
        const existing = localStorage.getItem("userSubscription")
        if (existing) {
          const sub = JSON.parse(existing)
          if (sub.plan === "premium" && sub.isActive && new Date(sub.expiresAt) > new Date()) {
            // 既に有効なpremiumプランが設定されている場合は何もしない
            // URLパラメータだけ削除して終了
            if (params.has("premium") || params.has("plan")) {
              params.delete("premium")
              params.delete("plan")
              const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
              window.history.replaceState({}, "", newUrl)
            }
            return
          }
        }
      } catch (e) {
        // エラー時は続行
      }
      shouldUpdate = true
    } else if (normalizedPlan === "basic") {
      targetPlan = "basic"
      // 既存のプランが既にbasicで有効な場合はスキップ
      try {
        const existing = localStorage.getItem("userSubscription")
        if (existing) {
          const sub = JSON.parse(existing)
          if (sub.plan === "basic" && sub.isActive && new Date(sub.expiresAt) > new Date()) {
            // 既に有効なbasicプランが設定されている場合は何もしない
            if (params.has("plan")) {
              params.delete("plan")
              const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
              window.history.replaceState({}, "", newUrl)
            }
            return
          }
        }
      } catch (e) {
        // エラー時は続行
      }
      shouldUpdate = true
    } else if (normalizedPlan === "free") {
      targetPlan = "free"
      // 既存のプランが既にfreeの場合はスキップ
      try {
        const existing = localStorage.getItem("userSubscription")
        if (existing) {
          const sub = JSON.parse(existing)
          if (sub.plan === "free") {
            // 既にfreeプランが設定されている場合は何もしない
            if (params.has("plan")) {
              params.delete("plan")
              const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
              window.history.replaceState({}, "", newUrl)
            }
            return
          }
        }
      } catch (e) {
        // エラー時は続行
      }
      shouldUpdate = true
    }
    
    if (shouldUpdate && targetPlan) {
      if (targetPlan === "premium") {
        // プレミアムプランを強制設定（開発環境チェックをバイパス）
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)
        
        const premiumSubscription = {
          plan: "premium" as const,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          status: "active" as const,
          paymentMethod: "square" as const,
          amount: 550,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
        }
        
        localStorage.setItem("userSubscription", JSON.stringify({
          ...premiumSubscription,
          expiresAt: premiumSubscription.expiresAt.toISOString(),
          nextBillingDate: premiumSubscription.nextBillingDate.toISOString(),
          lastPaymentDate: premiumSubscription.lastPaymentDate.toISOString(),
        }))
      } else if (targetPlan === "basic") {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)
        
        const basicSubscription = {
          plan: "basic" as const,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          status: "active" as const,
          paymentMethod: "square" as const,
          amount: 330,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
        }
        
        localStorage.setItem("userSubscription", JSON.stringify({
          ...basicSubscription,
          expiresAt: basicSubscription.expiresAt.toISOString(),
          nextBillingDate: basicSubscription.nextBillingDate.toISOString(),
          lastPaymentDate: basicSubscription.lastPaymentDate.toISOString(),
        }))
      } else if (targetPlan === "free") {
        // 無料プランに戻す
        const freeSubscription = {
          plan: "free" as const,
          expiresAt: null,
          isActive: false,
          trialEndsAt: null,
          status: "cancelled" as const,
        }
        
        // localStorageに直接保存（ページリロード時にSubscriptionManagerが読み込む）
        localStorage.setItem("userSubscription", JSON.stringify(freeSubscription))
      }
      
      // URLパラメータを削除してから再読み込み（無限ループを防ぐ）
      params.delete("premium")
      params.delete("plan")
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
      window.history.replaceState({}, "", newUrl)
      
      // SubscriptionManagerをリフレッシュ
      window.location.reload()
    }
  }, [])

  // サブスクリプション同期完了フラグ
  const [subscriptionSynced, setSubscriptionSynced] = useState(false)

  // クライアントサイドでマウント済みフラグを設定
  useEffect(() => {
    setMounted(true)
  }, [])

  // 決済完了後の自動プラン有効化チェック（ウェブ・モバイル対応）
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return

    // モバイル判定（画面幅768px以下）
    const isMobile = window.innerWidth <= 768

    // 既に有効なプランがある場合はスキップ、解約済みの場合はスキップ
    try {
      const existing = localStorage.getItem("userSubscription")
      if (existing) {
        const sub = JSON.parse(existing)
        // 解約済みの場合はスキップ
        if (sub.status === "cancelled") {
          return // 解約済みのため、自動有効化をスキップ
        }
        // 既に有効なプランがある場合はスキップ
        if (sub.isActive && sub.plan !== "free" && sub.expiresAt && new Date(sub.expiresAt) > new Date()) {
          return // 既に有効なプランがある
        }
      }
    } catch (e) {
      // エラー時は続行
    }

    // URLパラメータからメールアドレスを取得
    const params = new URLSearchParams(window.location.search)
    const email = params.get("email")

    // メールアドレスがない場合は、localStorageから取得を試みる
    let customerEmail = email
    if (!customerEmail) {
      // 1. URLパラメータから取得（既に処理済み）
      // 2. localStorageのcustomerEmailから取得（決済時に保存したメールアドレス）
      customerEmail = localStorage.getItem("customerEmail") || null
      
      // 3. userSessionから取得
      if (!customerEmail) {
        try {
          const sessionData = localStorage.getItem("userSession")
          if (sessionData) {
            const session = JSON.parse(sessionData)
            customerEmail = session.email || null
          }
        } catch (e) {
          // エラー時は無視
        }
      }
    }

    // メールアドレスがある場合のみ、自動的に決済情報を確認
    if (customerEmail) {
      // ウェブ: 即座に確認（0.5秒後）
      // モバイル: 少し遅延（1秒後、TWA/PWAの読み込みを待つ）
      const delay = isMobile ? 1000 : 500
      
      const timer = setTimeout(async () => {
        try {
          // ローディング状態を視覚的に表示（オプション）
          const response = await fetch(`/api/square-payments/auto-activate?email=${encodeURIComponent(customerEmail!)}`)
          const result = await response.json()

          if (result.success && result.subscription) {
            // プランを自動的に有効化
            localStorage.setItem("userSubscription", JSON.stringify(result.subscription))
            
            // モバイル: リロード前にトースト通知（但し、useToastはここでは使えないので、alert or console）
            if (isMobile) {
              console.log("決済完了を検知し、プランを有効化しました:", result.subscription.plan)
              // モバイルでは、リロード前に少し待機（ユーザーが通知を確認できるように）
              setTimeout(() => {
                window.location.reload()
              }, 500)
            } else {
              // ウェブ: 即座にリロード
              console.log("決済完了を検知し、プランを有効化しました:", result.subscription.plan)
              window.location.reload()
            }
          }
        } catch (error) {
          // エラーは無視（自動チェックなので失敗しても問題ない）
          console.log("自動決済確認:", error)
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [mounted])

  // usageStatusのplanが変更されたらcurrentPlanを更新
  useEffect(() => {
    if (usageStatus.plan) {
      setCurrentPlan(usageStatus.plan)
    }
    setIsInTrial(usageStatus.isInTrial || false)
    setTrialDaysRemaining(usageStatus.trialDaysRemaining || 0)
  }, [usageStatus.plan, usageStatus.isInTrial, usageStatus.trialDaysRemaining])

  // 計算されたプロパティ
  const fullName = useMemo(() => `${lastName} ${firstName}`, [lastName, firstName])

  // 安定化されたコールバック関数
  const handleGenderChange = useCallback((value: string) => {
    setGender(value as "male" | "female")
  }, [])

  const handlePersonalAnalysis = useCallback(async () => {
    console.log("🔍 ClientPage: handlePersonalAnalysis関数が呼び出されました")
    try {
      // 実際の姓名判断分析を実行
      console.log("🔍 ClientPage: 分析開始前")
      const { analyzeNameFortune } = require("@/lib/name-data-simple-fixed")
      console.log("🔍 ClientPage: analyzeNameFortune関数取得完了")
      console.log("🔍 ClientPage: analyzeNameFortune関数の型:", typeof analyzeNameFortune)
      console.log("🔍 ClientPage: analyzeNameFortune関数の名前:", analyzeNameFortune.name)
      const { customFortuneData } = require("@/lib/fortune-data-custom")
      console.log("🔍 ClientPage: customFortuneData取得状況:", !!customFortuneData)
      if (customFortuneData) {
        console.log("🔍 ClientPage: customFortuneData件数:", Object.keys(customFortuneData).length)
      }
      console.log("🔍 ClientPage: analyzeNameFortune関数呼び出し開始")
      const analysisResult = analyzeNameFortune(lastName, firstName, gender, customFortuneData)
      console.log("🔍 ClientPage: analyzeNameFortune関数呼び出し完了")
      console.log("分析結果:", analysisResult)
      
      // nameプロパティを追加（AI鑑定で使用）
      const fullName = `${lastName}${firstName}`
      const analysisResultWithName = {
        ...analysisResult,
        name: fullName,
      }
      setResults(analysisResultWithName)

      // 推測マーク（isDefault: true）の文字を検出してメール通知
      if (analysisResult.characterDetails && Array.isArray(analysisResult.characterDetails)) {
        const unknownKanji = analysisResult.characterDetails
          .filter((detail: any) => detail.isDefault === true)
          .map((detail: any) => detail.character)
        
        if (unknownKanji && unknownKanji.length > 0) {
          console.log(`📧 推測マーク検出: ${unknownKanji.length}文字 (${unknownKanji.join(', ')})`)
          // メール通知を送信（非同期、エラーは無視）
          fetch('/api/notify-unknown-strokes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lastName,
              firstName,
              unknownKanji,
            }),
          }).catch((error) => {
            console.warn('推測マーク通知エラー:', error)
          })
        }
      }

      if (birthdate) {
        // 生年月日から六星占術の星人タイプを計算
        const dateObject = new Date(birthdate)
        const calculatedStarType = calculateStarPersonFromBirthdate(dateObject)

        const mockSixStar = {
          star: calculatedStarType.includes("水星")
            ? "水星"
            : calculatedStarType.includes("金星")
              ? "金星"
              : calculatedStarType.includes("火星")
                ? "火星"
                : calculatedStarType.includes("木星")
                  ? "木星"
                  : calculatedStarType.includes("土星")
                    ? "土星"
                    : "水星",
          type: calculatedStarType.includes("+") ? "+" : "-",
          starType: calculatedStarType,
        }
        setSixStar(mockSixStar)

        // 実際の五行分析を実行
        console.log("🌿 五行分析を開始します...")
        const gogyoResult = calculateGogyo(lastName, firstName, dateObject)
        console.log("✅ 五行分析完了:", gogyoResult)

        const advancedData = {
          hasBirthdate: true,
          sixStar: mockSixStar,
          gogyoResult: gogyoResult,
        }
        setAdvancedResults(advancedData)

        // AI鑑定は自動生成せず、ユーザーが「AI深層言霊鑑定」タブでボタンをクリックした時に依頼
      } else {
        // 生年月日なしの場合
        // 実際の五行分析を実行（生年月日なし）
        console.log("🌿 五行分析を開始します（生年月日なし）...")
        const gogyoResult = calculateGogyo(lastName, firstName)
        console.log("✅ 五行分析完了:", gogyoResult)

        const advancedData = {
          hasBirthdate: false,
          sixStar: null,
          gogyoResult: gogyoResult,
        }
        setAdvancedResults(advancedData)

        // AI鑑定は自動生成せず、ユーザーが「AI深層言霊鑑定」タブでボタンをクリックした時に依頼
      }

      if (usageTracker.incrementUsage("personalAnalysis")) {
        setUsageStatus(usageTracker.getUsageStatus())
      }
    } catch (error) {
      console.error("Error in personal analysis:", error)
    }
  }, [lastName, firstName, gender, birthdate, usageTracker])

  // プラン別の龍の息吹使用回数
  const PLAN_USAGE_COUNTS = {
    free: 1,
    basic: 2,
    premium: 3,
  } as const

  // 確認ダイアログの状態
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPremiumDragonBreathDialog, setShowPremiumDragonBreathDialog] = useState(false)

  // AI鑑定の使用回数と龍の息吹アイテムを取得
  useEffect(() => {
    const fetchAiFortuneUsage = async () => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) return
      
      try {
        const response = await fetch(`/api/ai-fortune/usage?userId=${userId}&plan=${currentPlan}`)
        const data = await response.json()
        if (data.success) {
          setAiFortuneUsage({ count: data.count, limit: data.limit })
        }
      } catch (error) {
        console.error("Failed to fetch AI fortune usage:", error)
      }
    }

    const fetchDragonBreathItems = async () => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) return
      
      try {
        const response = await fetch(`/api/dragon-breath/items?userId=${userId}`)
        const data = await response.json()
        if (data.success) {
          setAvailableDragonBreathItems(data.items)
        }
      } catch (error) {
        console.error("Failed to fetch Dragon's Breath items:", error)
      }
    }

    if (typeof window !== "undefined") {
      fetchAiFortuneUsage()
      fetchDragonBreathItems()
    }
  }, [currentPlan])

  // 実際のAI鑑定生成処理（使用回数チェックなし）
  const executeAiFortuneGeneration = useCallback(async (
    nameAnalysisResult: any,
    gogyoResult?: any,
    birthdate?: string
  ) => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) {
      setAiFortune({ success: false, error: "ログインが必要です" })
      return
    }

    setIsLoadingAiFortune(true)
    setAiFortune(null)

    try {
      console.log("🤖 AI鑑定生成開始:", { 
        name: nameAnalysisResult?.name,
        categories: nameAnalysisResult?.categories?.length || 0,
        gogyoResult: !!gogyoResult,
        birthdate 
      })
      
      const response = await fetch('/api/ai/generate-fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAnalysisResult,
          gogyoResult,
          birthdate,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ AI鑑定生成エラー:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          fullResponse: errorText,
        })
        setAiFortune({
          success: false,
          error: errorData.error || `AI鑑定の生成に失敗しました (${response.status})`,
          details: errorData.details,
        })
        return
      }

      const data = await response.json()
      
      // 【重要】成功していない場合（success: false）は使用回数をカウントしない
      if (!data.success) {
        console.error('❌ AI鑑定生成失敗:', data)
        setAiFortune({
          success: false,
          error: data.error || 'AI鑑定の生成に失敗しました',
          details: data.details,
        })
        return // 使用回数をカウントせずに終了
      }
      
      console.log("✅ AI鑑定生成成功:", data)
      
      // 成功した場合のみ、使用回数をインクリメント
      try {
        await fetch("/api/ai-fortune/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, increment: 1, plan: currentPlan }),
        })
        setAiFortuneUsage(prev => ({ ...prev, count: prev.count + 1 }))
      } catch (usageError) {
        console.error('⚠️ 使用回数の更新に失敗しましたが、AI鑑定結果は表示します:', usageError)
        // 使用回数の更新に失敗しても、AI鑑定結果は表示する
      }
      
      // 氏名情報を保存（姓名判断結果が変更されたかチェックするため）
      const targetName = nameAnalysisResult?.name || 
        (nameAnalysisResult?.lastName && nameAnalysisResult?.firstName 
          ? `${nameAnalysisResult.lastName}${nameAnalysisResult.firstName}` 
          : null)
      setAiFortune({
        ...data,
        targetName: targetName,
      })
    } catch (error: any) {
      console.error('❌ AI鑑定生成エラー:', error)
      setAiFortune({
        success: false,
        error: error.message || 'AI鑑定の生成に失敗しました',
      })
    } finally {
      setIsLoadingAiFortune(false)
    }
  }, [currentPlan, setAiFortuneUsage])

  // AI鑑定を依頼する関数（使用回数チェックあり）
  const generateAiFortune = useCallback(async (
    nameAnalysisResult: any,
    gogyoResult?: any,
    birthdate?: string
  ) => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) {
      setAiFortune({ success: false, error: "ログインが必要です" })
      return
    }

    // 【重要】最新の使用回数を取得（姓名判断を繰り返す場合に備えて）
    let currentUsage = aiFortuneUsage.count
    let currentLimit = aiFortuneUsage.limit
    try {
      const usageResponse = await fetch(`/api/ai-fortune/usage?userId=${userId}&plan=${currentPlan}`)
      const usageData = await usageResponse.json()
      if (usageData.success) {
        currentUsage = usageData.count
        currentLimit = usageData.limit
        setAiFortuneUsage({ count: usageData.count, limit: usageData.limit })
        console.log("🔍 AI鑑定使用回数チェック:", { currentUsage, currentLimit, canUse: currentUsage < currentLimit })
      }
    } catch (error) {
      console.error("Failed to fetch latest AI fortune usage:", error)
      // エラー時は既存の状態を使用
    }

      // 使用回数チェック：使用可能回数（limit - count）が0以上の場合のみ鑑定可能
    const remainingCount = currentLimit - currentUsage
    if (remainingCount <= 0) {
      // 使用回数が0の場合
      if (currentPlan === "premium") {
        // プレミアムプラン：龍の息吹があれば使用を促す
        if (availableDragonBreathItems && availableDragonBreathItems.length > 0) {
          setShowPremiumDragonBreathDialog(true)
        } else {
          setAiFortune({
            success: false,
            error: `AI深層言霊鑑定は1日${currentLimit}回までです。龍の息吹を購入して回数を回復できます。`,
          })
        }
      } else {
        // 無料・ベーシックプラン：龍の息吹があれば使用を促す
        if (availableDragonBreathItems && availableDragonBreathItems.length > 0) {
          setShowConfirmDialog(true)
        } else {
          setAiFortune({
            success: false,
            error: "AI深層言霊鑑定はプレミアムプラン、または龍の息吹が必要です。",
          })
        }
      }
      return
    }

    // 実際の鑑定処理を実行
    await executeAiFortuneGeneration(nameAnalysisResult, gogyoResult, birthdate)
  }, [currentPlan, aiFortuneUsage, availableDragonBreathItems, executeAiFortuneGeneration])

  // 龍の息吹を使用してから鑑定を実行する関数
  const useDragonBreathAndGenerateFortune = useCallback(async (
    nameAnalysisResult: any,
    gogyoResult?: any,
    birthdate?: string
  ) => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) {
      setAiFortune({ success: false, error: "ログインが必要です" })
      return
    }

    if (!availableDragonBreathItems || availableDragonBreathItems.length === 0) {
      setAiFortune({ success: false, error: "龍の息吹がありません。" })
      setIsLoadingAiFortune(false)
      return
    }

    if (!availableDragonBreathItems[0] || !availableDragonBreathItems[0].id) {
      setAiFortune({ success: false, error: "龍の息吹の情報が不正です。" })
      setIsLoadingAiFortune(false)
      return
    }

    setIsLoadingAiFortune(true)

    try {
      // 龍の息吹を使用（プランはサーバー側でデータベースから取得）
      const useResponse = await fetch("/api/dragon-breath/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId: availableDragonBreathItems[0]?.id }),
      })
      const useResult = await useResponse.json()

      if (!useResult.success) {
        setAiFortune({ success: false, error: useResult.error || "龍の息吹の使用に失敗しました" })
        setIsLoadingAiFortune(false)
        return
      }

      // 使用成功したらアイテムリストを更新
      setAvailableDragonBreathItems(useResult.remainingItems || [])
      // 使用回数を更新（limit_per_dayが増える）
      setAiFortuneUsage(prev => ({ 
        ...prev, 
        count: useResult.count || prev.count,
        limit: useResult.limit || prev.limit
      }))

      // 龍の息吹使用後、鑑定を実行（使用回数チェックなしの関数を呼び出す）
      await executeAiFortuneGeneration(nameAnalysisResult, gogyoResult, birthdate)
    } catch (error: any) {
      console.error("❌ 龍の息吹使用エラー:", error)
      setAiFortune({ success: false, error: error.message || "龍の息吹の使用に失敗しました" })
      setIsLoadingAiFortune(false)
    }
  }, [availableDragonBreathItems, executeAiFortuneGeneration, setAvailableDragonBreathItems, setAiFortuneUsage, setAiFortune, setIsLoadingAiFortune])

  // 姓名判断結果が変更されたら、AI深層鑑定結果をリセット
  useEffect(() => {
    if (!results) {
      // 姓名判断結果がない場合は、AI鑑定結果もリセット
      if (aiFortune) {
        setAiFortune(null)
      }
      return
    }

    // 現在の姓名判断結果の氏名を取得
    const currentName = results.name || 
      (results.lastName && results.firstName 
        ? `${results.lastName}${results.firstName}` 
        : null)
    
    // 氏名が取得できない場合はスキップ
    if (!currentName) {
      return
    }
    
    // AI鑑定結果に保存されている氏名
    const aiFortuneName = aiFortune?.targetName

    // 氏名が一致しない場合は、AI鑑定結果をリセット
    if (aiFortuneName && aiFortuneName !== currentName) {
      console.log('[AI Fortune Reset] 姓名判断結果が変更されました。AI鑑定結果をリセットします。', {
        previousName: aiFortuneName,
        currentName: currentName,
      })
      setAiFortune(null)
    }
  }, [results, aiFortune])

  const handleCompanyAnalysis = useCallback(() => {
    try {
      // 社名鑑定専用の計算を実行
      const { analyzeCompanyName } = require("@/lib/company-name-analysis")
      
      const companyResult = analyzeCompanyName(companyName)
      
      console.log("社名分析結果:", companyResult)
      setCompanyResults(companyResult)

      if (usageTracker.incrementUsage("companyAnalysis")) {
        setUsageStatus(usageTracker.getUsageStatus())
      }
    } catch (error) {
      console.error("Error in company analysis:", error)
    }
  }, [companyName, usageTracker])

  const handlePdfExport = useCallback(
    (contentId: string, fileName: string) => {
      try {
        console.log("PDF出力:", contentId, fileName)
        if (usageTracker.incrementUsage("pdfExport")) {
          setUsageStatus(usageTracker.getUsageStatus())
        }
      } catch (error) {
        console.error("Error in PDF export:", error)
      }
    },
    [usageTracker],
  )

  const handlePlanChange = useCallback(
    (plan: "free" | "basic" | "premium") => {
      try {
        setCurrentPlan(plan)
        usageTracker.resetUsage()
        setUsageStatus(usageTracker.getUsageStatus())
      } catch (error) {
        console.error("Error changing plan:", error)
      }
    },
    [usageTracker],
  )

  const handleStartTrial = useCallback(() => {
    setIsInTrial(true)
    setTrialDaysRemaining(3)
  }, [])

  const getButtonClass = useCallback((isActive: boolean) => {
    return isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"
  }, [])

  // 使用状況の状態管理（Hydrationエラー対策）
  const [todayUsage, setTodayUsage] = useState(DEFAULT_USAGE)
  
  // クライアントサイドでのみ使用状況を更新
  useEffect(() => {
    try {
      if (usageStatus?.todayUsage) {
        setTodayUsage(usageStatus.todayUsage)
      }
    } catch (error) {
      console.error("Error setting today usage:", error)
    }
  }, [usageStatus])

  // 安全な使用状況取得
  const getTodayUsage = useCallback(() => {
    return todayUsage
  }, [todayUsage])

  // 六星占術の結果が更新されたときの処理 - 依存配列を最小限に
  useEffect(() => {
    try {
      if (sixStar) {
        let starType: StarPersonType

        if (sixStar.starType) {
          starType = normalizeStarPersonType(sixStar.starType)
        } else if (sixStar.star && sixStar.type) {
          const starTypeString = sixStar.star + "人" + sixStar.type
          starType = normalizeStarPersonType(starTypeString)
        } else {
          return
        }

        setSelectedStarType(starType)
        setCalculatedStarType(starType)
        setForceUpdateKey((prev) => prev + 1)
        setTabsKey((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error processing sixStar data:", error)
    }
  }, [sixStar]) // sixStarのみに依存

  // 生年月日が変更されたときの処理 - 依存配列を最小限に
  useEffect(() => {
    try {
      if (birthdate) {
        const dateObject = new Date(birthdate)
        if (!isNaN(dateObject.getTime())) {
          const calculatedStarType = calculateStarPersonFromBirthdate(dateObject)
          setSelectedStarType(calculatedStarType)
          setCalculatedStarType(calculatedStarType)
          setForceUpdateKey((prev) => prev + 1)
          setTabsKey((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error calculating star type:", error)
    }
  }, [birthdate]) // birthdateのみに依存

  // 使用状況の更新
  useEffect(() => {
    const updateUsageStatus = () => {
      try {
        setUsageStatus(usageTracker.getUsageStatus())
      } catch (error) {
        console.error("Error updating usage status:", error)
      }
    }

    const interval = setInterval(updateUsageStatus, 60000)
    return () => clearInterval(interval)
  }, [usageTracker])

  // メモ化された計算値
  const displayStarType = useMemo(() => {
    try {
      if (calculatedStarType) return calculatedStarType
      if (sixStar?.star && sixStar?.type) {
        return sixStar.star + "人" + sixStar.type
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating display star type:", error)
      return selectedStarType
    }
  }, [calculatedStarType, sixStar, selectedStarType])

  const starPersonForFortuneFlow = useMemo((): StarPersonType => {
    try {
      if (sixStar?.star && sixStar?.type) {
        const starTypeString = sixStar.star + "人" + sixStar.type
        return normalizeStarPersonType(starTypeString)
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating star person for fortune flow:", error)
      return selectedStarType
    }
  }, [sixStar, selectedStarType])

  const sixStarYearlyStarPerson = useMemo(() => {
    try {
      if (sixStar?.starType) return sixStar.starType
      if (sixStar?.star && sixStar?.type) {
        return sixStar.star + "人" + sixStar.type
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating six star yearly star person:", error)
      return selectedStarType
    }
  }, [sixStar, selectedStarType])

  // タブ切り替えハンドラー（プレビュー版対応）
  const handleTabChange = useCallback(
    (tabValue: string) => {
      // 詳細鑑定タブは無料プランでもアクセス可能（プレビュー版表示）
      // その他のタブは通常通り切り替え
      setActiveTab(tabValue)
    },
    [],
  )

  // 旧handleTabClick（互換性のため保持）
  const handleTabClick = useCallback(
    (tabValue: string, requiredPlan: "basic" | "premium") => {
      return (e: React.MouseEvent) => {
        try {
          const hasAccess =
            (requiredPlan === "basic" && (currentPlan === "basic" || currentPlan === "premium")) ||
            (requiredPlan === "premium" && currentPlan === "premium")

          if (!hasAccess) {
            e.preventDefault()
            e.stopPropagation()
            window.location.href = "/pricing"
          }
        } catch (error) {
          console.error("Error in tab click handler:", error)
        }
      }
    },
    [currentPlan],
  )

  // プラン表示用の情報
  const planInfo = useMemo(() => {
    try {
      if (isInTrial) {
        return {
          text: `プレミアム（トライアル残り${trialDaysRemaining}日）`,
          style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
        }
      }

      switch (currentPlan) {
        case "free":
          return {
            text: "無料プラン",
            style: "bg-gray-100 text-gray-700 border border-gray-300",
          }
        case "basic":
          return {
            text: "ベーシックプラン",
            style: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
          }
        case "premium":
          return {
            text: "プレミアムプラン",
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          }
        default:
          return {
            text: "プレミアムプラン",
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          }
      }
    } catch (error) {
      console.error("Error calculating plan info:", error)
      return {
        text: "プレミアムプラン",
        style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      }
    }
  }, [currentPlan, isInTrial, trialDaysRemaining])

  // ヒーロー右側のプラン表示は実サブスクに追従させる
  // ハイドレーションエラー回避のため、マウント後にのみ実際のプラン情報を取得
  const headerPlanInfo = useMemo(() => {
    // サーバーサイドレンダリング時やマウント前はデフォルト値を返す
    if (!mounted || typeof window === "undefined") {
      return {
        text: "無料プラン",
        style: "bg-gray-100 text-gray-700 border border-gray-300",
      }
    }

    try {
      const current = subscription.getCurrentPlan()
      const inTrial = subscription.isInTrial()
      const trialDays = subscription.getTrialDaysRemaining()

      if (inTrial) {
        return {
          text: `プレミアム（トライアル残り${trialDays}日）`,
          style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
        }
      }

      switch (current.id) {
        case "free":
          return {
            text: "無料プラン",
            style: "bg-gray-100 text-gray-700 border border-gray-300",
          }
        case "basic":
          return {
            text: "ベーシックプラン",
            style: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
          }
        case "premium":
          return {
            text: "プレミアムプラン",
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          }
        default:
          return {
            text: "無料プラン",
            style: "bg-gray-100 text-gray-700 border border-gray-300",
          }
      }
    } catch (e) {
      return {
        text: "無料プラン",
        style: "bg-gray-100 text-gray-700 border border-gray-300",
      }
    }
  }, [subscription, mounted])

  const handleHeaderPlanClick = useCallback(() => {
    try {
      const current = subscription.getCurrentPlan()
      if (current.id === "free") {
        window.location.href = "/pricing"
      } else {
        window.location.href = "/my-subscription"
      }
    } catch (e) {
      window.location.href = "/pricing"
    }
  }, [subscription])

  // DailyFortuneCardに渡すpropsを安定化
  const dailyFortuneProps = useMemo(() => {
    return {
      birthStar: sixStar || { star: "水星" as const, type: "+" as const },
      isPremium: currentPlan !== "free",
      premiumLevel: currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0,
    }
  }, [currentPlan, sixStar])

  return (
    <>
      {/* トライアルバナー */}
      {isInTrial && <TrialBanner daysRemaining={trialDaysRemaining} />}

      {/* アップグレード促進バナー（クライアントサイドでマウント後、かつサブスクリプション同期完了後にのみ表示） */}
      {mounted && subscriptionSynced && currentPlan === "free" && !isInTrial && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">🎉 今なら3日間無料トライアル！全機能をお試しください</span>
            <Link href="/pricing">
              <Button variant="secondary" size="sm" className="ml-4 bg-white text-purple-600 hover:bg-gray-100">
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="container mx-auto py-10 px-4 md:px-6 pb-16">
        {/* ヘッダー（モバイルは中央寄せ、md以上で左右配置） */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left mx-auto max-w-[22rem] sm:max-w-none">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-2">まいにちAI姓名判断</h1>
            <p className="text-muted-foreground md:max-w-[34rem] mx-auto md:mx-0">
              旧字体による正確な画数計算で、あなたの運命を詳しく鑑定
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end gap-3">
            <KanauPointsHeader />
            <Button variant="outline" className={headerPlanInfo.style} onClick={handleHeaderPlanClick}>
              <Settings className="h-4 w-4 mr-2" />
              {headerPlanInfo.text}
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* 開発環境用：デバッグコントロール */}
        {/* 開発用のデバッグコントロールは非表示化（モバイルの視認性優先） */}

        {/* セクション選択 */}
        <div className="mb-6">
          <div className="flex justify-between items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "fortune")}
              onClick={() => setActiveSection("fortune")}
            >
              姓名判断
            </Button>
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "compatibility")}
              onClick={() => setActiveSection("compatibility")}
            >
              相性診断
              {currentPlan === "free" && <LockIcon className="h-3 w-3 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "baby-naming")}
              onClick={() => setActiveSection("baby-naming")}
            >
              <Baby className="h-4 w-4 mr-2" />
              赤ちゃん名付け
              {currentPlan === "free" && <LockIcon className="h-3 w-3 ml-1" />}
            </Button>
          </div>

            {/* PDFダウンロードボタン：デスクトップのみ同じ行に配置 */}
          {results && (
              <div className="hidden md:block">
                {currentPlan === "free" ? (
              <Button disabled size="sm" className="whitespace-nowrap">
                <LockIcon className="h-4 w-4 mr-1" />
                PDF取得
              </Button>
            ) : (
              <PdfExportButton 
                contentId="results-content" 
                fileName={`姓名判断結果_${lastName}${firstName}`}
                buttonText="PDF取得"
              />
                )}
              </div>
            )}
          </div>

          {/* PDFダウンロードボタン：モバイルは別行に配置 */}
          {results && (
            <div className="mt-3 md:hidden">
              {currentPlan === "free" ? (
                <Button disabled size="sm" className="w-full">
                  <LockIcon className="h-4 w-4 mr-1" />
                  PDF取得
                </Button>
              ) : (
                <PdfExportButton 
                  contentId="results-content" 
                  fileName={`姓名判断結果_${lastName}${firstName}`}
                  buttonText="PDF取得"
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>

        {activeSection === "fortune" ? (
          <div className="grid gap-8 md:grid-cols-3">
            {/* メインコンテンツ */}
            <div className="md:col-span-2 order-1 md:order-2">
              {nameType === "person" ? (
                results ? (
                    <Tabs value={activeTab} onValueChange={handleTabChange} key={tabsKey.toString()}>
                      <div className="mb-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="simple">かんたん鑑定</TabsTrigger>
                          <TabsTrigger value="detailed">
                            {currentPlan === "free" && <LockIcon className="h-3 w-3 mr-1" />}
                            詳細鑑定
                          </TabsTrigger>
                          <TabsTrigger value="advanced">総合分析</TabsTrigger>
                          <TabsTrigger 
                            value="others" 
                            className="relative font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                          >
                            <Sparkles className="h-4 w-4 mr-1.5 animate-pulse" />
                            AI・格付け
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div id="results-content" ref={resultsRef}>
                        <TabsContent value="simple">
                          <SimpleAnalysisResult
                            results={results}
                            name={fullName}
                            gender={gender}
                            isPremium={currentPlan !== "free"}
                            premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                          />
                        </TabsContent>

                        <TabsContent value="detailed">
                          <NameAnalysisResult 
                            results={results} 
                            name={fullName} 
                            gender={gender} 
                            currentPlan={currentPlan}
                            advancedResults={advancedResults}
                          />
                          {/* 無料プランでのアップグレード誘導 */}
                          {currentPlan === "free" && (
                            <Card className="mt-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                              <CardContent className="pt-6 text-center py-8">
                                <LockIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-purple-800 mb-2">
                                  詳細な解説とアドバイスを見るには？
                                </h3>
                                <p className="text-sm text-purple-600 mb-4">
                                  ベーシックプラン以上で、各格の詳細な意味、運勢解説、
                                  改善アドバイス、五行バランス分析をご利用いただけます
                                </p>
                                <Button 
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                  asChild
                                >
                                  <Link href="/pricing">
                                    プランを確認する
                                  </Link>
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="advanced">
                          {advancedResults ? (
                            <div className="space-y-6">
                              {sixStar && <SixStarChart birthStar={sixStar} isPremium={currentPlan !== "free"} />}

                              {advancedResults.gogyoResult && (
                                <AdvancedFiveElementsChart
                                  gogyoResult={advancedResults.gogyoResult}
                                  isPremium={currentPlan === "premium"}
                                  isPro={currentPlan === "basic"}
                                />
                              )}
                            </div>
                          ) : (
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center py-8">
                                  <p>生年月日を入力すると、より詳細な総合分析が表示されます</p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="others">
                          <Card className="border-purple-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                              <CardTitle className="flex items-center gap-2 text-purple-800">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                AI・格付け機能
                              </CardTitle>
                              <CardDescription className="text-purple-600">
                                プレミアム機能をご利用いただけます
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 格付け・カード発行 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ranking")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">格付け・カード発行</h3>
                                        <p className="text-sm text-muted-foreground">名前の運勢の強さを数値化・カード発行</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <span className="text-xs px-2 py-1 rounded bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* AI深層言霊鑑定 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ai-personality")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">AI深層言霊鑑定</h3>
                                        <p className="text-sm text-muted-foreground">AIによる深層言霊鑑定</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <span className="text-xs px-2 py-1 rounded bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* 運気運行表 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("fortune-flow")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">運気運行表</h3>
                                        <p className="text-sm text-muted-foreground">年間の運気の流れ</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-xs px-2 py-1 rounded bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* 数秘術 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("numerology")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">数秘術</h3>
                                        <p className="text-sm text-muted-foreground">数字による運命分析</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan === "free" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-xs px-2 py-1 rounded bg-[#C4B5FD] text-[#4C1D95] dark:bg-[#6D28D9] dark:text-[#E9D5FF]">Basic</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* AI相性診断 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ai-compatibility")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">AI相性診断</h3>
                                        <p className="text-sm text-muted-foreground">AIによる相性分析</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <Sparkles className="h-4 w-4 text-pink-600" />
                                        <span className="text-xs px-2 py-1 rounded bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* アップグレード案内 */}
                                {currentPlan === "free" && (
                                  <Card className="md:col-span-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                                    <CardContent className="pt-6 text-center">
                                      <h3 className="font-semibold text-purple-800 mb-2">プレミアム機能をすべてお試しください</h3>
                                      <p className="text-sm text-purple-600 mb-4">3日間無料トライアルで全機能をご利用いただけます</p>
                                      <Button 
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                        onClick={() => handleStartTrial()}
                                      >
                                        無料で始める
                                      </Button>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* プレミアム機能のTabsContent（隠しタブとして保持） */}
                        <TabsContent value="ranking" style={{ display: activeTab === "ranking" ? "block" : "none" }}>
                          <NameRankingCard
                            lastName={lastName}
                            firstName={firstName}
                            gender={gender}
                            isPremium={currentPlan === "premium"} // プレミアムプランのみカーテン表示を有効化
                            premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                          />
                        </TabsContent>

                        <TabsContent value="numerology" style={{ display: activeTab === "numerology" ? "block" : "none" }}>
                          {(() => {
                            // birthdateが文字列の場合、Dateオブジェクトに変換
                            let birthdateObj: Date | undefined = undefined
                            if (birthdate) {
                              const dateObj = new Date(birthdate)
                              // 有効な日付かチェック
                              if (!isNaN(dateObj.getTime())) {
                                birthdateObj = dateObj
                              }
                            }

                            const numerologyResult = calculateNumerology(fullName, birthdateObj)
                            return (
                              <NumerologyResultComponent
                                result={numerologyResult}
                                name={fullName}
                                isPremium={currentPlan !== "free"}
                                premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                              />
                            )
                          })()}
                        </TabsContent>

                        <TabsContent value="fortune-flow" style={{ display: activeTab === "fortune-flow" ? "block" : "none" }}>
                          <FortuneFlowTable
                            starPerson={starPersonForFortuneFlow}
                            isPremium={currentPlan === "premium"}
                            key={forceUpdateKey}
                          />
                        </TabsContent>

                        {/* AI機能のTabsContent */}
                        <TabsContent value="ai-personality" style={{ display: activeTab === "ai-personality" ? "block" : "none" }}>
                          <Card className="border-purple-200 shadow-lg bg-gradient-to-b from-[#D7C4F3] to-[#F8F5FB] dark:border-purple-900 dark:from-[#1B102A] dark:via-[#120A1C] dark:to-[#08050D]">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b dark:from-purple-950/40 dark:to-pink-950/30 dark:border-purple-900">
                              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-100">
                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                AI深層言霊鑑定
                              </CardTitle>
                              <CardDescription className="text-purple-600 dark:text-purple-200">
                                AIがあなたの名前に宿る宿命と言霊を鑑定します
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {currentPlan === "free" || currentPlan === "basic" ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground dark:text-gray-400 mb-0.5">龍の息吹アイテム</p>
                                          <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                              {availableDragonBreathItems?.length || 0}
                                            </span>
                                            <span className="text-sm text-muted-foreground dark:text-gray-400">個所持</span>
                                          </div>
                                        </div>
                                      </div>
                                      {(availableDragonBreathItems?.length || 0) === 0 ? (
                                        <Link href="/shop/talisman?tab=yen">
                                          <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/30">
                                            <Sparkles className="h-4 w-4 mr-1" /> 購入
                                          </Button>
                                        </Link>
                                      ) : (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          所持中
                                        </Badge>
                                      )}
                                    </div>
                                    {!results ? (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を依頼するには、姓名判断を実行してください
                                        </p>
                                      </div>
                                    ) : (availableDragonBreathItems?.length || 0) === 0 ? (
                                      // 姓名判断済み、龍の息吹なし → ボタン無効化、メッセージ表示
                                      <div className="text-center py-8">
                                        <div className="p-4 bg-purple-50 rounded-lg mb-4 border border-purple-200 dark:bg-purple-950/20 dark:border-purple-800">
                                          <p className="text-purple-800 mb-2 font-semibold dark:text-purple-100">
                                            龍の息吹で{PLAN_USAGE_COUNTS[currentPlan as keyof typeof PLAN_USAGE_COUNTS] || 1}回AI鑑定が可能です
                                          </p>
                                          <p className="text-sm text-purple-600 mb-3 dark:text-purple-200">
                                            龍の息吹を所持していません。ショップで購入が可能です。
                                          </p>
                                        </div>
                                        <Link href="/shop/talisman?tab=yen">
                                          <Button 
                                            disabled
                                            className="bg-gray-400 text-white cursor-not-allowed dark:bg-gray-600"
                                          >
                                            <Sparkles className="h-4 w-4 mr-2" /> AI深層言霊鑑定を依頼（龍の息吹が必要）
                                          </Button>
                                        </Link>
                                      </div>
                                    ) : !aiFortune || !aiFortune.success ? (
                                      // 姓名判断済み、龍の息吹あり、結果未生成 → 生成ボタンを表示（確認ダイアログ付き）
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を依頼しますか？
                                        </p>
                                        <Button
                                          onClick={() => setShowConfirmDialog(true)}
                                          disabled={isLoadingAiFortune}
                                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                        >
                                          <Sparkles className="h-4 w-4 mr-2" /> {isLoadingAiFortune ? "ただいま鑑定中です..." : "AI深層言霊鑑定を依頼（龍の息吹使用）"}
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          残り: {availableDragonBreathItems?.length || 0}個
                                        </p>
                                        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>龍の息吹を使用しますか？</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {availableDragonBreathItems?.length || 0}個所持しています。1個使用しますか？
                                                <br />
                                                <span className="text-purple-600 font-semibold">
                                                  龍の息吹で{PLAN_USAGE_COUNTS[currentPlan as keyof typeof PLAN_USAGE_COUNTS] || 1}回AI鑑定が可能です。
                                                </span>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={async () => {
                                                  setShowConfirmDialog(false)
                                                  await useDragonBreathAndGenerateFortune(results, advancedResults.gogyoResult, birthdate || undefined)
                                                }}
                                                disabled={isLoadingAiFortune}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                              >
                                                {isLoadingAiFortune ? "ただいま鑑定中です..." : "使用する"}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    ) : isLoadingAiFortune ? (
                                      <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-purple-600 dark:text-purple-200">AI深層言霊鑑定を依頼中...</span>
                                      </div>
                                    ) : aiFortune?.success && aiFortune?.aiFortune ? (
                                      // 無料・ベーシックプランでも結果表示（プレミアムと同じ表示）
                                      <div className="space-y-6">
                                        {/* 生成ボタン（龍の息吹がある場合、再生成用） */}
                                        {(availableDragonBreathItems?.length || 0) > 0 && (
                                          <div className="text-center py-4">
                                            <Button
                                              onClick={() => setShowConfirmDialog(true)}
                                              disabled={isLoadingAiFortune}
                                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                            >
                                              <Sparkles className="h-4 w-4 mr-2" /> {isLoadingAiFortune ? "ただいま鑑定中です..." : `龍の息吹を使用して再生成 (${availableDragonBreathItems.length}個)`}
                                            </Button>
                                          </div>
                                        )}
                                        {/* メイン鑑定文（fortune）がある場合は最初に表示 */}
                                        {aiFortune.aiFortune.fortune && (
                                          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-900 dark:from-purple-950/40 dark:to-pink-950/20">
                                            <CardHeader className="pb-3">
                                              <CardTitle className="flex items-center gap-2 text-purple-800 text-lg dark:text-purple-100">
                                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                                AI深層言霊鑑定
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="border-t border-purple-100 dark:border-purple-900 pt-4">
                                              <div className="text-purple-900 text-base leading-relaxed dark:text-purple-50">
                                                {aiFortune.aiFortune.fortune?.split('\n\n').map((paragraph: string, index: number) => (
                                                  <p key={index} className={index > 0 ? 'mt-2' : ''}>
                                                    {paragraph}
                                                  </p>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {/* グリッドレイアウトでカードを表示 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* 深層心理的特徴 */}
                                          <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow dark:border-purple-900 dark:bg-purple-950/30">
                                            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30">
                                              <CardTitle className="flex items-center gap-2 text-purple-800 text-base dark:text-purple-100">
                                                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                                深層心理的特徴
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                              <p className="text-purple-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-purple-100">
                                                {aiFortune.aiFortune.personality || aiFortune.aiFortune.fortune || '分析結果を生成中です'}
                                              </p>
                                            </CardContent>
                                          </Card>

                                          {/* 潜在的な才能・適性 */}
                                          {aiFortune.aiFortune.talents && (
                                            <Card className="border-yellow-200 shadow-sm hover:shadow-md transition-shadow dark:border-yellow-900 dark:bg-yellow-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-amber-900/30">
                                                <CardTitle className="flex items-center gap-2 text-yellow-800 text-base dark:text-yellow-100">
                                                  <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                                                  潜在的な才能・適性
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-yellow-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-yellow-50">
                                                  {aiFortune.aiFortune.talents}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* 人生における課題と解決策 */}
                                          {aiFortune.aiFortune.challenges && (
                                            <Card className="border-orange-200 shadow-sm hover:shadow-md transition-shadow dark:border-orange-900 dark:bg-orange-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-amber-950/20">
                                                <CardTitle className="flex items-center gap-2 text-orange-800 text-base dark:text-orange-100">
                                                  <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                                  人生における課題と解決策
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-orange-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-orange-50">
                                                  {aiFortune.aiFortune.challenges}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* 具体的なアドバイス */}
                                          {aiFortune.aiFortune.advice && (
                                            <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow dark:border-green-900 dark:bg-emerald-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/20">
                                                <CardTitle className="flex items-center gap-2 text-green-800 text-base dark:text-green-100">
                                                  <Target className="h-4 w-4 text-green-600 dark:text-green-300" />
                                                  今日の開運アドバイス
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-green-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-green-50">
                                                  {aiFortune.aiFortune.advice}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </div>
                                        
                                        {/* シェアボタン */}
                                        {aiFortune && aiFortune.success && aiFortune.aiFortune && (
                                          <div className="mt-6">
                                            <ShareButtons
                                              shareContent={generateAiFortuneShareContent(aiFortune)}
                                              onShare={(platform) => {
                                                console.log(`AI鑑定結果を${platform}にシェアしました`)
                                              }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を依頼するには、姓名判断を実行してください
                                        </p>
                                        {aiFortune && !aiFortune.success && (
                                          <Alert className="mt-4">
                                            <AlertDescription className="text-red-600">
                                              エラー: {aiFortune.error || '不明なエラー'}
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* 龍の息吹アイテム所持数 */}
                                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                          <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-400">龍の息吹</p>
                                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                              {availableDragonBreathItems?.length || 0}個
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {/* AI鑑定残り回数 */}
                                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2">
                                          <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                          <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-400">AI鑑定</p>
                                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                              残り{Math.max(0, aiFortuneUsage.limit - aiFortuneUsage.count)}回
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      {aiFortuneUsage.count >= aiFortuneUsage.limit && (availableDragonBreathItems?.length || 0) === 0 && (
                                        <Link href="/shop/talisman?tab=yen">
                                          <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-950/40">
                                            <Sparkles className="h-4 w-4 mr-1" /> 龍の息吹を購入
                                          </Button>
                                        </Link>
                                      )}
                                      {aiFortuneUsage.count >= aiFortuneUsage.limit && (availableDragonBreathItems?.length || 0) > 0 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => generateAiFortune(results, advancedResults.gogyoResult, birthdate || undefined)}
                                          disabled={isLoadingAiFortune}
                                          className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-950/40"
                                        >
                                          <Sparkles className="h-4 w-4 mr-1" /> 龍の息吹を使用 ({availableDragonBreathItems.length}個)
                                        </Button>
                                      )}
                                    </div>
                                    {!results ? (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を依頼するには、姓名判断を実行してください
                                        </p>
                                      </div>
                                    ) : !aiFortune || !aiFortune.success ? (
                                      // 姓名判断済み、結果未生成 → 生成ボタンを表示
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を依頼しますか？
                                        </p>
                                        {/* 使用回数が0の場合、ボタンを無効化 */}
                                        <Button
                                          onClick={() => generateAiFortune(results, advancedResults.gogyoResult, birthdate || undefined)}
                                          disabled={isLoadingAiFortune || (aiFortuneUsage.limit - aiFortuneUsage.count <= 0)}
                                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <Sparkles className="h-4 w-4 mr-2" /> {isLoadingAiFortune ? "ただいま鑑定中です..." : "AI深層言霊鑑定を依頼"}
                                        </Button>
                                        {currentPlan === "premium" && (
                                          <div className="mt-4 space-y-2">
                                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                              AI鑑定残り回数: {Math.max(0, aiFortuneUsage.limit - aiFortuneUsage.count)}回
                                              {aiFortuneUsage.count >= aiFortuneUsage.limit && (availableDragonBreathItems?.length || 0) === 0 && (
                                                <span className="text-red-500 ml-2">（制限に達しています）</span>
                                              )}
                                            </p>
                                            {/* プレミアムプラン用の龍の息吹使用ボタン */}
                                            {aiFortuneUsage.count >= aiFortuneUsage.limit && (availableDragonBreathItems?.length || 0) > 0 && (
                                              <Button
                                                onClick={() => setShowPremiumDragonBreathDialog(true)}
                                                disabled={isLoadingAiFortune}
                                                className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-950/40"
                                              >
                                                <Sparkles className="h-4 w-4 mr-1" /> 龍の息吹を使用 ({availableDragonBreathItems?.length || 0}個)
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                        {/* プレミアムプラン用の龍の息吹使用確認モーダル */}
                                        <AlertDialog open={showPremiumDragonBreathDialog} onOpenChange={setShowPremiumDragonBreathDialog}>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>龍の息吹を使用しますか？</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {availableDragonBreathItems?.length || 0}個所持しています。1個使用しますか？
                                                <br />
                                                <span className="text-purple-600 font-semibold">
                                                  龍の息吹で{PLAN_USAGE_COUNTS[currentPlan as keyof typeof PLAN_USAGE_COUNTS] || 1}回AI鑑定が可能です。
                                                </span>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={async () => {
                                                  setShowPremiumDragonBreathDialog(false)
                                                  await useDragonBreathAndGenerateFortune(results, advancedResults.gogyoResult, birthdate || undefined)
                                                }}
                                                disabled={isLoadingAiFortune}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                              >
                                                {isLoadingAiFortune ? "処理中..." : "使用する"}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    ) : isLoadingAiFortune ? (
                                      <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-purple-600 dark:text-purple-200">AI深層言霊鑑定を依頼中...</span>
                                      </div>
                                    ) : aiFortune?.success && aiFortune?.aiFortune ? (
                                      <div className="space-y-6">
                                        {/* メイン鑑定文（fortune）がある場合は最初に表示 */}
                                        {aiFortune.aiFortune.fortune && (
                                          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-900 dark:from-purple-950/40 dark:to-pink-950/20">
                                            <CardHeader className="pb-3">
                                              <CardTitle className="flex items-center gap-2 text-purple-800 text-lg dark:text-purple-100">
                                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                                AI深層言霊鑑定
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="border-t border-purple-100 dark:border-purple-900 pt-4">
                                              <div className="text-purple-900 text-base leading-relaxed dark:text-purple-50">
                                                {aiFortune.aiFortune.fortune?.split('\n\n').map((paragraph: string, index: number) => (
                                                  <p key={index} className={index > 0 ? 'mt-2' : ''}>
                                                    {paragraph}
                                                  </p>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {/* グリッドレイアウトでカードを表示 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* 深層心理的特徴 */}
                                          <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow dark:border-purple-900 dark:bg-purple-950/30">
                                            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30">
                                              <CardTitle className="flex items-center gap-2 text-purple-800 text-base dark:text-purple-100">
                                                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                                深層心理的特徴
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                              <p className="text-purple-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-purple-100">
                                                {aiFortune.aiFortune.personality || aiFortune.aiFortune.fortune || '分析結果を生成中です'}
                                              </p>
                                            </CardContent>
                                          </Card>

                                          {/* 潜在的な才能・適性 */}
                                          {aiFortune.aiFortune.talents && (
                                            <Card className="border-yellow-200 shadow-sm hover:shadow-md transition-shadow dark:border-yellow-900 dark:bg-yellow-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-amber-900/30">
                                                <CardTitle className="flex items-center gap-2 text-yellow-800 text-base dark:text-yellow-100">
                                                  <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                                                  潜在的な才能・適性
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-yellow-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-yellow-50">
                                                  {aiFortune.aiFortune.talents}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* 人生における課題と解決策 */}
                                          {aiFortune.aiFortune.challenges && (
                                            <Card className="border-orange-200 shadow-sm hover:shadow-md transition-shadow dark:border-orange-900 dark:bg-orange-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-amber-950/20">
                                                <CardTitle className="flex items-center gap-2 text-orange-800 text-base dark:text-orange-100">
                                                  <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                                  人生における課題と解決策
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-orange-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-orange-50">
                                                  {aiFortune.aiFortune.challenges}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}

                                          {/* 具体的なアドバイス */}
                                          {aiFortune.aiFortune.advice && (
                                            <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow dark:border-green-900 dark:bg-emerald-950/30">
                                              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/20">
                                                <CardTitle className="flex items-center gap-2 text-green-800 text-base dark:text-green-100">
                                                  <Target className="h-4 w-4 text-green-600 dark:text-green-300" />
                                                  今日の開運アドバイス
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent className="pt-4">
                                                <p className="text-green-700 whitespace-pre-wrap leading-relaxed text-sm dark:text-green-50">
                                                  {aiFortune.aiFortune.advice}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </div>

                                        {/* ラッキー要素（フル幅） */}
                                        {aiFortune.aiFortune.luckyElement && (
                                          <Card className="border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:border-blue-900 dark:from-blue-950/40 dark:to-cyan-950/20">
                                            <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900">
                                              <CardTitle className="flex items-center gap-2 text-blue-800 text-base dark:text-blue-100">
                                                <Star className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                                ラッキー要素
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <p className="text-blue-700 font-medium text-base dark:text-blue-100">
                                                {aiFortune.aiFortune.luckyElement}
                                              </p>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {/* 使用された言霊（フル幅） */}
                                        {aiFortune.kotodama && aiFortune.kotodama.length > 0 && (
                                          <Card className="border-indigo-200 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-purple-950/30">
                                            <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900">
                                              <CardTitle className="flex items-center gap-2 text-indigo-800 text-base dark:text-indigo-100">
                                                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                                参考にした言霊
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-3">
                                                {aiFortune.kotodama.map((k: any, index: number) => (
                                                  <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800">
                                                    <span className="font-semibold text-indigo-700 text-sm dark:text-indigo-100">「{k.phrase_jp}」</span>
                                                    {k.advice_text && (
                                                      <span className="text-indigo-600 text-sm flex-1 dark:text-indigo-200">- {k.advice_text}</span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {/* シェアボタン */}
                                        {aiFortune && aiFortune.success && aiFortune.aiFortune && (
                                          <div className="mt-6">
                                            <ShareButtons
                                              shareContent={generateAiFortuneShareContent(aiFortune)}
                                              onShare={(platform) => {
                                                console.log(`AI鑑定結果を${platform}にシェアしました`)
                                              }}
                                            />
                                          </div>
                                        )}

                                        {/* 再分析ボタン（プレミアムプランのみ） */}
                                        {currentPlan === "premium" && (
                                          <div className="text-center pt-2">
                                            <Button 
                                              variant="outline"
                                              className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-purple-950/40"
                                              onClick={async () => {
                                                if (results && advancedResults?.gogyoResult) {
                                                  await generateAiFortune(
                                                    results,
                                                    advancedResults.gogyoResult,
                                                    birthdate || undefined
                                                  )
                                                }
                                              }}
                                            >
                                              <RefreshCw className="h-4 w-4 mr-2" />
                                              再分析
                                            </Button>
                                          </div>
                                        )}

                                        {/* 希味のイラスト画像 */}
                                        <div className="flex justify-center pt-6 pb-4">
                                          <img
                                            src="/images/Nozomi512x512.png"
                                            alt="金雨希味"
                                            className="w-[200px] md:w-[300px] h-auto opacity-80 hover:opacity-100 transition-opacity rounded-lg"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                          AI深層言霊鑑定を生成するには、姓名判断を実行してください
                                        </p>
                                        {aiFortune && !aiFortune.success && (
                                          <Alert className="mt-4">
                                            <AlertDescription className="text-red-600">
                                              エラー: {aiFortune.error || '不明なエラー'}
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="ai-compatibility" style={{ display: activeTab === "ai-compatibility" ? "block" : "none" }}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-pink-600" />
                                AI相性診断
                              </CardTitle>
                              <CardDescription>
                                AIがあなたとパートナーの相性を分析します
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8">
                                <div className="text-6xl mb-4">💕</div>
                                <h3 className="text-xl font-semibold mb-2">AI相性診断</h3>
                                <p className="text-muted-foreground mb-6">
                                  OpenAI GPT-4を使用した高度な相性分析機能です
                                </p>
                                {currentPlan !== "premium" ? (
                                  <div className="space-y-4">
                                    <div className="p-4 bg-pink-50 rounded-lg">
                                      <p className="text-pink-800">プレミアムプランでご利用いただけます</p>
                                    </div>
                                    <Button 
                                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                      onClick={() => handleStartTrial()}
                                    >
                                      3日間無料で始める
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    className="bg-pink-600 hover:bg-pink-700 text-white"
                                    onClick={() => {
                                      // AI分析の実行処理（後で実装）
                                      alert("AI相性診断機能は準備中です")
                                    }}
                                  >
                                    AI分析を実行
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </Tabs>
                  ) : (
                    // 結果がない時の説明・お知らせ表示
                    <div className="space-y-6">
                      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-purple-900/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 dark:text-blue-100">
                            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            このアプリについて
                          </CardTitle>
                          <CardDescription>
                            <span className="dark:text-blue-200">姓名判断・数秘術・六星占術を組み合わせた総合的な名前分析を行います</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 左側: テキストコンテンツ */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-2 dark:text-blue-100">主要機能</h3>
                                <ul className="space-y-2.5 text-sm text-muted-foreground dark:text-blue-200">
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>かんたん鑑定</strong>: 基本的な姓名判断結果を表示</span>
                                    <Badge variant="outline" className="text-xs shrink-0 dark:border-blue-700 dark:text-blue-200">全プラン</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>詳細鑑定</strong>: 天格・人格・地格・外格・総格の詳細分析</span>
                                    <Badge variant="outline" className="text-xs shrink-0 dark:border-blue-700 dark:text-blue-200">全プラン</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>総合分析</strong>: 六星占術・五行分析を含む高度な分析</span>
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-[#C4B5FD] text-[#4C1D95] dark:bg-[#6D28D9] dark:text-[#E9D5FF]">Basic</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>相性診断</strong>: パートナーとの相性を診断</span>
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-[#C4B5FD] text-[#4C1D95] dark:bg-[#6D28D9] dark:text-[#E9D5FF]">Basic</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>赤ちゃん名付け</strong>: 最適な名前候補をご提案</span>
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-[#C4B5FD] text-[#4C1D95] dark:bg-[#6D28D9] dark:text-[#E9D5FF]">Basic</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>おなまえ格付けランク表示</strong>: 名前の格付けとランクを表示</span>
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</Badge>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="flex-1">✓ <strong>AI深層言霊鑑定</strong>: AIによる深層心理分析と運命鑑定</span>
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</Badge>
                                  </li>
                                </ul>
                              </div>
                              <div className="pt-4 border-t dark:border-blue-800">
                                <h3 className="font-semibold mb-2 dark:text-blue-100">💡 使い方</h3>
                                <p className="text-sm text-muted-foreground dark:text-blue-200">
                                  左側のフォームに「姓」と「名」を入力して「姓名判断を実行」ボタンをクリックしてください。
                                  生年月日を入力すると、より詳細な分析結果が表示されます。
                                </p>
                              </div>
                            </div>
                            {/* 右側: 希味の画像 */}
                            <div className="flex flex-col items-center justify-center">
                              <p className="text-xs text-muted-foreground dark:text-gray-400 mb-2 text-center">
                                あなたの名前には、未来をひらく力が宿っています
                              </p>
                              <div className="relative w-full max-w-xs aspect-square">
                                <img
                                  src="/images/NozomiTop.webp"
                                  alt="金雨希味"
                                  className="w-full h-full object-contain rounded-lg opacity-90 hover:opacity-100 transition-opacity"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2 text-center">
                                ナビゲーター・言霊の巫女　金雨希味（かなうのぞみ）
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-800 dark:bg-gradient-to-r dark:from-yellow-900/30 dark:to-orange-900/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 dark:text-yellow-100">
                            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            お知らせ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-3 bg-white/50 rounded-lg dark:bg-yellow-900/20 dark:border dark:border-yellow-800/50">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm dark:text-yellow-100">🎉 カナウポイントシステム開始！</h4>
                              <Badge variant="outline" className="text-xs dark:border-yellow-700 dark:text-yellow-200">全プラン</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-yellow-200">
                              各種分析を実行するとKpを獲得できます。1日最大5Kpまで獲得可能です。
                              ログインボーナスも毎日受け取れます！
                            </p>
                          </div>
                          <div className="p-3 bg-white/50 rounded-lg dark:bg-yellow-900/20 dark:border dark:border-yellow-800/50">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm dark:text-yellow-100">📊 ランキング機能</h4>
                              <Badge variant="secondary" className="text-xs bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]">Premium</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-yellow-200">
                              名前の格付けをランキングに登録して、季節ごとの順位を競いましょう。
                              プレミアム会員は5Kpでランキングに登録できます。
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                ) : companyResults ? (
                  <CompanyNameResult result={companyResults} companyName={companyName} />
                ) : (
                  // 会社名分析の説明
                  <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        会社名鑑定について
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        会社名・商品名の姓名判断分析を行います
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">機能</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-300">
                          <li>✓ 会社名の格数分析</li>
                          <li>✓ 運勢判定（大吉・吉・凶など）</li>
                          <li>✓ 経営運勢の評価</li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-muted-foreground dark:text-gray-300">
                          左側のフォームに会社名を入力して「会社名鑑定を実行」ボタンをクリックしてください。
                          「株式会社」「有限会社」などの法人格は除いて入力してください。
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6 order-2 md:order-1">
              {/* 入力フォーム */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {nameType === "person" ? "個人名鑑定" : "会社名鑑定"}
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={getButtonClass(nameType === "person")}
                        onClick={() => setNameType("person")}
                      >
                        個人名
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={getButtonClass(nameType === "company")}
                        onClick={() => setNameType("company")}
                      >
                        会社名
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {nameType === "person"
                      ? "お名前と生年月日を入力してください"
                      : "会社名を入力してください（法人格は除く）"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nameType === "person" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lastName">姓</Label>
                          <Input
                            id="lastName"
                            placeholder="山田"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="firstName">名</Label>
                          <Input
                            id="firstName"
                            placeholder="太郎"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>性別</Label>
                        <RadioGroup value={gender} onValueChange={handleGenderChange} className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">男性</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">女性</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="birthdate">生年月日（任意）</Label>
                        <Input
                          id="birthdate"
                          type="date"
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          生年月日を入力すると、六星占術による運気分析も表示されます
                        </p>
                      </div>

                      <Button onClick={handlePersonalAnalysis} className="w-full" disabled={!lastName || !firstName}>
                        姓名判断を実行
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="companyName">会社名</Label>
                        <Input
                          id="companyName"
                          placeholder="例：トヨタ自動車"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          「株式会社」「有限会社」などの法人格は除いて入力してください
                        </p>
                      </div>

                      <Button onClick={handleCompanyAnalysis} className="w-full" disabled={!companyName}>
                        会社名鑑定を実行
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 縦書き表示 */}
              {(lastName || firstName) && (
                <Card>
                  <CardHeader>
                    <CardTitle>縦書き表示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemoizedVerticalNameDisplay lastName={lastName} firstName={firstName} />
                  </CardContent>
                </Card>
              )}

              {/* 社名鑑定の縦書き表示 */}
              {companyName && nameType === "company" && (
                <Card>
                  <CardHeader>
                    <CardTitle>縦書き表示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemoizedVerticalNameDisplay name={companyName} />
                  </CardContent>
                </Card>
              )}

              {/* 今日の運勢 */}
              {sixStar && (
                <Card>
                  <CardHeader>
                    <CardTitle>今日の運勢</CardTitle>
                    <CardDescription>
                      {displayStarType}の{new Date().toLocaleDateString("ja-JP")}の運勢
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemoizedDailyFortuneCard {...dailyFortuneProps} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : activeSection === "compatibility" ? (
          <div className="max-w-4xl mx-auto">
            <CompatibilityAnalyzer
              myName={lastName && firstName ? { lastName, firstName } : undefined}
              myGender={gender}
              myBirthdate={birthdate ? new Date(birthdate) : undefined}
              isPremium={currentPlan !== "free"}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <BabyNamingTool
              isPremium={currentPlan !== "free"}
              premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
            />
          </div>
        )}
      </main>
    </>
  )
}
