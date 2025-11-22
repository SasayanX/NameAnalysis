'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import RareCard from './RareCard'
import {
  renderCardPNG,
  downloadCardPNG,
  blobToDataURL,
  generateShareText,
  shareCard,
} from '@/lib/rare-card-utils'
import { Download, Share2, Image as ImageIcon } from 'lucide-react'

interface RareCardWithActionsProps {
  lastName: string
  firstName: string
  rank: 'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
  title: string
  score: number
  powerLevel: number
  baseSrc?: string
  width?: number
  height?: number
}

export default function RareCardWithActions({
  lastName,
  firstName,
  rank,
  title,
  score,
  powerLevel,
  baseSrc,
  width = 1024,
  height = 1536,
}: RareCardWithActionsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!svgRef.current) return

    setIsGenerating(true)
    try {
      // div要素からSVG要素を取得
      const svgElement = svgRef.current.querySelector('svg') as SVGSVGElement
      if (!svgElement) {
        throw new Error('SVG element not found')
      }
      const blob = await renderCardPNG(svgElement)
      const filename = `${lastName}${firstName}_${rank}_RareCard.png`
      downloadCardPNG(blob, filename)
    } catch (error) {
      console.error('ダウンロードエラー:', error)
      alert('画像のダウンロードに失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (!svgRef.current) return

    setIsGenerating(true)
    try {
      // div要素からSVG要素を取得
      const svgElement = svgRef.current.querySelector('svg') as SVGSVGElement
      if (!svgElement) {
        throw new Error('SVG element not found')
      }
      const blob = await renderCardPNG(svgElement)
      const shareText = generateShareText(lastName, firstName, rank, title, score)

      // Web Share APIが利用可能な場合
      if (navigator.share) {
        try {
          await shareCard(blob, shareText, lastName, firstName, rank)
          return
        } catch (error) {
          console.log('Web Share API失敗、フォールバックへ')
        }
      }

      // フォールバック: Data URLを生成してクリップボードにコピー
      const dataUrl = await blobToDataURL(blob)
      setShareUrl(dataUrl)

      // クリップボードにテキストをコピー
      await navigator.clipboard.writeText(shareText)

      alert('画像URLとテキストをクリップボードにコピーしました。SNSに貼り付けて共有してください。')
    } catch (error) {
      console.error('共有エラー:', error)
      alert('共有に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyImage = async () => {
    if (!svgRef.current) return

    setIsGenerating(true)
    try {
      // div要素からSVG要素を取得
      const svgElement = svgRef.current.querySelector('svg') as SVGSVGElement
      if (!svgElement) {
        throw new Error('SVG element not found')
      }
      const blob = await renderCardPNG(svgElement)

      // Clipboard APIが利用可能な場合
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        alert('画像をクリップボードにコピーしました')
      } else {
        // フォールバック: Data URLを生成
        const dataUrl = await blobToDataURL(blob)
        setShareUrl(dataUrl)
        alert('画像URLを生成しました。右クリックして保存してください。')
      }
    } catch (error) {
      console.error('コピーエラー:', error)
      alert('画像のコピーに失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div ref={svgRef as any}>
          <RareCard
            lastName={lastName}
            firstName={firstName}
            rank={rank}
            title={title}
            score={score}
            powerLevel={powerLevel}
            baseSrc={baseSrc}
            width={width}
            height={height}
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="min-w-[140px]"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? '生成中...' : 'ダウンロード'}
        </Button>

        <Button
          onClick={handleShare}
          disabled={isGenerating}
          variant="outline"
          className="min-w-[140px]"
        >
          <Share2 className="mr-2 h-4 w-4" />
          {isGenerating ? '生成中...' : '共有'}
        </Button>

        <Button
          onClick={handleCopyImage}
          disabled={isGenerating}
          variant="outline"
          className="min-w-[140px]"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {isGenerating ? '生成中...' : 'コピー'}
        </Button>
      </div>

      {shareUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">画像URL:</p>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full p-2 text-xs bg-white border rounded"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  )
}

