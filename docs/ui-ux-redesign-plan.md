# 和風モダンデザイン刷新計画

## 概要
既存の姓名判断アプリを和風モダンデザインに刷新し、伝統と現代を融合した美しいUI/UXを提供する。

## デザインコンセプト

### 1. 和風モダンの定義
- **伝統的要素**: 和紙、墨色、金色、自然な色彩
- **現代的要素**: ミニマルデザイン、クリーンなレイアウト、直感的な操作
- **融合**: 伝統的な美意識と現代的な使いやすさの調和

### 2. カラーパレット
```css
:root {
  /* メインカラー */
  --primary-green: #2D5016;      /* 深緑 */
  --primary-gold: #D4AF37;       /* 金色 */
  --primary-white: #FFFFFF;      /* 白 */
  --primary-navy: #1A1A2E;       /* 濃紺 */
  
  /* セカンダリカラー */
  --secondary-sage: #9CAF88;     /* セージグリーン */
  --secondary-cream: #F5F5DC;    /* クリーム */
  --secondary-charcoal: #36454F; /* チャコール */
  --secondary-silver: #C0C0C0;   /* シルバー */
  
  /* アクセントカラー */
  --accent-red: #8B0000;         /* 深紅 */
  --accent-blue: #4682B4;        /* スチールブルー */
  --accent-purple: #663399;      /* 紫 */
  
  /* グラデーション */
  --gradient-primary: linear-gradient(135deg, #2D5016 0%, #9CAF88 100%);
  --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
  --gradient-sage: linear-gradient(135deg, #9CAF88 0%, #F5F5DC 100%);
}
```

## 実装計画

### Phase 1: デザインシステム構築（1-2週間）

