"use client"

import { useState, useEffect } from "react"
import { Coins } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrCreatePointsSummary } from "@/lib/kanau-points-supabase"
import { KanauPointsManager } from "@/lib/kanau-points-system"
import Link from "next/link"

export function KanauPointsHeader() {
  const { user: authUser } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPoints = async () => {
      try {
        if (authUser) {
          const summary = await getOrCreatePointsSummary(authUser.id)
          setPoints(summary.points)
        } else {
          // ゲストKp（ローカル保存）を表示
          const manager = KanauPointsManager.getInstance()
          manager.loadFromStorage()
          const guestId = "guest"
          let user = manager.getUser(guestId)
          if (!user) {
            user = manager.initializeUser(guestId)
            manager.saveToStorage()
          }
          setPoints(user.points)
        }
      } catch (error) {
        console.error("ポイント読み込みエラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPoints()

    // 定期的に更新（30秒ごと）
    const interval = setInterval(loadPoints, 30000)
    return () => clearInterval(interval)
  }, [authUser])

  return (
    <Link href="/points" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Coins className="h-4 w-4 text-yellow-600" />
      {isLoading ? (
        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
      ) : (
        <Badge 
          variant="outline" 
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700 font-semibold px-2 py-1"
        >
          {points !== null ? `${points.toLocaleString()}Kp` : "0Kp"}
        </Badge>
      )}
    </Link>
  )
}

