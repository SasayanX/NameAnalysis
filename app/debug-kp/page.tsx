"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
// クライアントサイドから直接Supabaseアクセスを避けるため、API Route経由で取得
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Coins } from "lucide-react"
import Link from "next/link"

export default function DebugKpPage() {
  const { user: authUser } = useAuth()
  const [kpBalance, setKpBalance] = useState<number | null>(null)
  const [amount, setAmount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const { toast } = useToast()

  // KP残高を取得（API Route経由）
  const loadBalance = async () => {
    if (!authUser) return
    setLoadingBalance(true)
    try {
      const response = await fetch(`/api/kp/balance?userId=${encodeURIComponent(authUser.id)}`)
      if (!response.ok) {
        throw new Error('KP残高の取得に失敗しました')
      }
      const data = await response.json()
      if (data.success) {
        setKpBalance(data.points || 0)
      } else {
        throw new Error(data.error || 'KP残高の取得に失敗しました')
      }
    } catch (error: any) {
      console.error("KP残高取得エラー:", error)
      toast({
        title: "エラー",
        description: error.message || "KP残高の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoadingBalance(false)
    }
  }

  // 初回ロード時とユーザー変更時に残高を取得
  useEffect(() => {
    if (authUser) {
      loadBalance()
    }
  }, [authUser])

  // KP付与
  const handleAddKp = async () => {
    if (!authUser) {
      toast({
        title: "ログインが必要です",
        description: "KP付与にはログインが必要です",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/debug/add-kp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser.id,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "KP付与に失敗しました")
      }

      // 残高を更新
      setKpBalance(data.kpBalance)

      toast({
        title: "✅ KP付与完了",
        description: data.message,
      })
    } catch (error: any) {
      toast({
        title: "❌ エラー",
        description: error.message || "KP付与に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // クイック追加ボタン
  const quickAdd = (value: number) => {
    setAmount(value)
    setTimeout(() => {
      handleAddKp()
    }, 100)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            デバッグ用 KP付与
          </CardTitle>
          <CardDescription>
            開発環境でのみ使用可能です。本番環境では使用できません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ユーザー情報 */}
          {authUser ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ログイン中: {authUser.email || authUser.id}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ログインが必要です。{" "}
                <Link href="/login" className="underline font-semibold">
                  ログインページへ
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* KP残高表示 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">現在のKP残高</Label>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {kpBalance !== null ? (
                    `${kpBalance} KP`
                  ) : loadingBalance ? (
                    "読み込み中..."
                  ) : (
                    "---"
                  )}
                </div>
              </div>
              <Button
                onClick={loadBalance}
                variant="outline"
                disabled={loadingBalance || !authUser}
              >
                {loadingBalance ? "更新中..." : "残高を更新"}
              </Button>
            </div>
          </div>

          {/* KP付与フォーム */}
          {authUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">付与するKP数</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                  min="1"
                  max="10000"
                  className="mt-2"
                />
              </div>

              {/* クイック追加ボタン */}
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  クイック追加
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    onClick={() => quickAdd(10)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    +10 KP
                  </Button>
                  <Button
                    onClick={() => quickAdd(50)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    +50 KP
                  </Button>
                  <Button
                    onClick={() => quickAdd(100)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    +100 KP
                  </Button>
                  <Button
                    onClick={() => quickAdd(500)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    +500 KP
                  </Button>
                </div>
              </div>

              {/* 付与ボタン */}
              <Button
                onClick={handleAddKp}
                disabled={loading || amount <= 0}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  "付与中..."
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    {amount} KP 付与
                  </>
                )}
              </Button>
            </div>
          )}

          {/* 注意事項 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>注意:</strong> この機能は開発環境でのみ使用可能です。
              本番環境では自動的に無効化されます。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

