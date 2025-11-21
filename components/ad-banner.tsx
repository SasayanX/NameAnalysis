"use client"

import { useEffect, useRef, useState } from "react"
import { GooglePlayBillingDetector } from "@/lib/google-play-billing-detector"
import { SubscriptionManager } from "@/lib/subscription-manager"

interface AdBannerProps {
  className?: string
  placement?: "top" | "bottom" | "inline"
}

export function AdBanner({ className = "", placement = "bottom" }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)
  const [shouldShowAd, setShouldShowAd] = useState(false)
  const isTWA = GooglePlayBillingDetector.isTWAEnvironment()

  useEffect(() => {
    // サブスクリプション状態を確認
    const subscriptionManager = SubscriptionManager.getInstance()
    const subscription = subscriptionManager.getSubscriptionInfo()
    
    // 無料プランの場合のみ広告を表示
    // ベーシック・プレミアムプランでは完全に広告を非表示（プレミアムは完全広告非表示）
    if (subscription.plan === "free") {
      setShouldShowAd(true)
    } else {
      // basic、premiumプランでは広告を表示しない
      setShouldShowAd(false)
      return
    }

    // 既に広告が読み込まれている場合はスキップ
    if (adLoadedRef.current || !adContainerRef.current) {
      return
    }

    const loadAd = async () => {
      try {
        if (isTWA) {
          // TWA環境: AdMob広告を表示
          await loadAdMobAd(adContainerRef.current!)
        } else {
          // ウェブ環境: AdSense広告を表示
          await loadAdSenseAd(adContainerRef.current!)
        }
        adLoadedRef.current = true
      } catch (error) {
        console.error("Failed to load ad:", error)
      }
    }

    loadAd()
  }, [isTWA])

  // 有料プラン（basic、premium）の場合は何も表示しない
  // プレミアムプランは完全広告非表示
  if (!shouldShowAd) {
    return null
  }

  return (
    <div
      ref={adContainerRef}
      className={`ad-container ${className}`}
      style={{
        minHeight: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* 広告が読み込まれるまでのプレースホルダー */}
      {!adLoadedRef.current && (
        <p className="text-sm text-gray-400">広告読み込み中...</p>
      )}
    </div>
  )
}

/**
 * AdMob広告を読み込む（TWA環境用）
 */
async function loadAdMobAd(container: HTMLElement) {
  if (typeof window === "undefined") return

  // Android WebView経由でAdMob広告を表示
  // window.Android は TWA の Android 側で定義される必要があります
  if ((window as any).Android && typeof (window as any).Android.showAdBanner === "function") {
    try {
      // Android側のメソッドを呼び出して広告を表示
      ;(window as any).Android.showAdBanner(container.id || "ad-banner")
    } catch (error) {
      console.error("Failed to show AdMob ad:", error)
      // フォールバック: プレースホルダーを表示
      container.innerHTML = '<div class="text-sm text-gray-400">AdMob広告</div>'
    }
  } else {
    // Android側のメソッドが利用できない場合のフォールバック
    container.innerHTML = '<div class="text-sm text-gray-400">AdMob広告（TWA環境）</div>'
  }
}

/**
 * AdSense広告を読み込む（ウェブ環境用）
 */
async function loadAdSenseAd(container: HTMLElement) {
  if (typeof window === "undefined") return

  // AdSenseの広告ユニットID（環境変数から取得）
  const adSenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXX"
  const adSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || "XXXXXXXXXX"

  // AdSenseスクリプトが既に読み込まれているか確認
  if (!(window as any).adsbygoogle) {
    // AdSenseスクリプトを動的に読み込む
    const script = document.createElement("script")
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClientId}`
    script.async = true
    script.crossOrigin = "anonymous"
    document.head.appendChild(script)

    // スクリプトの読み込みを待つ
    await new Promise((resolve) => {
      script.onload = resolve
      script.onerror = resolve // エラーでも続行
    })
  }

  // 広告ユニットを作成
  const adElement = document.createElement("ins")
  adElement.className = "adsbygoogle"
  adElement.style.display = "block"
  adElement.setAttribute("data-ad-client", adSenseClientId)
  adElement.setAttribute("data-ad-slot", adSlotId)
  adElement.setAttribute("data-ad-format", "auto")
  adElement.setAttribute("data-full-width-responsive", "true")

  container.innerHTML = ""
  container.appendChild(adElement)

  // AdSense広告をプッシュ
  try {
    if ((window as any).adsbygoogle) {
      ;(window as any).adsbygoogle.push({})
    }
  } catch (error) {
    console.error("Failed to push AdSense ad:", error)
  }
}

