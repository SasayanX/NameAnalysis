// オートパイロット化システム
import { StrokeDataExpansionManager, type DataExpansionResult } from './stroke-data-expansion'
import { AutoShareManager, DEFAULT_AUTO_SHARE_CONFIG } from './auto-share-manager'
import { sendShareNotification } from './email-notification'

export interface AutopilotConfig {
  // 実行間隔
  interval: {
    hours: number
    minutes: number
  }
  
  // データソース
  dataSources: string[]
  
  // 品質閾値
  qualityThresholds: {
    minConfidence: number
    minFrequency: number
    maxErrors: number
  }
  
  // 通知設定
  notifications: {
    enabled: boolean
    webhook?: string
    email?: string
  }
  
  // 自動実行設定
  autoExecution: {
    enabled: boolean
    maxRunsPerDay: number
    pauseOnError: boolean
  }
}

export class AutopilotManager {
  private config: AutopilotConfig
  private isRunning = false
  private lastRunTime: Date | null = null
  private runCount = 0
  private errorCount = 0
  private intervalId: NodeJS.Timeout | null = null

  constructor(config: AutopilotConfig) {
    this.config = config
  }

  // オートパイロット開始
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ オートパイロットは既に実行中です')
      return
    }

    console.log('🚀 オートパイロット開始')
    this.isRunning = true

    // 即座に1回実行
    this.executeExpansion()

    // 定期実行を設定
    const intervalMs = (this.config.interval.hours * 60 + this.config.interval.minutes) * 60 * 1000
    this.intervalId = setInterval(() => {
      this.executeExpansion()
    }, intervalMs)

    console.log(`⏰ 定期実行設定: ${this.config.interval.hours}時間${this.config.interval.minutes}分間隔`)
  }

  // オートパイロット停止
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ オートパイロットは実行されていません')
      return
    }

    console.log('🛑 オートパイロット停止')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // 拡充実行
  private async executeExpansion(): Promise<void> {
    // 実行制限チェック
    if (this.runCount >= this.config.autoExecution.maxRunsPerDay) {
      console.log('📊 1日の実行上限に達しました')
      return
    }

    // エラー時の一時停止
    if (this.config.autoExecution.pauseOnError && this.errorCount > 3) {
      console.log('⏸️ エラーが多すぎるため一時停止')
      return
    }

    try {
      console.log(`🔄 自動拡充実行 #${this.runCount + 1}`)
      
      const manager = new StrokeDataExpansionManager()
      const result = await manager.expandStrokeData()
      
      this.runCount++
      this.lastRunTime = new Date()
      this.errorCount = 0

      // 結果の評価
      const success = this.evaluateResult(result)
      
      if (success) {
        console.log(`✅ 自動拡充成功: ${result.addedKanji.length}個の漢字を追加`)
        
        // 通知送信
        if (this.config.notifications.enabled) {
          await this.sendNotification(result, 'success')
        }
      } else {
        console.log(`⚠️ 自動拡充完了（品質基準未達）`)
      }

    } catch (error) {
      this.errorCount++
      console.error(`❌ 自動拡充エラー: ${error}`)
      
      // エラー通知
      if (this.config.notifications.enabled) {
        await this.sendNotification(null, 'error', error)
      }
    }
  }

  // 結果の評価
  private evaluateResult(result: DataExpansionResult): boolean {
    const { qualityThresholds } = this.config
    
    // エラー数チェック
    if (result.errors.length > qualityThresholds.maxErrors) {
      console.log(`❌ エラー数が多すぎます: ${result.errors.length}`)
      return false
    }

    // 追加された漢字の品質チェック
    const highQualityKanji = result.missingKanji.filter(kanji => 
      kanji.confidence >= qualityThresholds.minConfidence &&
      kanji.frequency >= qualityThresholds.minFrequency
    )

    if (highQualityKanji.length === 0) {
      console.log('❌ 品質基準を満たす漢字がありません')
      return false
    }

    return true
  }

  // 通知送信
  private async sendNotification(
    result: DataExpansionResult | null, 
    type: 'success' | 'error', 
    error?: any
  ): Promise<void> {
    try {
      if (type === 'success' && result) {
        const message = this.formatSuccessMessage(result)
        await this.sendWebhook(message)
        await this.sendEmail('画数データ拡充完了', message)
      } else if (type === 'error') {
        const message = this.formatErrorMessage(error)
        await this.sendWebhook(message)
        await this.sendEmail('画数データ拡充エラー', message)
      }
    } catch (notificationError) {
      console.error('通知送信エラー:', notificationError)
    }
  }

  // 成功メッセージのフォーマット
  private formatSuccessMessage(result: DataExpansionResult): string {
    return `🎉 画数データ拡充完了

📊 処理結果:
- 処理姓名数: ${result.processedNames}件
- 不足漢字: ${result.missingKanji.length}個
- 追加漢字: ${result.addedKanji.length}個
- エラー: ${result.errors.length}件

✅ 追加された漢字: ${result.addedKanji.join(', ')}

⏰ 実行時刻: ${new Date().toLocaleString('ja-JP')}`
  }

  // エラーメッセージのフォーマット
  private formatErrorMessage(error: any): string {
    return `❌ 画数データ拡充エラー

🚨 エラー内容:
${error}

⏰ 発生時刻: ${new Date().toLocaleString('ja-JP')}

🔄 次回実行: ${this.getNextRunTime()}`
  }

  // Webhook送信
  private async sendWebhook(message: string): Promise<void> {
    if (!this.config.notifications.webhook) return

    try {
      await fetch(this.config.notifications.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      })
    } catch (error) {
      console.error('Webhook送信エラー:', error)
    }
  }

  // メール送信
  private async sendEmail(subject: string, message: string): Promise<void> {
    if (!this.config.notifications.email) return

    // 実際の実装では、メール送信サービスを使用
    console.log(`📧 メール送信: ${subject}`)
    console.log(message)
  }

  // 次回実行時刻の取得
  private getNextRunTime(): string {
    if (!this.lastRunTime) return '未定'
    
    const nextRun = new Date(this.lastRunTime)
    nextRun.setHours(nextRun.getHours() + this.config.interval.hours)
    nextRun.setMinutes(nextRun.getMinutes() + this.config.interval.minutes)
    
    return nextRun.toLocaleString('ja-JP')
  }

  // ステータス取得
  getStatus(): {
    isRunning: boolean
    lastRunTime: Date | null
    runCount: number
    errorCount: number
    nextRunTime: string
  } {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      runCount: this.runCount,
      errorCount: this.errorCount,
      nextRunTime: this.getNextRunTime()
    }
  }

  // 設定更新
  updateConfig(newConfig: Partial<AutopilotConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 設定を更新しました')
  }

  // リセット
  reset(): void {
    this.runCount = 0
    this.errorCount = 0
    this.lastRunTime = null
    console.log('🔄 カウンターをリセットしました')
  }
}

