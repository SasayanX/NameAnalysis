// バッチ処理による最適化
export class BatchProcessor {
  private static instance: BatchProcessor
  private pendingTasks: Array<{
    id: string
    task: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private isProcessing = false

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor()
    }
    return BatchProcessor.instance
  }

  // タスクをバッチに追加
  addTask<T>(id: string, task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.pendingTasks.push({ id, task, resolve, reject })
      this.scheduleProcessing()
    })
  }

  // バッチ処理をスケジュール
  private scheduleProcessing() {
    if (this.isProcessing) return

    // 次のフレームで処理を実行
    requestIdleCallback(() => {
      this.processBatch()
    })
  }

  // バッチ処理を実行
  private async processBatch() {
    if (this.isProcessing || this.pendingTasks.length === 0) return

    this.isProcessing = true
    const tasks = this.pendingTasks.splice(0, 10) // 最大10個ずつ処理

    try {
      // 並列実行
      const results = await Promise.allSettled(tasks.map(({ task }) => task()))

      // 結果を各タスクに返す
      results.forEach((result, index) => {
        const { resolve, reject } = tasks[index]
        if (result.status === "fulfilled") {
          resolve(result.value)
        } else {
          reject(result.reason)
        }
      })
    } catch (error) {
      // エラーハンドリング
      tasks.forEach(({ reject }) => reject(error))
    } finally {
      this.isProcessing = false

      // まだタスクが残っている場合は再スケジュール
      if (this.pendingTasks.length > 0) {
        this.scheduleProcessing()
      }
    }
  }
}

export const batchProcessor = BatchProcessor.getInstance()
