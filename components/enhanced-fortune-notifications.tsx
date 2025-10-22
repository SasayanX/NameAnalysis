"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Star, Zap } from "lucide-react"
import { SubscriptionManager } from "@/lib/subscription-manager"

interface NotificationSettings {
  morningFortune: boolean
  importantDays: boolean
  hourlyFortune: boolean
  weeklyFortune: boolean
}

export function EnhancedFortuneNotifications() {
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [settings, setSettings] = useState<NotificationSettings>({
    morningFortune: false,
    importantDays: false,
    hourlyFortune: false,
    weeklyFortune: false,
  })
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    const subscriptionManager = SubscriptionManager.getInstance()
    setCurrentPlan(subscriptionManager.getCurrentPlan())

    // 通知許可状態を確認
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    // 保存された設定を読み込み
    const saved = localStorage.getItem("notificationSettings")
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))

    // 実際の通知スケジュールを設定
    if (value && notificationPermission === "granted") {
      scheduleNotification(key)
    }
  }

  const scheduleNotification = (type: keyof NotificationSettings) => {
    // 実際の通知スケジューリング（Service Workerで実装）
    console.log(`Scheduling ${type} notifications`)
  }

  const notificationTypes = [
    {
      key: "morningFortune" as keyof NotificationSettings,
      title: "毎朝の運勢通知",
      description: "毎朝8時に今日の運勢をお届け",
      icon: <Bell className="h-5 w-5" />,
      requiredPlan: "basic",
      badge: "ベーシック",
    },
    {
      key: "importantDays" as keyof NotificationSettings,
      title: "重要日アラート",
      description: "運気の変わり目や重要な日をお知らせ",
      icon: <Star className="h-5 w-5" />,
      requiredPlan: "premium",
      badge: "プレミアム",
    },
    {
      key: "hourlyFortune" as keyof NotificationSettings,
      title: "時間帯別運勢",
      description: "時間帯ごとの運勢変化をお知らせ",
      icon: <Clock className="h-5 w-5" />,
      requiredPlan: "premium",
      badge: "プレミアム",
    },
    {
      key: "weeklyFortune" as keyof NotificationSettings,
      title: "週間運勢サマリー",
      description: "毎週月曜日に1週間の運勢をお届け",
      icon: <Zap className="h-5 w-5" />,
      requiredPlan: "basic",
      badge: "ベーシック",
    },
  ]

  const canUseFeature = (requiredPlan: string) => {
    const planHierarchy = { free: 0, basic: 1, premium: 2 }
    return (
      planHierarchy[currentPlan as keyof typeof planHierarchy] >=
      planHierarchy[requiredPlan as keyof typeof planHierarchy]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            運勢通知設定
          </CardTitle>
          <CardDescription>あなたの運勢を最適なタイミングでお知らせします</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationPermission !== "granted" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-800">通知を有効にする</div>
                  <div className="text-sm text-yellow-700">運勢通知を受け取るには、ブラウザの通知許可が必要です</div>
                </div>
                <Button onClick={requestNotificationPermission} size="sm">
                  許可する
                </Button>
              </div>
            </div>
          )}

          {notificationTypes.map((type) => {
            const canUse = canUseFeature(type.requiredPlan)
            const isEnabled = settings[type.key] && canUse && notificationPermission === "granted"

            return (
              <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${canUse ? "bg-blue-100" : "bg-gray-100"}`}>{type.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{type.title}</span>
                      <Badge variant={canUse ? "default" : "secondary"}>{type.badge}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateSetting(type.key, checked)}
                  disabled={!canUse || notificationPermission !== "granted"}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {currentPlan === "free" && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">もっと多くの通知を受け取りませんか？</h3>
            <p className="text-muted-foreground mb-4">
              ベーシック・プレミアムプランで、より詳細な運勢通知をお楽しみください
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">プランをアップグレード</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
