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
    url: 'https://seimei.app',
    hashtags: ['姓名判断', '運勢', 'まいにちAI姓名判断', '開運']
  }
}

// お守り用のシェアコンテンツ生成
export function generateOmamoriShareContent(omamori: any) {
  return {
    title: `${omamori.name}を獲得しました！`,
    description: `${omamori.effect}の効果があります✨`,
    url: 'https://seimei.app',
    hashtags: ['お守り', '開運', 'まいにちAI姓名判断', '運気向上']
  }
}

// AI深層言霊鑑定結果用のシェアコンテンツ生成
export function generateAiFortuneShareContent(aiFortune: any) {
  const name = aiFortune.name || 'あなた'
  const fortune = aiFortune.aiFortune?.fortune || ''
  const personality = aiFortune.aiFortune?.personality || ''
  const talents = aiFortune.aiFortune?.talents || ''
  
  // 鑑定文（fortune）から最初の段落を取得（金雨希味の挨拶と名前・漢字の説明部分）
  // fortuneが改行で区切られている場合、最初の2段落を取得
  let fortunePreview = ''
  if (fortune) {
    const paragraphs = fortune.split('\n\n').filter((p: string) => p.trim())
    // 最初の段落（挨拶）と2段落目（名前と漢字の説明）を取得
    if (paragraphs.length >= 2) {
      fortunePreview = paragraphs[0] + '\n\n' + paragraphs[1]
      // 長すぎる場合は切り詰め（最大200文字）
      if (fortunePreview.length > 200) {
        fortunePreview = fortunePreview.substring(0, 197) + '...'
      }
    } else if (paragraphs.length >= 1) {
      fortunePreview = paragraphs[0]
      if (fortunePreview.length > 200) {
        fortunePreview = fortunePreview.substring(0, 197) + '...'
      }
    }
  }
  
  // 深層心理的特徴の最初の部分（最大100文字）
  let personalityPreview = ''
  if (personality) {
    personalityPreview = personality.length > 100 ? personality.substring(0, 97) + '...' : personality
  }
  
  // 潜在的な才能の最初の部分（最大100文字）
  let talentsPreview = ''
  if (talents) {
    talentsPreview = talents.length > 100 ? talents.substring(0, 97) + '...' : talents
  }
  
  // シェアテキストを構築（提供例の形式に合わせる）
  let description = ''
  
  // 1. 冒頭の挨拶と名前・漢字の説明部分
  if (fortunePreview) {
    description += fortunePreview
  }
  
  // 2. 深層心理的特徴（見出し付き）
  if (personalityPreview) {
    description += `\n\n深層心理的特徴\n${personalityPreview}`
  }
  
  // 3. 潜在的な才能（見出し付き）
  if (talentsPreview) {
    description += `\n\n潜在的な才能\n${talentsPreview}`
  }
  
  // 4. 締めの文言
  description += `\n\nあなたも、お名前鑑定してみませんか？`
  
  return {
    title: `${name}さんのAI深層言霊鑑定結果`,
    description: description,
    url: 'https://seimei.app',
    hashtags: ['AI姓名判断', '深層言霊鑑定', 'まいにちAI姓名判断', '開運', '運勢']
  }
}