"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStarLevelDescription } from '@/lib/name-ranking'
import { StarIcon } from 'lucide-react'

// ランク別の称号
const rankTitles: Record<string, string> = {
  SSS: '天下無双',
  SS: '無敵',
  S: '最強',
  'A+': '一流',
  A: '優秀',
  'B+': '良好',
  B: '普通',
  C: '平凡',
  D: '苦労',
}

// ランク別の色設定
const rankColors: Record<string, { main: string; glow: string; shadow: string; bg: string }> = {
  SSS: { main: '#FFF8D9', glow: '#FFD76A', shadow: '#B8860B', bg: '#FFD700' },
  SS: { main: '#F2F7FF', glow: '#BFD1FF', shadow: '#8FA7CC', bg: '#F5F5F5' },
  S: { main: '#FFE1CC', glow: '#FF8040', shadow: '#993300', bg: '#FF8A80' },
  'A+': { main: '#DDE8FF', glow: '#B0C8FF', shadow: '#203060', bg: '#80CBC4' },
  A: { main: '#EAF5CC', glow: '#BFE87A', shadow: '#667A3A', bg: '#A5D6A7' },
  'B+': { main: '#DCE8FF', glow: '#99BFFF', shadow: '#334A66', bg: '#C8E6C9' },
  B: { main: '#F5F5F5', glow: '#CCCCCC', shadow: '#555555', bg: '#E0E0E0' },
  C: { main: '#F2E0C6', glow: '#E5B67E', shadow: '#5C3A24', bg: '#F9E79F' },
  D: { main: '#FFD1A6', glow: '#CC5A2E', shadow: '#330000', bg: '#E5E7E9' },
}

// ランクから星の数を取得
function getStarCountFromRank(rank: string): number {
  const rankStarMap: Record<string, number> = {
    'SSS': 10,
    'SS': 9,
    'S': 8,
    'A+': 7,
    'A': 6,
    'B+': 5,
    'B': 4,
    'C': 3,
    'D': 2,
  }
  return rankStarMap[rank] || 2
}

// 共通のランク表示コンポーネント
function RankDisplay({ rank, score, powerLevel, colors }: {
  rank: string
  score: number
  powerLevel: number
  colors: { main: string; glow: string; shadow: string; bg: string }
}) {
  const starDescription = getStarLevelDescription(powerLevel)
  const starCount = getStarCountFromRank(rank)
  
  return (
    <div className="text-center animate-fade-in space-y-2 sm:space-y-3 px-2 sm:px-0">
      {/* 1. SSS */}
      <div 
        className="text-3xl sm:text-4xl md:text-5xl font-bold"
        style={{ 
          color: colors.main,
          textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}, 0 4px 8px ${colors.shadow}`
        }}
      >
        {rank}
      </div>
      
      {/* 2. ランク */}
      <div 
        className="text-xs sm:text-sm"
        style={{ color: colors.main, opacity: 0.8 }}
      >
        ランク
      </div>
      
      {/* 3. ★（ランクに応じた星の数） */}
      <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap">
        {Array.from({ length: 10 }).map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${
              i < starCount
                ? "text-amber-400 fill-amber-400"
                : "text-gray-600 dark:text-gray-700"
            }`}
          />
        ))}
      </div>
      
      {/* 4. 天下無双（筆フォント） */}
      <div 
        className="text-4xl sm:text-5xl md:text-6xl font-bold"
        style={{ 
          color: colors.main,
          fontFamily: "'Hannari','Yu Mincho','Hiragino Mincho ProN',serif",
          textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}, 0 4px 8px ${colors.shadow}`,
          letterSpacing: '0.1em'
        }}
      >
        {starDescription.title}
      </div>
      
      {/* 5. 説明文 */}
      <div 
        className="text-sm sm:text-base max-w-xs sm:max-w-md mx-auto px-2 sm:px-4"
        style={{ color: colors.main, opacity: 0.9, lineHeight: '1.6' }}
      >
        {starDescription.description}
      </div>
      
      {/* 6. 総合パワーポイント */}
      <div 
        className="text-lg sm:text-xl font-semibold pt-2"
        style={{ color: colors.main, opacity: 0.95 }}
      >
        総合パワーポイント: {score}
      </div>
    </div>
  )
}

// 方法1: CSS clip-path（軽量）
function RankRevealClipPath({ rank, score, powerLevel }: {
  rank: string
  score: number
  powerLevel: number
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const colors = rankColors[rank] || rankColors.SSS

  const handleReveal = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsRevealed(true)
      setIsAnimating(false)
    }, 800)
  }

  const handleReset = () => {
    setIsRevealed(false)
    setIsAnimating(false)
  }

  return (
    <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* ランク表示エリア */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRevealed ? (
          <RankDisplay rank={rank} score={score} powerLevel={powerLevel} colors={colors} />
        ) : (
          <div className="text-gray-500 text-2xl">???</div>
        )}
      </div>

      {/* カーテン（左右から開く - clip-path方式） */}
      {!isRevealed && (
        <>
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(to right, #1a0033, #330066, #1a0033)`,
              clipPath: isAnimating ? 'inset(0 50% 0 0)' : 'inset(0 0 0 0)',
              transition: 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(to left, #1a0033, #330066, #1a0033)`,
              clipPath: isAnimating ? 'inset(0 0 0 50%)' : 'inset(0 0 0 0)',
              transition: 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </>
      )}

      {/* アクションボタン */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Button
            onClick={handleReveal}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            ✨ ランクを確認する ✨
          </Button>
        </div>
      )}

      {/* リセットボタン */}
      {isRevealed && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/30 hover:bg-black/70"
          >
            リセット
          </Button>
        </div>
      )}
    </div>
  )
}

