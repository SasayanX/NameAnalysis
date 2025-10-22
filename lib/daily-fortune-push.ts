// 本日の運勢プッシュ通知システム（実装プレビュー）

export interface DailyFortuneNotification {
  userId: string
  date: string
  fortune: {
    overall: string
    lucky: {
      color: string
      number: number
      direction: string
      time: string
    }
    advice: string
    score: number
  }
  scheduledTime: string
  delivered: boolean
}

export class DailyFortunePushSystem {
  private static instance: DailyFortunePushSystem

  static getInstance(): DailyFortunePushSystem {
    if (!DailyFortunePushSystem.instance) {
      DailyFortunePushSystem.instance = new DailyFortunePushSystem()
    }
    return DailyFortunePushSystem.instance
  }

  // 通知許可リクエスト
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("このブラウザは通知をサポートしていません")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  // Service Worker登録
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("このブラウザはService Workerをサポートしていません")
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return null
    }
  }

  // 日次運勢計算
  calculateDailyFortune(userName: string, date: Date): DailyFortuneNotification["fortune"] {
    // 名前と日付に基づく運勢計算ロジック
    const nameValue = this.calculateNameValue(userName)
    const dateValue = this.calculateDateValue(date)
    const combinedValue = (nameValue + dateValue) % 100

    const fortunes = [
      "今日は新しいチャンスに恵まれる日です",
      "人間関係で良い出会いがありそうです",
      "創造性が高まり、アイデアが浮かびやすい日",
      "安定した一日を過ごせるでしょう",
      "変化を恐れず、新しいことに挑戦してみて",
    ]

    const colors = ["赤", "青", "黄", "緑", "紫", "オレンジ", "ピンク"]
    const directions = ["北", "南", "東", "西", "北東", "北西", "南東", "南西"]
    const times = ["午前", "午後", "夕方", "夜"]

    return {
      overall: fortunes[combinedValue % fortunes.length],
      lucky: {
        color: colors[combinedValue % colors.length],
        number: (combinedValue % 9) + 1,
        direction: directions[combinedValue % directions.length],
        time: times[combinedValue % times.length],
      },
      advice: "今日のラッキーカラーを身につけて、積極的に行動しましょう",
      score: Math.min(Math.max(combinedValue, 20), 95),
    }
  }

  // 通知スケジューリング
  async scheduleDailyNotification(userName: string, notificationTime: { hour: number; minute: number }): Promise<void> {
    const registration = await this.registerServiceWorker()
    if (!registration) return

    // 明日の通知をスケジュール
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(notificationTime.hour, notificationTime.minute, 0, 0)

    const fortune = this.calculateDailyFortune(userName, tomorrow)

    const notificationData = {
      title: `${userName}さんの今日の運勢`,
      body: `${fortune.overall}\nラッキーカラー: ${fortune.lucky.color}`,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      data: {
        fortune,
        url: "/",
      },
    }

    // Service Workerに通知データを送信
    if (registration.active) {
      registration.active.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        data: notificationData,
        scheduledTime: tomorrow.getTime(),
      })
    }
  }

  // ヘルパーメソッド
  private calculateNameValue(name: string): number {
    return Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  }

  private calculateDateValue(date: Date): number {
    return date.getFullYear() + date.getMonth() + date.getDate()
  }

  // 通知設定の保存
  saveNotificationSettings(settings: {
    enabled: boolean
    time: { hour: number; minute: number }
    userName: string
  }): void {
    localStorage.setItem("dailyFortuneNotificationSettings", JSON.stringify(settings))
  }

  // 通知設定の読み込み
  loadNotificationSettings(): {
    enabled: boolean
    time: { hour: number; minute: number }
    userName: string
  } | null {
    const stored = localStorage.getItem("dailyFortuneNotificationSettings")
    return stored ? JSON.parse(stored) : null
  }
}

// 使用例
export const dailyFortunePush = DailyFortunePushSystem.getInstance()