// デフォルト設定
export const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  interval: {
    hours: 12,    // 12時間間隔
    minutes: 0
  },
  
  dataSources: ['sample', 'api'],
  
  qualityThresholds: {
    minConfidence: 0.6,    // 信頼度60%以上
    minFrequency: 2,        // 頻度2回以上
    maxErrors: 5           // エラー5件以下
  },
  
  notifications: {
    enabled: true,
    webhook: process.env.SLACK_WEBHOOK_URL,
    email: 'kanaukiryu@gmail.com'
  },
  
  autoExecution: {
    enabled: true,
    maxRunsPerDay: 2,      // 1日2回まで
    pauseOnError: true     // エラー時は一時停止
  }
}

// グローバルインスタンス
let autopilotInstance: AutopilotManager | null = null

// オートパイロット開始
export function startAutopilot(config: AutopilotConfig = DEFAULT_AUTOPILOT_CONFIG): void {
  if (autopilotInstance) {
    autopilotInstance.stop()
  }
  
  autopilotInstance = new AutopilotManager(config)
  autopilotInstance.start()
}

// オートパイロット停止
export function stopAutopilot(): void {
  if (autopilotInstance) {
    autopilotInstance.stop()
    autopilotInstance = null
  }
}

// ステータス取得
export function getAutopilotStatus() {
  return autopilotInstance?.getStatus() || null
}
