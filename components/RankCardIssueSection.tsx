"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import IssueCardModal from "@/components/IssueCardModal"
// クライアントサイドから直接Supabaseアクセスを避けるため、API Route経由で取得
import { useAuth } from "@/components/auth/auth-provider"
import { KP_COST_ISSUE, KP_REWARD_SHARE } from "@/constants/kp"
import { Download, Share2 } from "lucide-react"

type Props = {
  lastName: string
  firstName: string
  rank: string
  totalPoints: number
  powerLevel: number
  baseImagePath?: string
}

export default function RankCardIssueSection({
  lastName,
  firstName,
  rank,
  totalPoints,
  powerLevel,
  baseImagePath,
}: Props) {
  const [kpBalance, setKpBalance] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [issuedImageUrl, setIssuedImageUrl] = useState<string | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)
  const { user: authUser, loading: authLoading } = useAuth()
  const { toast } = useToast()

  // KP残高を取得（API Route経由）
  const loadKpBalance = async () => {
    if (!authUser) {
      console.warn('⚠️ KP残高取得: ユーザー未ログイン')
      return
    }
    
    console.log('💰 KP残高取得開始:', { userId: authUser.id })
    
    try {
      const url = `/api/kp/balance?userId=${encodeURIComponent(authUser.id)}`
      console.log('📡 API呼び出し:', url)
      
      const response = await fetch(url)
      console.log('📥 レスポンス受信:', { status: response.status, ok: response.ok })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ APIエラー:', { status: response.status, errorText })
        let errorData = { error: 'Unknown error' }
        try {
          errorData = JSON.parse(errorText)
        } catch {
          // JSON解析失敗時はデフォルトエラーを使用
        }
        throw new Error(errorData.error || 'KP残高の取得に失敗しました')
      }
      
      const data = await response.json()
      console.log('✅ APIレスポンス:', data)
      
      if (data.success) {
        console.log('💰 KP残高設定:', data.points)
        setKpBalance(data.points || 0)
      } else {
        throw new Error(data.error || 'KP残高の取得に失敗しました')
      }
    } catch (error: any) {
      console.error("❌ KP残高取得エラー:", error)
      // エラーが発生してもnullのままにしておく（モーダルで読み込み中と表示される）
      throw error // エラーを再スローして親で処理できるようにする
    }
  }

  // モーダルを開く
  const handleOpenModal = async () => {
    console.log('🎴 モーダルオープン開始:', { 
      authUser: authUser?.id, 
      authUserEmail: authUser?.email,
      authLoading,
      hasAuthUser: !!authUser
    })
    
    // 認証状態の読み込み中
    if (authLoading) {
      console.log('⏳ 認証状態読み込み中...')
      toast({
        title: "読み込み中",
        description: "認証状態を確認しています...",
      })
      return
    }
    
    // ユーザーがログインしていない場合
    if (!authUser) {
      console.warn('⚠️ ユーザー未ログイン')
      const shouldRedirect = window.confirm(
        "ランクカードを発行するにはログインが必要です。\nログインページに移動しますか？"
      )
      if (shouldRedirect) {
        // ログイン後に戻るためのURLを保存
        const currentUrl = window.location.pathname + window.location.search
        sessionStorage.setItem('returnUrl', currentUrl)
        window.location.href = '/login'
      }
      return
    }
    
    try {
      // モーダルを先に開く（読み込み中状態で表示）
      console.log('📱 モーダルを開きます')
      setIsModalOpen(true)
      // その後、KP残高を取得
      console.log('💰 KP残高を取得します')
      await loadKpBalance()
      console.log('✅ KP残高取得完了')
    } catch (error: any) {
      console.error('❌ モーダルオープン中エラー:', error)
      toast({
        title: "エラー",
        description: error.message || "モーダルの表示に失敗しました",
        variant: "destructive",
      })
      setIsModalOpen(false) // エラー時はモーダルを閉じる
    }
  }

  // カード発行
  const handleIssueCard = async () => {
    if (!authUser) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    // KP残高を再取得して確認
    if (kpBalance === null) {
      await loadKpBalance()
    }

    if (kpBalance === null || kpBalance < KP_COST_ISSUE) {
      toast({
        title: "KP不足",
        description: `カード発行には${KP_COST_ISSUE}KP必要です。現在の残高: ${kpBalance ?? 0}KP`,
        variant: "destructive",
      })
      return
    }

    setIsIssuing(true)
    try {
      console.log("🎴 カード発行開始:", { lastName, firstName, rank, totalPoints, powerLevel })
      
      const response = await fetch("/api/issue-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName,
          firstName,
          rank,
          totalPoints,
          powerLevel,
          userId: authUser.id,
          baseImagePath,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ APIエラー:", response.status, errorText)
        throw new Error(`APIエラー: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ APIレスポンス:", data)

      if (!data.success) {
        throw new Error(data.error || "カード発行に失敗しました")
      }

      // 発行成功
      setIssuedImageUrl(data.imageUrl)
      setKpBalance(data.kpBalance)
      setIsModalOpen(false)
      setCardId(`${lastName}_${firstName}_${rank}_${Date.now()}`)

      toast({
        title: "ランクカード発行完了！",
        description: `${KP_COST_ISSUE}KP消費してカードを発行しました`,
      })
    } catch (error: any) {
      console.error("❌ カード発行エラー:", error)
      toast({
        title: "発行エラー",
        description: error.message || "カード発行に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsIssuing(false)
    }
  }

  // SNS共有
  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!issuedImageUrl || !authUser) {
      toast({
        title: "エラー",
        description: "画像またはユーザー情報が取得できませんでした",
        variant: "destructive",
      })
      return
    }

    try {
      // Web Share APIを使用
      if (navigator.share) {
        await navigator.share({
          title: `${lastName}${firstName}さんのランクカード`,
          text: `${lastName}${firstName}さんの名前ランクは${rank}です！`,
          url: window.location.origin + issuedImageUrl,
        })
      } else {
        // フォールバック: クリップボードにコピー
        await navigator.clipboard.writeText(
          `${window.location.origin}${issuedImageUrl}`
        )
        toast({
          title: "リンクをコピーしました",
          description: "SNSで共有してください",
        })
        return // コピーの場合はAPIを呼ばない
      }

      // 共有成功後、KP還元APIを呼び出す
      const response = await fetch("/api/share-card-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser.id,
          cardId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // KP残高を更新
        await loadKpBalance()
        toast({
          title: "シェア完了！",
          description: `＋${KP_REWARD_SHARE}KP 還元しました`,
        })
      } else {
        // 既に獲得済みなどの場合は警告のみ
        toast({
          title: "シェアボーナス",
          description: data.error || "シェアボーナスは1日1回までです",
          variant: "default",
        })
      }
    } catch (error: any) {
      // 共有キャンセルなどはエラーとして扱わない
      if (error.name !== "AbortError") {
        console.error("共有エラー:", error)
      }
    }
  }

  // 画像ダウンロード
  const handleDownload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!issuedImageUrl) {
      toast({
        title: "エラー",
        description: "画像URLが取得できませんでした",
        variant: "destructive",
      })
      return
    }
    try {
      const link = document.createElement("a")
      link.href = issuedImageUrl
      link.download = `rank-card-${lastName}-${firstName}-${rank}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      console.error("❌ ダウンロードエラー:", error)
      toast({
        title: "ダウンロードエラー",
        description: error.message || "画像のダウンロードに失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* 発行ボタン */}
      {!issuedImageUrl && (
        <div className="space-y-2">
          <Button
            onClick={async (e) => {
              console.log('🖱️ 発行ボタンクリック', { authUser: !!authUser, authLoading })
              e.preventDefault()
              e.stopPropagation()
              
              // 未ログインの場合はログインページへ誘導
              if (!authLoading && !authUser) {
                const shouldRedirect = window.confirm(
                  "ランクカードを発行するにはログインが必要です。\nログインページに移動しますか？"
                )
                if (shouldRedirect) {
                  const currentUrl = window.location.pathname + window.location.search
                  sessionStorage.setItem('returnUrl', currentUrl)
                  window.location.href = '/login'
                }
                return
              }
              
              try {
                await handleOpenModal()
              } catch (error: any) {
                console.error("❌ モーダルオープンエラー:", error)
                toast({
                  title: "エラー",
                  description: error.message || "モーダルの表示に失敗しました",
                  variant: "destructive",
                })
              }
            }}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            size="lg"
            type="button"
            disabled={authLoading}
          >
            {authLoading 
              ? "読み込み中..." 
              : !authUser 
                ? "ログインしてランクカードを発行"
                : `ランクカードを発行する（${KP_COST_ISSUE}KP）`
            }
          </Button>
          {!authUser && !authLoading && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              ランクカードを発行するにはログインが必要です
            </p>
          )}
        </div>
      )}

      {/* 発行済みカード表示 */}
      {issuedImageUrl && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-amber-500">
            <img
              src={issuedImageUrl}
              alt={`${lastName}${firstName}のランクカード`}
              className="w-full h-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={(e) => handleDownload(e)}
              variant="outline"
              className="flex-1 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              画像を保存
            </Button>
            <Button
              onClick={(e) => handleShare(e)}
              className="flex-1 w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              シェアして {KP_REWARD_SHARE}KP 還元
            </Button>
          </div>
        </div>
      )}

      {/* 発行モーダル */}
      {isModalOpen && (
        <IssueCardModal
          kpBalance={kpBalance}
          onConfirm={handleIssueCard}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

