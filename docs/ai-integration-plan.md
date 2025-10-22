# AI統合実装計画

## 概要
既存の姓名判断アプリにAI機能を統合し、「完全旧字体 + AI」による次世代姓名判断サービスを実現する。

## 既存資産の活用

### 1. 完全旧字体対応システム（既存）
- ✅ 124種類の新字体→旧字体変換テーブル
- ✅ 自動変換機能（`convertToOldKanji`）
- ✅ 霊数計算ロジック
- ✅ 正確な画数計算システム

### 2. 決済・認証システム（既存）
- ✅ Square決済API統合済み
- ✅ Webhook処理システム
- ✅ サブスクリプション管理
- ✅ セキュリティ機能

## AI統合実装計画

### Phase 1: AI基盤構築（2-3週間）

#### 1.1 OpenAI API統合
```typescript
// lib/ai/openai-client.ts
export class OpenAIClient {
  private apiKey: string
  private model: string = 'gpt-4'

  async generateNameAnalysis(
    nameData: NameAnalysisResult,
    userContext?: UserContext
  ): Promise<AIAnalysisResult>
  
  async generateCompatibilityAnalysis(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult
  ): Promise<CompatibilityAnalysis>
  
  async generateRenamingSuggestions(
    currentName: string,
    targetGoals: string[]
  ): Promise<RenamingSuggestion[]>
}
```

#### 1.2 カスタムプロンプト開発
```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  PERSONALITY_ANALYSIS: `
あなたは姓名判断の専門家です。以下の情報を基に、深層心理分析を行ってください。

姓名データ:
- 天格: {tenFormat}画 ({tenFortune})
- 人格: {jinFormat}画 ({jinFortune})  
- 地格: {chiFormat}画 ({chiFortune})
- 外格: {gaiFormat}画 ({gaiFortune})
- 総格: {totalFormat}画 ({totalFortune})

旧字体変換: {oldKanjiConversion}

以下の観点で分析してください:
1. 深層心理的特徴
2. 潜在的な才能・適性
3. 人生における課題と解決策
4. 具体的なアドバイス

回答は日本語で、専門的でありながら親しみやすい文体でお願いします。
`,

  COMPATIBILITY_ANALYSIS: `
あなたは姓名判断の専門家です。二人の姓名データを基に、相性分析を行ってください。

[人物A]
{nameAData}

[人物B]  
{nameBData}

以下の観点で相性を分析してください:
1. 基本的な相性度合い（0-100点）
2. 強みとなる関係性
3. 注意すべき点
4. より良い関係を築くためのアドバイス
5. 結婚・恋愛・ビジネス・友人関係での相性

回答は具体的で実用的なアドバイスを含めてください。
`
}
```

### Phase 2: AI機能実装（3-4週間）

#### 2.1 深層心理分析AI
```typescript
// lib/ai/personality-analyzer.ts
export class PersonalityAnalyzer {
  async analyzePersonality(
    nameAnalysis: NameAnalysisResult,
    userContext?: UserContext
  ): Promise<PersonalityAnalysis> {
    const prompt = PROMPTS.PERSONALITY_ANALYSIS
      .replace('{tenFormat}', nameAnalysis.tenFormat.toString())
      .replace('{tenFortune}', nameAnalysis.tenFortune.fortune)
      // ... 他の置換処理

    const response = await this.openaiClient.generateNameAnalysis(nameAnalysis, userContext)
    
    return {
      personality: response.personality,
      talents: response.talents,
      challenges: response.challenges,
      advice: response.advice,
      confidence: response.confidence
    }
  }
}
```

#### 2.2 相性分析AI
```typescript
// lib/ai/compatibility-analyzer.ts
export class CompatibilityAnalyzer {
  async analyzeCompatibility(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult,
    relationshipType: 'romance' | 'business' | 'friendship' | 'family'
  ): Promise<CompatibilityAnalysis> {
    // 既存の姓名判断データを活用
    const prompt = PROMPTS.COMPATIBILITY_ANALYSIS
      .replace('{nameAData}', this.formatNameData(name1))
      .replace('{nameBData}', this.formatNameData(name2))

    const response = await this.openaiClient.generateCompatibilityAnalysis(name1, name2)
    
    return {
      overallScore: response.overallScore,
      strengths: response.strengths,
      challenges: response.challenges,
      advice: response.advice,
      relationshipType
    }
  }
}
```

#### 2.3 改名AIコンサルタント
```typescript
// lib/ai/renaming-consultant.ts
export class RenamingConsultant {
  async generateSuggestions(
    currentName: string,
    targetGoals: string[],
    preferences?: RenamingPreferences
  ): Promise<RenamingSuggestion[]> {
    // 既存の旧字体変換システムを活用
    const currentAnalysis = analyzeNameFortune(currentName, '')
    
    const suggestions = await this.generateOptimalNames(
      currentAnalysis,
      targetGoals,
      preferences
    )
    
    return suggestions.map(suggestion => ({
      name: suggestion.name,
      oldKanji: convertToOldKanji(suggestion.name),
      analysis: analyzeNameFortune(suggestion.name, ''),
      improvement: this.calculateImprovement(currentAnalysis, suggestion.analysis),
      reasoning: suggestion.reasoning
    }))
  }
}
```

