"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { performanceOptimizer } from "@/lib/performance-optimizer"

export function PerformanceMonitor() {
  const [stats, setStats] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceOptimizer.getStats())
    }, 5000) // 5秒ごと更新

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== "development" && !isVisible) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🚀 パフォーマンス監視
          <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? "非表示" : "表示"}
          </Button>
        </CardTitle>
        <CardDescription>アプリケーションのパフォーマンス統計</CardDescription>
      </CardHeader>
      {isVisible && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">キャッシュ状況</h4>
              <Badge variant="outline">キャッシュサイズ: {stats.cacheSize || 0}</Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">処理時間統計</h4>
              <div className="grid grid-cols-2 gap-2">
                {stats.operations &&
                  Object.entries(stats.operations).map(([operation, data]: [string, any]) => (
                    <div key={operation} className="text-sm">
                      <div className="font-medium">{operation}</div>
                      <div className="text-muted-foreground">
                        平均: {data.avg}ms | 最大: {data.max}ms | 回数: {data.count}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                performanceOptimizer.cleanup()
                setStats(performanceOptimizer.getStats())
              }}
            >
              キャッシュクリア
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
