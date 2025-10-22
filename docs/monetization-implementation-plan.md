# マネタイズ機能実装計画

## 概要
既存の決済システムを活用し、AI機能と組み合わせた包括的なマネタイズ戦略を実装する。

## 既存資産の活用

### 1. 決済システム（既存）
- ✅ Square決済API統合済み
- ✅ Webhook処理システム
- ✅ サブスクリプション管理
- ✅ セキュリティ機能

### 2. ユーザー認証（既存）
- ✅ 認証システム
- ✅ ユーザー管理
- ✅ セッション管理

## マネタイズ機能実装計画

### Phase 1: サブスクリプション機能拡張（1-2週間）

#### 1.1 プレミアムプラン定義
```typescript
// lib/subscription-plans.ts
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: '無料プラン',
    price: 0,
    features: [
      '基本姓名判断（月3回まで）',
      '旧字体変換',
      '基本相性分析'
    ],
    limits: {
      monthlyAnalyses: 3,
      aiAnalyses: 0,
      compatibilityAnalyses: 1,
      renamingSuggestions: 0
    }
  },
  BASIC: {
    id: 'basic',
    name: 'ベーシックプラン',
    price: 980,
    billingCycle: 'monthly',
    features: [
      '無制限姓名判断',
      'AI深層心理分析（月10回まで）',
      '相性分析（月5回まで）',
      '広告非表示',
      '過去データ保存'
    ],
    limits: {
      monthlyAnalyses: -1, // 無制限
      aiAnalyses: 10,
      compatibilityAnalyses: 5,
      renamingSuggestions: 3
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'プレミアムプラン',
    price: 1980,
    billingCycle: 'monthly',
    features: [
      '無制限姓名判断',
      '無制限AI分析',
      '無制限相性分析',
      '改名AIコンサルタント',
      '人生シミュレーションAI',
      'プライオリティサポート',
      '広告完全非表示',
      'データエクスポート'
    ],
    limits: {
      monthlyAnalyses: -1,
      aiAnalyses: -1,
      compatibilityAnalyses: -1,
      renamingSuggestions: -1
    }
  }
}
```

#### 1.2 使用量追跡システム
```typescript
// lib/usage-tracker.ts
export class UsageTracker {
  async trackUsage(userId: string, feature: string): Promise<boolean> {
    const user = await this.getUser(userId)
    const plan = SUBSCRIPTION_PLANS[user.planId]
    const limit = plan.limits[feature]
    
    // 無制限の場合
    if (limit === -1) return true
    
    // 使用量チェック
    const currentUsage = await this.getCurrentUsage(userId, feature)
    if (currentUsage >= limit) {
      return false
    }
    
    // 使用量をインクリメント
    await this.incrementUsage(userId, feature)
    return true
  }
  
  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const user = await this.getUser(userId)
    const plan = SUBSCRIPTION_PLANS[user.planId]
    
    return plan.features.includes(feature) && 
           await this.trackUsage(userId, feature)
  }
}
```

### Phase 2: AI機能の段階的解放（1週間）

#### 2.1 AI分析の制限実装
```typescript
// lib/ai/ai-access-control.ts
export class AIAccessControl {
  private usageTracker: UsageTracker
  
  async canAccessAIAnalysis(userId: string): Promise<boolean> {
    return await this.usageTracker.checkFeatureAccess(userId, 'aiAnalyses')
  }
  
  async canAccessCompatibilityAnalysis(userId: string): Promise<boolean> {
    return await this.usageTracker.checkFeatureAccess(userId, 'compatibilityAnalyses')
  }
  
  async canAccessRenamingSuggestions(userId: string): Promise<boolean> {
    return await this.usageTracker.checkFeatureAccess(userId, 'renamingSuggestions')
  }
}
```

#### 2.2 プレミアム機能のUI実装
```typescript
// components/PremiumFeatureGate.tsx
export function PremiumFeatureGate({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkFeatureAccess(user.id, feature)
      setHasAccess(access)
      setLoading(false)
    }
    
    if (user) {
      checkAccess()
    }
  }, [user, feature])
  
  if (loading) {
    return <div>読み込み中...</div>
  }
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  return fallback || <PremiumUpgradePrompt feature={feature} />
}
```

### Phase 3: 広告収入システム（1週間）

#### 3.1 広告表示制御
```typescript
// components/AdDisplay.tsx
export function AdDisplay({ 
  adType = 'banner',
  placement = 'bottom'
}: { 
  adType?: 'banner' | 'interstitial' | 'rewarded'
  placement?: 'top' | 'bottom' | 'middle'
}) {
  const { user } = useAuth()
  const [showAd, setShowAd] = useState(false)
  
  useEffect(() => {
    // 無料ユーザーのみ広告を表示
    if (user?.planId === 'free') {
      setShowAd(true)
    }
  }, [user])
  
  if (!showAd) return null
  
  return (
    <div className={`ad-container ad-${placement}`}>
      {adType === 'banner' && <BannerAd />}
      {adType === 'interstitial' && <InterstitialAd />}
      {adType === 'rewarded' && <RewardedAd />}
    </div>
  )
}
```

