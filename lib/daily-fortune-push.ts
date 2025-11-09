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

export type NotificationTime = {
  hour: number
  minute: number
}

export const DEFAULT_NOTIFICATION_TIME: NotificationTime = { hour: 8, minute: 0 }

interface StoredNotificationSettings {
  enabled: boolean
  time: NotificationTime
  userName: string
}

type NotificationPayload = {
  title: string
  options: NotificationOptions
}

export class DailyFortunePushSystem {
  private static instance: DailyFortunePushSystem

  private readonly settingsStorageKey = "dailyFortuneNotificationSettings"
  private notificationTimer: ReturnType<typeof setTimeout> | null = null
  private currentSchedule: { userName: string; time: NotificationTime } | null = null
  private registration: ServiceWorkerRegistration | null = null

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
      this.registration = registration
      if (!registration.active) {
        this.registration = await navigator.serviceWorker.ready
      }
      return this.registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return null
    }
  }

  private async ensureRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration?.active) {
      return this.registration
    }
    const registration = await this.registerServiceWorker()
    if (registration?.active) {
      this.registration = registration
      return registration
    }
    try {
      this.registration = await navigator.serviceWorker.ready
      return this.registration
    } catch (error) {
      console.error("Failed to obtain active Service Worker registration:", error)
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
  async scheduleDailyNotification(userName: string, notificationTime: NotificationTime): Promise<void> {
    if (!userName) {
      console.warn("通知をスケジュールするにはユーザー名が必要です")
      return
    }

    const registration = await this.ensureRegistration()
    if (!registration) return

    this.cancelScheduledNotification()

    const nextTrigger = this.getNextTriggerDate(notificationTime)
    const delay = Math.max(nextTrigger.getTime() - Date.now(), 0)

    this.currentSchedule = { userName, time: notificationTime }

    this.notificationTimer = setTimeout(async () => {
      await this.showDailyFortuneNotification(registration, userName, nextTrigger)
      this.notificationTimer = null

      // 次回の通知（翌日）をスケジュール
      const followingDay = new Date(nextTrigger)
      followingDay.setDate(followingDay.getDate() + 1)
      await this.scheduleDailyNotification(userName, notificationTime)
    }, delay)
  }

  cancelScheduledNotification(): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
      this.notificationTimer = null
    }
    this.currentSchedule = null
  }

  async restoreScheduledNotification(): Promise<void> {
    const settings = this.loadNotificationSettings()
    if (!settings || !settings.enabled) {
      return
    }
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }
    await this.scheduleDailyNotification(settings.userName, settings.time)
  }

  saveNotificationSettings(settings: StoredNotificationSettings): void {
    localStorage.setItem(this.settingsStorageKey, JSON.stringify(settings))
  }

  loadNotificationSettings(): StoredNotificationSettings | null {
    const stored = localStorage.getItem(this.settingsStorageKey)
    if (!stored) {
      return null
    }
    try {
      const parsed = JSON.parse(stored) as StoredNotificationSettings
      if (!parsed.time) {
        parsed.time = DEFAULT_NOTIFICATION_TIME
      }
      return parsed
    } catch (error) {
      console.error("通知設定の読み込みに失敗しました", error)
      return null
    }
  }

  private async showDailyFortuneNotification(
    registration: ServiceWorkerRegistration,
    userName: string,
    targetDate: Date
  ): Promise<void> {
    const fortune = this.calculateDailyFortune(userName, targetDate)
    const payload = this.buildNotificationPayload(userName, fortune, targetDate)
    await this.displayNotification(registration, payload)
  }

  private async displayNotification(
    registration: ServiceWorkerRegistration,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      if ("showNotification" in registration) {
        await registration.showNotification(payload.title, payload.options)
      } else if (registration.active) {
        registration.active.postMessage({
          type: "SHOW_NOTIFICATION",
          payload,
        })
      }
    } catch (error) {
      console.error("通知の表示に失敗しました", error)
    }
  }

  private buildNotificationPayload(
    userName: string,
    fortune: DailyFortuneNotification["fortune"],
    targetDate: Date
  ): NotificationPayload {
    const luckySummary = `ラッキーカラー: ${fortune.lucky.color}｜ナンバー: ${fortune.lucky.number}｜方角: ${fortune.lucky.direction}`
    const formattedDate = targetDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })

    const body = [
      `${formattedDate}の運勢スコア: ${fortune.score}点`,
      fortune.overall,
      luckySummary,
      fortune.advice,
    ].join("\n")

    const options: NotificationOptions = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      lang: "ja",
      tag: "daily-fortune-notification",
      renotify: true,
      requireInteraction: false,
      timestamp: targetDate.getTime(),
      vibrate: [100, 50, 100],
      data: {
        url: "/daily-fortune",
        userName,
        fortune,
        scheduledAt: new Date().toISOString(),
        targetDate: targetDate.toISOString(),
      },
      actions: [
        {
          action: "open-app",
          title: "詳しく見る",
        },
      ],
    }

    return {
      title: `${userName}さんの今日の運勢`,
      options,
    }
  }

  private getNextTriggerDate(notificationTime: NotificationTime): Date {
    const now = new Date()
    const target = new Date()
    target.setHours(notificationTime.hour, notificationTime.minute, 0, 0)

    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1)
    }
    return target
  }

  // ヘルパーメソッド
  private calculateNameValue(name: string): number {
    return Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  }

  private calculateDateValue(date: Date): number {
    return date.getFullYear() + date.getMonth() + date.getDate()
  }
}

// 使用例
export const dailyFortunePush = DailyFortunePushSystem.getInstance()
