"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard } from "lucide-react"

export function PaymentReminder() {
  const [lastPayment, setLastPayment] = useState<string | null>(null)
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0)

  useEffect(() => {
    // ローカルストレージから最後の支払い日を取得
    const payment = localStorage.getItem("lastPaymentDate")
    if (payment) {
      setLastPayment(payment)
      const paymentDate = new Date(payment)
      const expiryDate = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30日後
      const today = new Date()
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntilExpiry(diffDays)
    }
  }, [])

  if (!lastPayment || daysUntilExpiry <= 0) {
    return null
  }

  const isExpiringSoon = daysUntilExpiry <= 7

  return (
    <Card className={`${isExpiringSoon ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className={`h-5 w-5 ${isExpiringSoon ? "text-red-600" : "text-blue-600"}`} />
            <div>
              <p className={`font-medium ${isExpiringSoon ? "text-red-800" : "text-blue-800"}`}>
                プラン期限まで残り{daysUntilExpiry}日
              </p>
              <p className="text-sm text-gray-600">最終支払い: {new Date(lastPayment).toLocaleDateString()}</p>
            </div>
          </div>

          {isExpiringSoon && (
            <div className="text-right">
              <Badge className="bg-red-600 mb-2">期限間近</Badge>
              <br />
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <CreditCard className="h-4 w-4 mr-1" />
                更新する
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
