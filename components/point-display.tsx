"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PointManager, OMAMORI_DATA, type UserProfile, type Omamori } from '@/lib/point-system'
import { Gift, Star, Trophy, Zap } from 'lucide-react'

export function PointDisplay() {
  const [profile, setProfile] = useState<UserProfile>(PointManager.getDefaultProfile())
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')

  useEffect(() => {
    // ログインボーナス処理
    const loginResult = PointManager.processLoginBonus()
    setProfile(loginResult.profile)
    
    if (loginResult.bonusPoints > 0) {
      setLoginMessage(loginResult.message)
      setShowLoginBonus(true)
      
      // 3秒後に通知を非表示
      setTimeout(() => {
        setShowLoginBonus(false)
      }, 3000)
    }
  }, [])

  const handleBuyOmamori = (omamoriId: string) => {
    const success = PointManager.buyOmamori(omamoriId)
    if (success) {
      setProfile(PointManager.getUserProfile())
      // 成功通知
      setLoginMessage('お守りを購入しました！')
      setShowLoginBonus(true)
      setTimeout(() => setShowLoginBonus(false), 2000)
    } else {
      // エラー通知
      setLoginMessage('ポイントが不足しています')
      setShowLoginBonus(true)
      setTimeout(() => setShowLoginBonus(false), 2000)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'basic': return 'bg-gray-500'
      case 'lucky': return 'bg-yellow-500'
      case 'element': return 'bg-blue-500'
      case 'special': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'basic': return '基本'
      case 'lucky': return '幸運'
      case 'element': return '五行'
      case 'special': return '特別'
      default: return '基本'
    }
  }

  return (
    <div className="space-y-6">
      {/* ログインボーナス通知 */}
      {showLoginBonus && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">{loginMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ポイント表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            運命ポイント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {profile.points.toLocaleString()}pt
            </div>
            <div className="text-sm text-gray-600 mt-1">
              連続ログイン: {profile.loginStreak}日
            </div>
          </div>
        </CardContent>
      </Card>

      {/* お守りショップ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" />
            お守りショップ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {OMAMORI_DATA.map((omamori) => {
              const isOwned = profile.omamoriCollection.some(o => o.id === omamori.id)
              const canAfford = profile.points >= omamori.price
              
              return (
                <Card key={omamori.id} className={`${isOwned ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{omamori.name}</h3>
                        <Badge className={getRarityColor(omamori.rarity)}>
                          {getRarityName(omamori.rarity)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {omamori.description}
                      </p>
                      
                      <div className="text-sm">
                        <strong>効果:</strong> {omamori.effect}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-yellow-600">
                          {omamori.price}pt
                        </span>
                        
                        {isOwned ? (
                          <Badge variant="secondary">所持済み</Badge>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canAfford}
                            onClick={() => handleBuyOmamori(omamori.id)}
                          >
                            {canAfford ? '購入' : 'ポイント不足'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* お守りコレクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            お守りコレクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.omamoriCollection.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              まだお守りを持っていません
              <br />
              ポイントを貯めてお守りを購入しましょう！
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {profile.omamoriCollection.map((omamori) => (
                <Card key={omamori.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{omamori.name}</h3>
                        <Badge className={getRarityColor(omamori.rarity)}>
                          {getRarityName(omamori.rarity)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {omamori.effect}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        獲得日: {new Date(omamori.acquiredDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <Card>
        <CardHeader>
          <CardTitle>統計情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {profile.totalLoginDays}
              </div>
              <div className="text-sm text-gray-600">総ログイン日数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {profile.shareCount}
              </div>
              <div className="text-sm text-gray-600">シェア回数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
