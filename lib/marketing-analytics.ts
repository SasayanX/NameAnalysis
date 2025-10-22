// マーケティング分析とA/Bテスト用のユーティリティ

export interface UserBehavior {
  userId: string
  action: string
  timestamp: Date
  metadata?: Record<string, any>
}

export class MarketingAnalytics {
  private static instance: MarketingAnalytics
  private behaviors: UserBehavior[] = []

  static getInstance(): MarketingAnalytics {
    if (!MarketingAnalytics.instance) {
      MarketingAnalytics.instance = new MarketingAnalytics()
    }
    return MarketingAnalytics.instance
  }

  // ユーザー行動を記録
  trackBehavior(userId: string, action: string, metadata?: Record<string, any>) {
    this.behaviors.push({
      userId,
      action,
      timestamp: new Date(),
      metadata,
    })

    // 重要なイベントはすぐに送信
    if (this.isImportantEvent(action)) {
      this.sendToAnalytics({ userId, action, metadata })
    }
  }

  // 重要なイベントかどうか判定
  private isImportantEvent(action: string): boolean {
    const importantEvents = ["premium_upgrade", "share_result", "invite_friend", "complete_analysis"]
    return importantEvents.includes(action)
  }

  // 分析データを外部サービスに送信
  private async sendToAnalytics(data: any) {
    try {
      // Google Analytics、Mixpanel、独自サーバーなどに送信
      console.log("Sending analytics:", data)

      // 実装例：
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // })
    } catch (error) {
      console.error("Analytics error:", error)
    }
  }

  // コンバージョン率を計算
  getConversionRate(fromAction: string, toAction: string): number {
    const fromCount = this.behaviors.filter((b) => b.action === fromAction).length
    const toCount = this.behaviors.filter((b) => b.action === toAction).length

    return fromCount > 0 ? (toCount / fromCount) * 100 : 0
  }

  // A/Bテスト用のバリアント決定
  getABTestVariant(testName: string, userId: string): "A" | "B" {
    // ユーザーIDのハッシュ値で決定（一貫性を保つ）
    const hash = this.simpleHash(userId + testName)
    return hash % 2 === 0 ? "A" : "B"
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 32bit整数に変換
    }
    return Math.abs(hash)
  }
}

// 使用例
export const analytics = MarketingAnalytics.getInstance()

// イベント追跡用のヘルパー関数
export const trackEvent = (action: string, metadata?: Record<string, any>) => {
  const userId = localStorage.getItem("userId") || "anonymous"
  analytics.trackBehavior(userId, action, metadata)
}
