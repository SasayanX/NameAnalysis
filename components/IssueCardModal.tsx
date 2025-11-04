"use client"

import { KP_COST_ISSUE, KP_REWARD_SHARE } from "@/constants/kp"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Props = {
  kpBalance: number | null
  onConfirm: () => Promise<void> // 画像生成＋保存（発行）
  onCancel: () => void
}

export default function IssueCardModal({ kpBalance, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const canIssue = kpBalance !== null && kpBalance >= KP_COST_ISSUE

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4 backdrop-blur-sm"
      onClick={(e) => {
        try {
          if (e.target === e.currentTarget) {
            onCancel()
          }
        } catch (error: any) {
          console.error("❌ モーダル背景クリックエラー:", error)
        }
      }}
    >
      <div 
        className="relative w-full max-w-[520px] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCancel()
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 pr-8">
          名が光を放つ瞬間です
        </h2>

        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-4">
          {`あなたの名が光を放つ瞬間です。
発行には ${KP_COST_ISSUE}カナウポイント が必要ですが、
名を広めるほどに、運は還ってきます──
SNSでの共有で ${KP_REWARD_SHARE}カナウポイント還元。`}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            所持：<span className="font-semibold text-gray-900 dark:text-white">
              {kpBalance === null ? '読み込み中...' : `${kpBalance} KP`}
            </span>
          </div>
          {kpBalance !== null && !canIssue && (
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              カナウポイントが不足しています
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCancel()
            }}
            variant="outline"
            className="w-full sm:w-auto px-4 py-2"
          >
            やめておく
          </Button>

          <Button
            disabled={!canIssue || loading}
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!canIssue) return
              try {
                setLoading(true)
                await onConfirm() // ← サーバーでKP消費＆カード生成
              } catch (error: any) {
                console.error("❌ モーダル内エラー:", error)
                // エラーは親コンポーネントで処理されるため、ここではログのみ
              } finally {
                setLoading(false)
              }
            }}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm sm:text-base ${
              canIssue
                ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500"
            }`}
          >
            {loading ? "発行中…" : `発行して運命を刻む（${KP_COST_ISSUE}KP）`}
          </Button>
        </div>
      </div>
    </div>
  )
}

