"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PointManager, type UserProfile } from '@/lib/point-system'
import { Share2, Twitter, Facebook, MessageCircle, Instagram } from 'lucide-react'

interface ShareButtonsProps {
  shareContent: {
    title: string
    description: string
    url: string
    hashtags: string[]
  }
  onShare?: (platform: string) => void
}

export function ShareButtons({ shareContent, onShare }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (platform: string) => {
    setIsSharing(true)
    
    try {
      // シェアボーナス処理
      const result = PointManager.processShareBonus(platform)
      
      // プラットフォーム別シェア処理
      switch (platform) {
        case 'twitter':
          await shareToTwitter(shareContent)
          break
        case 'facebook':
          await shareToFacebook(shareContent)
          break
        case 'line':
          await shareToLine(shareContent)
          break
        case 'instagram':
          await shareToInstagram(shareContent)
          break
      }
      
      // コールバック実行
      if (onShare) {
        onShare(platform)
      }
      
      // 成功通知
      alert(`${platform}にシェアしました！20ポイント獲得！`)
      
    } catch (error) {
      console.error('シェアエラー:', error)
      alert('シェアに失敗しました')
    } finally {
      setIsSharing(false)
    }
  }

  const shareToTwitter = async (content: any) => {
    const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.map(tag => `#${tag}`).join(' ')}\n\n${content.url}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToFacebook = async (content: any) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToLine = async (content: any) => {
    const text = `${content.title}\n${content.description}\n${content.url}`
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(content.url)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToInstagram = async (content: any) => {
    // Instagramは直接シェアできないため、コピー機能を提供
    const text = `${content.title}\n\n${content.description}\n\n${content.hashtags.map(tag => `#${tag}`).join(' ')}\n\n${content.url}`
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      alert('Instagram用のテキストをコピーしました！\nInstagramアプリで貼り付けてシェアしてください。')
    } else {
      // フォールバック
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Instagram用のテキストをコピーしました！')
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">結果をシェアしてポイント獲得！</h3>
            <p className="text-sm text-gray-600">
              シェアするたびに20ポイント獲得できます
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('line')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-green-500" />
              LINE
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('instagram')}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4 text-pink-500" />
              Instagram
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            ※ シェア後、自動的にポイントが付与されます
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 姓名判断結果用のシェアコンテンツ生成
export function generateNameAnalysisShareContent(result: any) {
  const fortuneText = result.fortune || '吉'
  const scoreText = result.totalScore ? `${result.totalScore}点` : ''
  
  return {
    title: `${result.name}さんの姓名判断結果`,
    description: `総格${scoreText}！${fortuneText}の運勢です✨`,
    url: 'https://seimei.kanau-kiryu.com',
    hashtags: ['姓名判断', '運勢', 'まいにちAI姓名判断', '開運']
  }
}

// お守り用のシェアコンテンツ生成
export function generateOmamoriShareContent(omamori: any) {
  return {
    title: `${omamori.name}を獲得しました！`,
    description: `${omamori.effect}の効果があります✨`,
    url: 'https://seimei.kanau-kiryu.com',
    hashtags: ['お守り', '開運', 'まいにちAI姓名判断', '運気向上']
  }
}
