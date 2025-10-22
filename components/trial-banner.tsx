"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, X } from "lucide-react"
import Link from "next/link"
import { SubscriptionManager } from "@/lib/subscription-manager"

export function TrialBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [trialDays, setTrialDays] = useState(0)
  const [isInTrial, setIsInTrial] = useState(false)

  useEffect(() => {
    const subscriptionManager = SubscriptionManager.getInstance()
    const inTrial = subscriptionManager.isInTrial()
    const daysRemaining = subscriptionManager.getTrialDaysRemaining()

    setIsInTrial(inTrial)
    setTrialDays(daysRemaining)
    setIsVisible(inTrial && daysRemaining > 0)
  }, [])

  if (!isVisible) return null

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-purple-900">プレミアム無料体験中！</div>
              <div className="text-sm text-purple-700">残り{trialDays}日でトライアル終了です</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                プランを選ぶ
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