#### 3.2 広告収入追跡
```typescript
// lib/ad-revenue-tracker.ts
export class AdRevenueTracker {
  async trackAdImpression(adId: string, userId: string, adType: string) {
    await fetch('/api/analytics/ad-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId,
        userId,
        adType,
        timestamp: new Date().toISOString()
      })
    })
  }
  
  async trackAdClick(adId: string, userId: string, adType: string) {
    await fetch('/api/analytics/ad-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId,
        userId,
        adType,
        timestamp: new Date().toISOString()
      })
    })
  }
}
```

### Phase 4: 追加サービス実装（1-2週間）

#### 4.1 詳細レポート機能
```typescript
// lib/report-generator.ts
export class ReportGenerator {
  async generateDetailedReport(
    nameAnalysis: NameAnalysisResult,
    aiAnalysis?: AIAnalysisResult
  ): Promise<DetailedReport> {
    const report: DetailedReport = {
      id: generateReportId(),
      nameAnalysis,
      aiAnalysis,
      generatedAt: new Date().toISOString(),
      reportType: 'detailed'
    }
    
    // PDF生成
    const pdfBuffer = await this.generatePDF(report)
    
    return {
      ...report,
      pdfBuffer
    }
  }
  
  private async generatePDF(report: DetailedReport): Promise<Buffer> {
    // PDF生成ロジック（jsPDF等を使用）
    const doc = new jsPDF()
    
    // レポート内容をPDFに追加
    doc.text('姓名判断詳細レポート', 20, 20)
    doc.text(`姓名: ${report.nameAnalysis.lastName} ${report.nameAnalysis.firstName}`, 20, 40)
    
    return doc.output('arraybuffer')
  }
}
```

#### 4.2 改名コンサル機能
```typescript
// lib/renaming-consultant.ts
export class RenamingConsultant {
  async provideConsultation(
    currentName: string,
    goals: string[],
    preferences: RenamingPreferences
  ): Promise<ConsultationResult> {
    // 既存の改名AIロジックを活用
    const suggestions = await this.generateOptimalNames(
      currentName,
      goals,
      preferences
    )
    
    const consultation: ConsultationResult = {
      id: generateConsultationId(),
      currentName,
      goals,
      suggestions,
      consultationDate: new Date().toISOString(),
      consultant: 'AIコンサルタント'
    }
    
    return consultation
  }
}
```

### Phase 5: 決済システム拡張（1週間）

#### 5.1 ワンタイム決済API
```typescript
// app/api/payment/one-time/route.ts
export async function POST(request: NextRequest) {
  try {
    const { amount, description, userId } = await request.json()
    
    // Square決済APIを使用
    const payment = await createSquarePayment({
      amount: amount * 100, // 円をセントに変換
      currency: 'JPY',
      description,
      customerId: userId
    })
    
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: payment.paymentUrl
    })
  } catch (error) {
    return NextResponse.json({ error: '決済処理に失敗しました' }, { status: 500 })
  }
}
```

#### 5.2 サブスクリプション管理API
```typescript
// app/api/subscription/manage/route.ts
export async function POST(request: NextRequest) {
  try {
    const { action, userId, planId } = await request.json()
    
    switch (action) {
      case 'upgrade':
        await upgradeSubscription(userId, planId)
        break
      case 'downgrade':
        await downgradeSubscription(userId, planId)
        break
      case 'cancel':
        await cancelSubscription(userId)
        break
      case 'pause':
        await pauseSubscription(userId)
        break
    }
    
    return NextResponse.json({
      success: true,
      message: `${action}が完了しました`
    })
  } catch (error) {
    return NextResponse.json({ error: 'サブスクリプション管理に失敗しました' }, { status: 500 })
  }
}
```

## 実装スケジュール

### Week 1: サブスクリプション機能拡張
- [ ] プレミアムプラン定義
- [ ] 使用量追跡システム
- [ ] アクセス制御実装

### Week 2: AI機能の段階的解放
- [ ] AI分析の制限実装
- [ ] プレミアム機能のUI実装
- [ ] アップグレードプロンプト

### Week 3: 広告収入システム
- [ ] 広告表示制御
- [ ] 広告収入追跡
- [ ] 広告最適化

### Week 4: 追加サービス実装
- [ ] 詳細レポート機能
- [ ] 改名コンサル機能
- [ ] PDF生成機能

### Week 5: 決済システム拡張
- [ ] ワンタイム決済API
- [ ] サブスクリプション管理API
- [ ] 決済フロー最適化

## 収益予測

### 月間収益予測（実装後6ヶ月）
- **サブスクリプション収入**: ¥500,000-1,000,000
- **広告収入**: ¥200,000-500,000
- **追加サービス収入**: ¥100,000-300,000
- **合計**: ¥800,000-1,800,000

### 年間収益予測
- **保守的見積もり**: ¥9,600,000
- **楽観的見積もり**: ¥21,600,000

## 成功指標

### 収益指標
- 月間収益: ¥800,000以上
- ARPU: ¥1,000以上
- LTV/CAC: 3:1以上
- チャーン率: 5%以下

### ユーザー指標
- サブスクリプション率: 10%以上
- プレミアム機能利用率: 60%以上
- 広告CTR: 2%以上
- ユーザー満足度: 80%以上

## 次のステップ

1. **サブスクリプション機能拡張**: プレミアムプランの実装
2. **AI機能の段階的解放**: アクセス制御の実装
3. **広告収入システム**: 広告表示と収益追跡の実装
4. **追加サービス**: 詳細レポートと改名コンサルの実装
5. **決済システム拡張**: ワンタイム決済とサブスクリプション管理の実装
