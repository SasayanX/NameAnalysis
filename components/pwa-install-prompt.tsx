"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // モバイル判定
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // 前回閉じた時間をチェック（24時間以内なら表示しない）
    const lastDismissed = localStorage.getItem("pwa-install-dismissed")
    if (lastDismissed) {
      const dismissedTime = new Date(lastDismissed).getTime()
      const now = new Date().getTime()
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        return
      }
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // 少し遅延してから表示（ユーザーがページに慣れてから）
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("PWAインストールが承認されました")
      } else {
        console.log("PWAインストールが拒否されました")
      }
    } catch (error) {
      console.error("PWAインストールエラー:", error)
    }

    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    // 閉じた時間を記録
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-500">
      <Card className="w-80 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isMobile ? (
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
              <h3 className="font-bold text-blue-900 dark:text-blue-100">アプリをインストール</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
            {isMobile
              ? "ホーム画面に追加して、いつでも簡単に姓名判断ができます！"
              : "デスクトップにインストールして、ブラウザを開かずに姓名判断ができます！"}
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Download className="mr-2 h-4 w-4" />
              インストール
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              後で
            </Button>
          </div>

          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center">📱 オフラインでも利用可能</div>
        </CardContent>
      </Card>
    </div>
  )
}
