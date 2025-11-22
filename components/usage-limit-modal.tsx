"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  currentPlan: string
  limit: number
  upgradeMessage: string
}

export function UsageLimitModal({
  isOpen,
  onClose,
  feature,
  currentPlan,
  limit,
  upgradeMessage,
}: UsageLimitModalProps) {
  const getRecommendedPlan = () => {
    if (currentPlan === "free") {
      return { name: "ベーシック", price: "330円/月", icon: <Zap className="h-5 w-5" /> }
    }
    return { name: "プレミアム", price: "550円/月", icon: <Crown className="h-5 w-5" /> }
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <ArrowRight className="h-4 w-4 text-orange-600" />
            </div>
            利用制限に達しました
          </DialogTitle>
          <DialogDescription className="text-left">
            {upgradeMessage.split('<br/>').map((line, index, array) => (
              <span key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現在の制限状況 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">今日の利用状況</span>
              <Badge variant="secondary">
                {limit}/{limit}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full w-full"></div>
            </div>
          </div>

          {/* おすすめプラン */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {recommendedPlan.icon}
                <span className="font-medium">{recommendedPlan.name}プラン</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{recommendedPlan.price}</span>
            </div>
            <p className="text-sm text-blue-700">
              {feature === "companyAnalysis" && currentPlan === "free" && "1日5回まで利用可能"}
              {feature === "companyAnalysis" && currentPlan === "basic" && "無制限で利用可能"}
              {feature === "personalAnalysis" && "無制限で利用可能"}
              {feature === "compatibilityAnalysis" && currentPlan === "free" && "1日10回まで利用可能"}
              {feature === "compatibilityAnalysis" && currentPlan === "basic" && "無制限で利用可能"}
              {feature === "pdfExport" && currentPlan === "free" && "1日1回まで利用可能"}
              {feature === "pdfExport" && currentPlan === "basic" && "無制限で利用可能"}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            後で
          </Button>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">プランを見る</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
