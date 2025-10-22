"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ViralShareButtonProps {
  result: any
  name: string
}

export function ViralShareButton({ result, name }: ViralShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const generateShareText = () => {
    const score = result.totalScore || 0
    const rank = score >= 80 ? "最高" : score >= 60 ? "良好" : "普通"

    return (
      `私の名前「${name}」の運勢は${rank}でした！✨\n\n` +
      `総合スコア: ${score}点\n` +
      `あなたも無料で診断してみませんか？\n\n` +
      `#姓名判断 #運勢 #名前の意味\n` +
      `${window.location.origin}`
    )
  }

  const handleShare = async () => {
    setIsSharing(true)

    try {
      const shareText = generateShareText()

      if (navigator.share) {
        // Web Share API対応
        await navigator.share({
          title: `${name}さんの姓名判断結果`,
          text: shareText,
          url: window.location.origin,
        })
      } else {
        // フォールバック: クリップボードにコピー
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "コピーしました！",
          description: "SNSに貼り付けてシェアしてください",
        })
      }
    } catch (error) {
      console.error("Share failed:", error)
      toast({
        title: "シェアに失敗しました",
        description: "もう一度お試しください",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin)
      toast({
        title: "リンクをコピーしました！",
        description: "友達にシェアして一緒に診断してもらいましょう",
      })
    } catch (error) {
      toast({
        title: "コピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={handleShare}
        disabled={isSharing}
        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
      >
        <Share2 className="h-4 w-4 mr-2" />
        結果をシェア
      </Button>

      <Button variant="outline" onClick={handleCopyLink} className="px-3">
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}
