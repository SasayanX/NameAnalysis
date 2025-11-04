# ランク表示カーテン演出 実装仕様

## 概要

ランクタブをクリックしただけではランクが表示されず、カーテンで覆われている状態。
アクションボタンを押すとカーテンが開き、ランクが現れる演出。

## 実装方法

### 方法1: CSSアニメーション + React State（推奨）

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function RankRevealCard({ rank, score, powerLevel }: {
  rank: string
  score: number
  powerLevel: number
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleReveal = () => {
    setIsAnimating(true)
    // カーテンアニメーション（0.8秒）
    setTimeout(() => {
      setIsRevealed(true)
      setIsAnimating(false)
    }, 800)
  }

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">
      {/* ランク表示エリア（カーテンで覆われている） */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRevealed ? (
          <div className="text-center animate-fade-in">
            <div className="text-6xl font-bold text-white mb-4">{rank}</div>
            <div className="text-4xl text-gray-300">{score}pt</div>
            <div className="text-2xl text-gray-400">パワーレベル {powerLevel}/10</div>
          </div>
        ) : (
          <div className="text-gray-500 text-xl">???</div>
        )}
      </div>

      {/* カーテン（左右から開く） */}
      {!isRevealed && (
        <>
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 z-10
              ${isAnimating ? 'curtain-left-open' : ''}`}
            style={{
              clipPath: isAnimating ? 'inset(0 50% 0 0)' : 'inset(0 0 0 0)',
              transition: 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          <div 
            className={`absolute inset-0 bg-gradient-to-l from-purple-900 via-purple-800 to-purple-900 z-10
              ${isAnimating ? 'curtain-right-open' : ''}`}
            style={{
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            ✨ ランクを確認する ✨
          </Button>
        </div>
      )}
    </div>
  )
}
```

### 方法2: Framer Motion を使用（より滑らかなアニメーション）

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function RankRevealCardMotion({ rank, score, powerLevel }: {
  rank: string
  score: number
  powerLevel: number
}) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">
      {/* ランク表示エリア */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4">{rank}</div>
              <div className="text-4xl text-gray-300">{score}pt</div>
              <div className="text-2xl text-gray-400">パワーレベル {powerLevel}/10</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カーテン（左右から開く） */}
      <AnimatePresence>
        {!isRevealed && (
          <>
            <motion.div
              initial={{ x: '-50%' }}
              animate={{ x: '-100%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-purple-900 via-purple-800 to-transparent z-10"
            />
            <motion.div
              initial={{ x: '50%' }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-purple-900 via-purple-800 to-transparent z-10"
            />
          </>
        )}
      </AnimatePresence>

      {/* アクションボタン */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <Button
              onClick={() => setIsRevealed(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-8 py-6 rounded-full shadow-lg"
            >
              ✨ ランクを確認する ✨
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### 方法3: CSS Keyframes（軽量）

```css
/* globals.css に追加 */
@keyframes curtain-open-left {
  from {
    clip-path: inset(0 0 0 0);
  }
  to {
    clip-path: inset(0 50% 0 0);
  }
}

@keyframes curtain-open-right {
  from {
    clip-path: inset(0 0 0 0);
  }
  to {
    clip-path: inset(0 0 0 50%);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.curtain-left {
  animation: curtain-open-left 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.curtain-right {
  animation: curtain-open-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.rank-reveal {
  animation: fade-in-up 0.5s ease-out 0.3s both;
}
```

## 実装のポイント

### 1. 状態管理
- `isRevealed`: ランクが表示されているか
- `isAnimating`: カーテンアニメーション中か

### 2. カーテンエフェクトの実装
- **左右パネル方式**: 2つのdivを左右に配置し、`clip-path`や`transform: translateX()`で開く
- **単一パネル方式**: 中央から左右に開く（`clip-path: inset()`を使用）

### 3. アクショントリガー
- ボタンクリック
- タブ切り替え後の自動（遅延付き）
- スワイプジェスチャー
- キーボードショートカット

### 4. 演出のバリエーション
- **カーテン**: 左右から開く、上から下、渦巻き
- **エフェクト**: 光の粒子、パーティクル、フェードイン
- **サウンド**: カーテンが開く音、ファンファーレ

## 統合方法

既存のランク表示コンポーネントに統合：

```tsx
// 既存のコンポーネントを拡張
export function RankDisplayWithReveal({ rank, score, powerLevel }: Props) {
  const [showReveal, setShowReveal] = useState(false)

  return (
    <Tabs defaultValue={rank}>
      <TabsList>
        <TabsTrigger value="SSS">SSS</TabsTrigger>
        <TabsTrigger value="SS">SS</TabsTrigger>
        {/* ... */}
      </TabsList>
      
      <TabsContent value={rank}>
        {showReveal ? (
          <RankRevealCard 
            rank={rank} 
            score={score} 
            powerLevel={powerLevel} 
          />
        ) : (
          <div className="text-center py-20">
            <Button onClick={() => setShowReveal(true)}>
              ランクを確認する
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
```

## パフォーマンス考慮

- CSSアニメーションはGPUアクセラレーションを使用（`transform`, `opacity`）
- `will-change`プロパティで最適化
- アニメーション中は他のインタラクションを無効化

## 実装の可否

✅ **実装可能です**

- React Stateで簡単に実装可能
- CSSアニメーションで滑らかに演出可能
- Framer Motionを使えばより高度な演出も可能
- 既存のコンポーネントに統合しやすい

実装したい場合は、どの方法で実装しますか？