#### 1.1 カスタムCSS変数
```css
/* styles/design-system.css */
:root {
  /* カラーパレット */
  --primary-green: #2D5016;
  --primary-gold: #D4AF37;
  --primary-white: #FFFFFF;
  --primary-navy: #1A1A2E;
  
  /* タイポグラフィ */
  --font-primary: 'Noto Sans JP', sans-serif;
  --font-secondary: 'Noto Serif JP', serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* フォントサイズ */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* スペーシング */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* ボーダー */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  
  /* シャドウ */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

#### 1.2 和風コンポーネントライブラリ
```typescript
// components/design-system/WafuButton.tsx
export function WafuButton({ 
  variant = 'primary',
  size = 'md',
  children,
  ...props 
}: WafuButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-green to-secondary-sage text-white hover:shadow-lg focus:ring-primary-green',
    secondary: 'bg-primary-white text-primary-navy border-2 border-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green',
    gold: 'bg-gradient-to-r from-primary-gold to-yellow-400 text-primary-navy hover:shadow-lg focus:ring-primary-gold',
    ghost: 'text-primary-green hover:bg-secondary-sage hover:text-white focus:ring-primary-green'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### 1.3 和風カードコンポーネント
```typescript
// components/design-system/WafuCard.tsx
export function WafuCard({ 
  children,
  variant = 'default',
  className = '',
  ...props 
}: WafuCardProps) {
  const baseClasses = 'rounded-xl shadow-md transition-all duration-200 hover:shadow-lg'
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-200',
    gold: 'bg-gradient-to-br from-primary-gold to-yellow-400 text-primary-navy',
    sage: 'bg-gradient-to-br from-secondary-sage to-primary-white',
    transparent: 'bg-transparent border border-primary-green'
  }
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Phase 2: レイアウト刷新（1週間）

#### 2.1 ヘッダーコンポーネント
```typescript
// components/layout/WafuHeader.tsx
export function WafuHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-green">
                姓名判断AI
              </h1>
            </div>
          </div>
          
          {/* ナビゲーション */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/" className="text-primary-navy hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium">
                ホーム
              </a>
              <a href="/analysis" className="text-primary-navy hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium">
                姓名判断
              </a>
              <a href="/compatibility" className="text-primary-navy hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium">
                相性分析
              </a>
              <a href="/premium" className="text-primary-navy hover:text-primary-green px-3 py-2 rounded-md text-sm font-medium">
                プレミアム
              </a>
            </div>
          </nav>
          
          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <WafuButton variant="gold" size="sm">
              プレミアムにアップグレード
            </WafuButton>
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### 2.2 フッターコンポーネント
```typescript
// components/layout/WafuFooter.tsx
export function WafuFooter() {
  return (
    <footer className="bg-primary-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 会社情報 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">姓名判断AI</h3>
            <p className="text-gray-300 mb-4">
              完全旧字体対応のAI姓名判断サービスで、あなたの運命を詳しく鑑定します。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  {/* Twitter icon */}
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  {/* Instagram icon */}
                </svg>
              </a>
            </div>
          </div>
          
          {/* サービス */}
          <div>
            <h3 className="text-lg font-semibold mb-4">サービス</h3>
            <ul className="space-y-2">
              <li><a href="/analysis" className="text-gray-300 hover:text-white">姓名判断</a></li>
              <li><a href="/compatibility" className="text-gray-300 hover:text-white">相性分析</a></li>
              <li><a href="/renaming" className="text-gray-300 hover:text-white">改名コンサル</a></li>
              <li><a href="/premium" className="text-gray-300 hover:text-white">プレミアム</a></li>
            </ul>
          </div>
          
          {/* サポート */}
          <div>
            <h3 className="text-lg font-semibold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white">ヘルプ</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">お問い合わせ</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-white">プライバシー</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-white">利用規約</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-300">
            © 2024 姓名判断AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Phase 3: 姓名判断結果表示の刷新（1-2週間）

#### 3.1 結果表示カード
```typescript
// components/analysis/ResultCard.tsx
export function ResultCard({ 
  title,
  value,
  description,
  fortune,
  className = ''
}: ResultCardProps) {
  const fortuneColors = {
    '大吉': 'text-red-600 bg-red-50',
    '吉': 'text-green-600 bg-green-50',
    '中吉': 'text-blue-600 bg-blue-50',
    '小吉': 'text-yellow-600 bg-yellow-50',
    '凶': 'text-gray-600 bg-gray-50',
    '大凶': 'text-red-800 bg-red-100'
  }
  
  return (
    <WafuCard variant="elevated" className={`p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-navy mb-2">
          {title}
        </h3>
        <div className="text-3xl font-bold text-primary-green mb-2">
          {value}画
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${fortuneColors[fortune]}`}>
          {fortune}
        </div>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </WafuCard>
  )
}
```

#### 3.2 AI分析結果表示
```typescript
// components/ai/AIAnalysisDisplay.tsx
export function AIAnalysisDisplay({ analysis }: { analysis: AIAnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* 深層心理分析 */}
      <WafuCard variant="sage" className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-navy text-lg">🧠</span>
          </div>
          <h3 className="text-xl font-semibold text-primary-navy">
            深層心理分析
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {analysis.personality}
        </p>
      </WafuCard>
      
      {/* 潜在的な才能 */}
      <WafuCard variant="gold" className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-primary-navy">
            潜在的な才能
          </h3>
        </div>
        <p className="text-primary-navy leading-relaxed">
          {analysis.talents}
        </p>
      </WafuCard>
      
      {/* 具体的なアドバイス */}
      <WafuCard variant="default" className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-secondary-sage rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg">💡</span>
          </div>
          <h3 className="text-xl font-semibold text-primary-navy">
            具体的なアドバイス
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {analysis.advice}
        </p>
      </WafuCard>
    </div>
  )
}
```

### Phase 4: アニメーションとインタラクション（1週間）

#### 4.1 和風アニメーション
```css
/* styles/animations.css */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.wafu-fade-in {
  animation: fadeInUp 0.6s ease-out;
}

.wafu-slide-in {
  animation: slideInRight 0.6s ease-out;
}

.wafu-pulse {
  animation: pulse 2s infinite;
}
```

#### 4.2 インタラクティブコンポーネント
```typescript
// components/interactive/FortuneWheel.tsx
export function FortuneWheel({ onSpin }: { onSpin: (result: string) => void }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const fortunes = ['大吉', '吉', '中吉', '小吉', '凶']
  
  const handleSpin = () => {
    if (spinning) return
    
    setSpinning(true)
    setResult(null)
    
    // スピンアニメーション
    setTimeout(() => {
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
      setResult(randomFortune)
      setSpinning(false)
      onSpin(randomFortune)
    }, 3000)
  }
  
  return (
    <div className="text-center">
      <div className={`w-64 h-64 mx-auto mb-6 ${spinning ? 'wafu-pulse' : ''}`}>
        <div className="w-full h-full bg-gradient-to-br from-primary-gold to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <div className="text-2xl font-bold text-primary-navy">
            {result || '運勢'}
          </div>
        </div>
      </div>
      
      <WafuButton 
        variant="primary" 
        size="lg"
        onClick={handleSpin}
        disabled={spinning}
      >
        {spinning ? '回転中...' : '運勢を回す'}
      </WafuButton>
    </div>
  )
}
```

### Phase 5: レスポンシブデザイン最適化（1週間）

#### 5.1 モバイル最適化
```typescript
// components/responsive/MobileLayout.tsx
export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream to-primary-white">
      {/* モバイルヘッダー */}
      <div className="md:hidden">
        <WafuHeader />
      </div>
      
      {/* メインコンテンツ */}
      <main className="px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
      
      {/* モバイルフッター */}
      <div className="md:hidden">
        <WafuFooter />
      </div>
    </div>
  )
}
```

#### 5.2 タブレット最適化
```css
/* styles/responsive.css */
@media (min-width: 768px) and (max-width: 1024px) {
  .wafu-card {
    padding: 1.5rem;
  }
  
  .wafu-button {
    padding: 0.75rem 1.5rem;
  }
  
  .wafu-text {
    font-size: 1.125rem;
  }
}
```

## 実装スケジュール

### Week 1: デザインシステム構築
- [ ] カスタムCSS変数定義
- [ ] 和風コンポーネントライブラリ
- [ ] カラーパレット実装

### Week 2: レイアウト刷新
- [ ] ヘッダーコンポーネント
- [ ] フッターコンポーネント
- [ ] ナビゲーション改善

### Week 3: 結果表示刷新
- [ ] 結果表示カード
- [ ] AI分析結果表示
- [ ] 相性分析表示

### Week 4: アニメーションとインタラクション
- [ ] 和風アニメーション
- [ ] インタラクティブコンポーネント
- [ ] ユーザーエクスペリエンス向上

### Week 5: レスポンシブデザイン最適化
- [ ] モバイル最適化
- [ ] タブレット最適化
- [ ] デスクトップ最適化

## 成功指標

### デザイン指標
- ユーザー満足度: 85%以上
- デザイン評価: 4.5/5以上
- ブランド認知度: 30%向上

### ユーザー体験指標
- ページ滞在時間: 50%向上
- バウンス率: 20%減少
- コンバージョン率: 25%向上

## 次のステップ

1. **デザインシステム構築**: カスタムCSS変数とコンポーネントライブラリの実装
2. **レイアウト刷新**: ヘッダー、フッター、ナビゲーションの改善
3. **結果表示刷新**: 姓名判断結果とAI分析結果の表示改善
4. **アニメーション実装**: 和風アニメーションとインタラクションの追加
5. **レスポンシブ最適化**: 全デバイスでの最適な表示の実現
