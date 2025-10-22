import { OpenAIClient, NameAnalysisResult, CompatibilityAnalysis } from './openai-client'
import { PROMPTS, replacePromptTemplate, formatCompatibilityDataForPrompt } from './prompts'

export class CompatibilityAnalyzer {
  private openaiClient: OpenAIClient

  constructor() {
    this.openaiClient = new OpenAIClient()
  }

  async analyzeCompatibility(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult,
    relationshipType: 'romance' | 'business' | 'friendship' | 'family' = 'romance'
  ): Promise<CompatibilityAnalysisResult> {
    try {
      // 相性分析データをプロンプト用にフォーマット
      const promptData = formatCompatibilityDataForPrompt(name1, name2, relationshipType)
      
      // プロンプトテンプレートを置換
      const prompt = replacePromptTemplate(PROMPTS.COMPATIBILITY_ANALYSIS, promptData)

      // OpenAI APIで分析実行
      const aiResult = await this.openaiClient.generateCompatibilityAnalysis(name1, name2, relationshipType)

      // 結果を構造化
      return {
        overallScore: aiResult.overallScore,
        strengths: aiResult.strengths,
        challenges: aiResult.challenges,
        advice: aiResult.advice,
        relationshipType: aiResult.relationshipType,
        generatedAt: aiResult.generatedAt,
        name1Data: aiResult.name1Data,
        name2Data: aiResult.name2Data,
        
        // 追加の分析結果
        compatibilityLevel: this.calculateCompatibilityLevel(aiResult.overallScore),
        keyStrengths: this.extractKeyStrengths(aiResult.strengths),
        potentialIssues: this.extractPotentialIssues(aiResult.challenges),
        actionItems: this.extractActionItems(aiResult.advice),
        relationshipAdvice: this.extractRelationshipAdvice(aiResult.advice, relationshipType)
      }
    } catch (error) {
      console.error('Compatibility analysis error:', error)
      throw new Error('相性分析の実行に失敗しました')
    }
  }

  async analyzeMultipleRelationships(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult
  ): Promise<MultiRelationshipAnalysis> {
    const relationshipTypes: ('romance' | 'business' | 'friendship' | 'family')[] = 
      ['romance', 'business', 'friendship', 'family']
    
    const analyses = await Promise.all(
      relationshipTypes.map(type => 
        this.analyzeCompatibility(name1, name2, type)
          .catch(error => {
            console.error(`Multi-relationship analysis error for ${type}:`, error)
            return null
          })
      )
    )

    const validAnalyses = analyses.filter(analysis => analysis !== null) as CompatibilityAnalysisResult[]
    
    return {
      name1Data: name1,
      name2Data: name2,
      analyses: validAnalyses,
      overallCompatibility: this.calculateOverallCompatibility(validAnalyses),
      bestRelationshipType: this.findBestRelationshipType(validAnalyses),
      generatedAt: new Date().toISOString()
    }
  }

  private calculateCompatibilityLevel(score: number): string {
    if (score >= 90) return '最高'
    if (score >= 80) return 'とても良い'
    if (score >= 70) return '良い'
    if (score >= 60) return '普通'
    if (score >= 50) return 'やや低い'
    return '低い'
  }

  private extractKeyStrengths(strengthsText: string): string[] {
    const strengths: string[] = []
    
    const strengthKeywords = [
      '理解し合える', '補完し合える', '共通の価値観', 'お互いを高め合う',
      '信頼関係', '協調性', 'コミュニケーション', '相性の良さ',
      '支え合い', '成長し合える', '尊重し合える', '助け合える'
    ]

    strengthKeywords.forEach(keyword => {
      if (strengthsText.includes(keyword)) {
        strengths.push(keyword)
      }
    })

    return strengths.length > 0 ? strengths : ['良好な関係性が期待されます']
  }

  private extractPotentialIssues(challengesText: string): string[] {
    const issues: string[] = []
    
    const issueKeywords = [
      '価値観の違い', 'コミュニケーション', '理解不足', '対立',
      'ストレス', '誤解', '意見の相違', '時間の使い方',
      '優先順位', '期待値', '性格の違い', '生活スタイル'
    ]

    issueKeywords.forEach(keyword => {
      if (challengesText.includes(keyword)) {
        issues.push(keyword)
      }
    })

    return issues.length > 0 ? issues : ['お互いを理解し合うことが重要です']
  }

  private extractActionItems(adviceText: string): string[] {
    const actionItems: string[] = []
    
    // 文章を分割して、具体的な行動提案を抽出
    const sentences = adviceText.split(/[。！？]/).filter(s => s.trim().length > 0)
    
    sentences.forEach(sentence => {
      if (sentence.trim().length > 10 && sentence.trim().length < 100) {
        // 動詞で始まる文を行動提案として抽出
        if (sentence.match(/^[は-ん]*[する|する|行う|試す|心がける|意識する]/)) {
          actionItems.push(sentence.trim())
        }
      }
    })

    return actionItems.slice(0, 5) // 最大5つの行動提案
  }

