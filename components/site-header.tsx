"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { BookOpen, CreditCard, Settings, Gift, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/lib/subscription-manager"
import { KanauPointsHeader } from "@/components/kanau-points-header"
import { useState, useEffect } from "react"

export function SiteHeader() {
  const subscription = useSubscription()
  const [planInfo, setPlanInfo] = useState({
    text: "無料プラン",
    style: "bg-gray-100 text-gray-700 border border-gray-300",
  })

  useEffect(() => {
    const updatePlanInfo = () => {
      try {
        const currentPlan = subscription.getCurrentPlan()
        const isInTrial = subscription.isInTrial()
        const trialDays = subscription.getTrialDaysRemaining()

        if (isInTrial) {
          setPlanInfo({
            text: `プレミアム（トライアル残り${trialDays}日）`,
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          })
        } else {
          switch (currentPlan.id) {
            case "free":
              setPlanInfo({
                text: "無料プラン",
                style: "bg-gray-100 text-gray-700 border border-gray-300",
              })
              break
            case "basic":
              setPlanInfo({
                text: "ベーシックプラン",
                style: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
              })
              break
            case "premium":
              setPlanInfo({
                text: "プレミアムプラン",
                style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
              })
              break
            default:
              setPlanInfo({
                text: "無料プラン",
                style: "bg-gray-100 text-gray-700 border border-gray-300",
              })
          }
        }
      } catch (error) {
        console.error("Error getting plan info:", error)
        setPlanInfo({
          text: "無料プラン",
          style: "bg-gray-100 text-gray-700 border border-gray-300",
        })
      }
    }

    updatePlanInfo()
  }, [subscription.getCurrentPlan, subscription.isInTrial, subscription.getTrialDaysRemaining])

  const handlePlanClick = () => {
    const currentPlan = subscription.getCurrentPlan()
    if (currentPlan.id === "free") {
      // 無料プランの場合は料金ページに遷移
      window.location.href = "/pricing"
    } else {
      // 有料プランの場合はサブスクリプション管理ページに遷移
      window.location.href = "/my-subscription"
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            {/* モバイル時はサイトアイコンのみ */}
            <Image src="/images/mainichi.png" alt="まいにち姓名判断" width={48} height={48} className="sm:hidden" />
            {/* デスクトップ時はフルタイトル */}
            <span className="hidden sm:inline-block font-bold text-lg">まいにちの運勢もわかる姓名判断アプリ</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/articles"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">コラム</span>
              <span className="sm:hidden">記事</span>
            </Link>
            <Link
              href="/amulets-exchange"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">お守り交換所</span>
              <span className="sm:hidden">お守り</span>
            </Link>
            <Link
              href="/point-shop"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">ポイントショップ</span>
              <span className="sm:hidden">ショップ</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">料金プラン</span>
              <span className="sm:hidden">料金</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <KanauPointsHeader />
          <Button variant="outline" className={planInfo.style} onClick={handlePlanClick}>
            <Settings className="h-4 w-4 mr-2" />
            {planInfo.text}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
