"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TwitterIcon, InstagramIcon, CopyIcon, CheckIcon } from "lucide-react"

interface ViralRankingShareProps {
  userRank: number
  displayName: string
  powerRank: string
  totalPoints: number
  category: "overall" | "male" | "female"
}

export function ViralRankingShare({ userRank, displayName, powerRank, totalPoints, category }: ViralRankingShareProps) {
  const [copied, setCopied] = useState(false)

  const categoryText = {
    overall: "全国総合",
    male: "全国男性",
    female: "全国女性",
  }

  const shareText = `🏆 おなまえパワーランキング結果発表！

${displayName}さんは...
${categoryText[category]}ランキング ${userRank}位！
パワーランク: ${powerRank}
総合ポイント: ${totalPoints}pt

あなたの名前のパワーも測定してみませんか？
#おなまえパワーランキング #姓名判断`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("コピーに失敗しました:", err)
    }
  }

  const handleTwitterShare = () => {
    const url = encodeURIComponent(window.location.origin)
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
  }

  const handleInstagramShare = () => {
    // Instagram用のシェア（ストーリーズ機能など）
    if (navigator.share) {
      navigator.share({
        title: "おなまえパワーランキング",
        text: shareText,
        url: window.location.origin,
      })
    }
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-purple-800 mb-2">🎉 ランキング結果をシェアしよう！</h3>
          <p className="text-purple-600">友達にも自慢して、一緒にランキングに参加してもらおう</p>
        </div>

        {/* プレビュー */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 mb-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="font-bold text-lg">{displayName}さん</div>
            <div className="text-purple-600 mb-2">{categoryText[category]}ランキング</div>
            <div className="text-3xl font-bold text-purple-800 mb-2">#{userRank}</div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-2">{powerRank}</Badge>
            <div className="text-lg font-bold">{totalPoints}pt</div>
          </div>
        </div>

        {/* シェアボタン */}
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={handleTwitterShare} className="bg-blue-500 hover:bg-blue-600 text-white">
            <TwitterIcon className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          <Button
            onClick={handleInstagramShare}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <InstagramIcon className="h-4 w-4 mr-2" />
            Instagram
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {copied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
            {copied ? "コピー済み" : "コピー"}
          </Button>
        </div>

        {/* 友達招待ボーナス */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-yellow-800 mb-1">🎁 友達招待ボーナス</div>
            <div className="text-xs text-yellow-700">
              シェアから新規登録があると、あなたも友達も1週間プレミアム機能無料！
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