  private extractRelationshipAdvice(
    adviceText: string, 
    relationshipType: string
  ): string {
    // 関係性別のアドバイスを抽出
    const typeSpecificAdvice = {
      romance: '恋愛関係での具体的なアドバイス',
      business: 'ビジネス関係での具体的なアドバイス',
      friendship: '友人関係での具体的なアドバイス',
      family: '家族関係での具体的なアドバイス'
    }

    return typeSpecificAdvice[relationshipType as keyof typeof typeSpecificAdvice] || adviceText
  }

  private calculateOverallCompatibility(analyses: CompatibilityAnalysisResult[]): number {
    if (analyses.length === 0) return 0
    
    const totalScore = analyses.reduce((sum, analysis) => sum + analysis.overallScore, 0)
    return Math.round(totalScore / analyses.length)
  }

  private findBestRelationshipType(analyses: CompatibilityAnalysisResult[]): string {
    if (analyses.length === 0) return '不明'
    
    const bestAnalysis = analyses.reduce((best, current) => 
      current.overallScore > best.overallScore ? current : best
    )
    
    const typeNames = {
      romance: '恋愛・結婚',
      business: 'ビジネス',
      friendship: '友情',
      family: '家族関係'
    }
    
    return typeNames[bestAnalysis.relationshipType as keyof typeof typeNames] || '不明'
  }

  // 分析結果の検証
  validateAnalysis(analysis: CompatibilityAnalysisResult): boolean {
    return (
      analysis.overallScore >= 0 &&
      analysis.overallScore <= 100 &&
      analysis.strengths.length > 0 &&
      analysis.challenges.length > 0 &&
      analysis.advice.length > 0
    )
  }

  // 相性スコアの詳細分析
  analyzeScoreBreakdown(analysis: CompatibilityAnalysisResult): ScoreBreakdown {
    return {
      overall: analysis.overallScore,
      communication: this.calculateCommunicationScore(analysis),
      values: this.calculateValuesScore(analysis),
      lifestyle: this.calculateLifestyleScore(analysis),
      emotional: this.calculateEmotionalScore(analysis)
    }
  }

  private calculateCommunicationScore(analysis: CompatibilityAnalysisResult): number {
    // コミュニケーション関連のキーワードを基にスコア計算
    const communicationKeywords = ['コミュニケーション', '理解', '話し合い', '対話']
    let score = 50
    
    communicationKeywords.forEach(keyword => {
      if (analysis.strengths.includes(keyword)) score += 10
      if (analysis.challenges.includes(keyword)) score -= 10
    })
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateValuesScore(analysis: CompatibilityAnalysisResult): number {
    const valuesKeywords = ['価値観', '考え方', '信念', '目標']
    let score = 50
    
    valuesKeywords.forEach(keyword => {
      if (analysis.strengths.includes(keyword)) score += 15
      if (analysis.challenges.includes(keyword)) score -= 15
    })
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateLifestyleScore(analysis: CompatibilityAnalysisResult): number {
    const lifestyleKeywords = ['生活', '時間', '趣味', 'ライフスタイル']
    let score = 50
    
    lifestyleKeywords.forEach(keyword => {
      if (analysis.strengths.includes(keyword)) score += 12
      if (analysis.challenges.includes(keyword)) score -= 12
    })
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateEmotionalScore(analysis: CompatibilityAnalysisResult): number {
    const emotionalKeywords = ['感情', '愛情', '信頼', '支え']
    let score = 50
    
    emotionalKeywords.forEach(keyword => {
      if (analysis.strengths.includes(keyword)) score += 13
      if (analysis.challenges.includes(keyword)) score -= 13
    })
    
    return Math.max(0, Math.min(100, score))
  }
}

// 拡張された相性分析結果の型定義
export interface CompatibilityAnalysisResult extends CompatibilityAnalysis {
  compatibilityLevel: string
  keyStrengths: string[]
  potentialIssues: string[]
  actionItems: string[]
  relationshipAdvice: string
}

// 複数関係性分析結果
export interface MultiRelationshipAnalysis {
  name1Data: NameAnalysisResult
  name2Data: NameAnalysisResult
  analyses: CompatibilityAnalysisResult[]
  overallCompatibility: number
  bestRelationshipType: string
  generatedAt: string
}

// スコア詳細分析
export interface ScoreBreakdown {
  overall: number
  communication: number
  values: number
  lifestyle: number
  emotional: number
}