// 方法2: CSS transform（GPU加速）
function RankRevealTransform({ rank, score, powerLevel }: {
  rank: string
  score: number
  powerLevel: number
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const colors = rankColors[rank] || rankColors.SSS

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleReset = () => {
    setIsRevealed(false)
  }

  return (
    <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* ランク表示エリア */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRevealed ? (
          <RankDisplay rank={rank} score={score} powerLevel={powerLevel} colors={colors} />
        ) : (
          <div className="text-gray-500 text-2xl">???</div>
        )}
      </div>

      {/* カーテン（左右から開く - transform方式） */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1/2 z-10"
        style={{
          background: `linear-gradient(to right, #1a0033, #330066, transparent)`,
          transform: isRevealed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-1/2 z-10"
        style={{
          background: `linear-gradient(to left, #1a0033, #330066, transparent)`,
          transform: isRevealed ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      />

      {/* アクションボタン */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Button
            onClick={handleReveal}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            ✨ ランクを確認する ✨
          </Button>
        </div>
      )}

      {/* リセットボタン */}
      {isRevealed && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/30 hover:bg-black/70"
          >
            リセット
          </Button>
        </div>
      )}
    </div>
  )
}

// 方法3: 上から下に開くカーテン
function RankRevealTopDown({ rank, score, powerLevel }: {
  rank: string
  score: number
  powerLevel: number
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const colors = rankColors[rank] || rankColors.SSS

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleReset = () => {
    setIsRevealed(false)
  }

  return (
    <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* ランク表示エリア */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRevealed ? (
          <RankDisplay rank={rank} score={score} powerLevel={powerLevel} colors={colors} />
        ) : (
          <div className="text-gray-500 text-2xl">???</div>
        )}
      </div>

      {/* カーテン（上から下に開く） */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 z-10"
        style={{
          background: `linear-gradient(to bottom, #1a0033, #330066, transparent)`,
          transform: isRevealed ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 z-10"
        style={{
          background: `linear-gradient(to top, #1a0033, #330066, transparent)`,
          transform: isRevealed ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      />

      {/* アクションボタン */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Button
            onClick={handleReveal}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            ✨ ランクを確認する ✨
          </Button>
        </div>
      )}

      {/* リセットボタン */}
      {isRevealed && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/30 hover:bg-black/70"
          >
            リセット
          </Button>
        </div>
      )}
    </div>
  )
}

export default function TestRankRevealPage() {
  const [rank, setRank] = useState<'SSS' | 'SS' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'>('SSS')
  const [score, setScore] = useState(480)
  const [powerLevel, setPowerLevel] = useState(10)
  const [method, setMethod] = useState<'clip-path' | 'transform' | 'top-down'>('clip-path')

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>ランク表示カーテン演出テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 設定パネル */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="rank">ランク</Label>
              <Select value={rank} onValueChange={(value: any) => setRank(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSS">SSS - 天下無双</SelectItem>
                  <SelectItem value="SS">SS - 無敵</SelectItem>
                  <SelectItem value="S">S - 最強</SelectItem>
                  <SelectItem value="A+">A+ - 一流</SelectItem>
                  <SelectItem value="A">A - 優秀</SelectItem>
                  <SelectItem value="B+">B+ - 良好</SelectItem>
                  <SelectItem value="B">B - 普通</SelectItem>
                  <SelectItem value="C">C - 平凡</SelectItem>
                  <SelectItem value="D">D - 苦労</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="score">総合ポイント</Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value, 10))}
                min="0"
                max="1000"
              />
            </div>

            <div>
              <Label htmlFor="powerLevel">パワーレベル</Label>
              <Input
                id="powerLevel"
                type="number"
                value={powerLevel}
                onChange={(e) => setPowerLevel(parseInt(e.target.value, 10))}
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* 実装方法選択 */}
          <Tabs value={method} onValueChange={(value: any) => setMethod(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clip-path">方法1: clip-path</TabsTrigger>
              <TabsTrigger value="transform">方法2: transform</TabsTrigger>
              <TabsTrigger value="top-down">方法3: 上下</TabsTrigger>
            </TabsList>

            <TabsContent value="clip-path" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>clip-path方式</strong>: CSSのclip-pathを使用してカーテンを開く方式。軽量でパフォーマンスが良い。
                </p>
                <RankRevealClipPath rank={rank} score={score} powerLevel={powerLevel} />
              </div>
            </TabsContent>

            <TabsContent value="transform" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>transform方式</strong>: GPU加速を使用したtransform方式。滑らかなアニメーション。
                </p>
                <RankRevealTransform rank={rank} score={score} powerLevel={powerLevel} />
              </div>
            </TabsContent>

            <TabsContent value="top-down" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>上下方式</strong>: 上から下に開くカーテン。バリエーションとして実装。
                </p>
                <RankRevealTopDown rank={rank} score={score} powerLevel={powerLevel} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