### Phase 3: API統合（1-2週間）

#### 3.1 AI分析API
```typescript
// app/api/ai/analyze-personality/route.ts
export async function POST(request: NextRequest) {
  try {
    const { lastName, firstName, userContext } = await request.json()
    
    // 既存の姓名判断ロジックを活用
    const nameAnalysis = analyzeNameFortune(lastName, firstName)
    
    // AI分析を実行
    const personalityAnalyzer = new PersonalityAnalyzer()
    const aiAnalysis = await personalityAnalyzer.analyzePersonality(
      nameAnalysis,
      userContext
    )
    
    return NextResponse.json({
      success: true,
      traditionalAnalysis: nameAnalysis,
      aiAnalysis: aiAnalysis
    })
  } catch (error) {
    return NextResponse.json({ error: 'AI分析に失敗しました' }, { status: 500 })
  }
}
```

#### 3.2 相性分析API
```typescript
// app/api/ai/analyze-compatibility/route.ts
export async function POST(request: NextRequest) {
  try {
    const { name1, name2, relationshipType } = await request.json()
    
    // 既存の姓名判断ロジックを活用
    const analysis1 = analyzeNameFortune(name1.lastName, name1.firstName)
    const analysis2 = analyzeNameFortune(name2.lastName, name2.firstName)
    
    // AI相性分析を実行
    const compatibilityAnalyzer = new CompatibilityAnalyzer()
    const compatibility = await compatibilityAnalyzer.analyzeCompatibility(
      analysis1,
      analysis2,
      relationshipType
    )
    
    return NextResponse.json({
      success: true,
      name1Analysis: analysis1,
      name2Analysis: analysis2,
      compatibility: compatibility
    })
  } catch (error) {
    return NextResponse.json({ error: '相性分析に失敗しました' }, { status: 500 })
  }
}
```

### Phase 4: フロントエンド統合（2-3週間）

#### 4.1 AI分析コンポーネント
```typescript
// components/ai/AIAnalysisSection.tsx
export function AIAnalysisSection({ nameAnalysis }: { nameAnalysis: NameAnalysisResult }) {
  const [aiAnalysis, setAiAnalysis] = useState<PersonalityAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAIAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/analyze-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: nameAnalysis.lastName,
          firstName: nameAnalysis.firstName
        })
      })
      
      const data = await response.json()
      setAiAnalysis(data.aiAnalysis)
    } catch (error) {
      console.error('AI分析エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-analysis-section">
      <h3>🤖 AI深層心理分析</h3>
      <button onClick={handleAIAnalysis} disabled={loading}>
        {loading ? '分析中...' : 'AI分析を実行'}
      </button>
      
      {aiAnalysis && (
        <div className="ai-results">
          <div className="personality">
            <h4>深層心理的特徴</h4>
            <p>{aiAnalysis.personality}</p>
          </div>
          
          <div className="talents">
            <h4>潜在的な才能</h4>
            <p>{aiAnalysis.talents}</p>
          </div>
          
          <div className="advice">
            <h4>具体的なアドバイス</h4>
            <p>{aiAnalysis.advice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

## 技術的考慮事項

### 1. パフォーマンス最適化
- AI分析結果のキャッシュ機能
- 非同期処理によるUX向上
- プログレッシブローディング

### 2. エラーハンドリング
- OpenAI API制限への対応
- フォールバック機能
- ユーザーフレンドリーなエラーメッセージ

### 3. セキュリティ
- API キーの適切な管理
- レート制限の実装
- 入力値の検証・サニタイゼーション

## 実装スケジュール

### Week 1-2: AI基盤構築
- [ ] OpenAI API統合
- [ ] カスタムプロンプト開発
- [ ] 基本的なAI分析機能

### Week 3-4: コアAI機能
- [ ] 深層心理分析AI
- [ ] 相性分析AI
- [ ] 改名コンサルタントAI

### Week 5-6: API統合
- [ ] AI分析API
- [ ] 相性分析API
- [ ] エラーハンドリング

### Week 7-8: フロントエンド統合
- [ ] AI分析UI
- [ ] 相性分析UI
- [ ] 改名提案UI

## 成功指標

### 技術指標
- AI分析の応答時間: 3秒以内
- 分析精度: ユーザー満足度80%以上
- エラー率: 1%以下

### ビジネス指標
- AI機能の利用率: 60%以上
- プレミアム機能への転換率: 15%以上
- ユーザーエンゲージメント: 50%向上

## 次のステップ

1. **環境変数の設定**: OpenAI API キーの設定
2. **プロトタイプ開発**: 基本的なAI分析機能の実装
3. **ユーザーテスト**: 初期ユーザーによる機能テスト
4. **フィードバック収集**: 分析結果の精度向上
5. **本格実装**: 全機能の実装と最適化
