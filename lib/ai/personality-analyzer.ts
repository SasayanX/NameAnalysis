import { OpenAIClient, NameAnalysisResult, UserContext, AIAnalysisResult } from './openai-client'
import { PROMPTS, replacePromptTemplate, formatNameDataForPrompt } from './prompts'

export class PersonalityAnalyzer {
  private openaiClient: OpenAIClient

  constructor() {
    this.openaiClient = new OpenAIClient()
  }

  async analyzePersonality(
    nameAnalysis: NameAnalysisResult,
    userContext?: UserContext
  ): Promise<PersonalityAnalysis> {
    try {
      // 姓名判断データをプロンプト用にフォーマット
      const promptData = formatNameDataForPrompt(nameAnalysis)
      
      // ユーザーコンテキストを追加
      if (userContext) {
        Object.assign(promptData, {
          age: userContext.age || '',
          gender: userContext.gender || '',
          occupation: userContext.occupation || '',
          goals: userContext.goals?.join(', ') || ''
        })
      }

      // プロンプトテンプレートを置換
      const prompt = replacePromptTemplate(PROMPTS.PERSONALITY_ANALYSIS, promptData)

      // OpenAI APIで分析実行
      const aiResult = await this.openaiClient.generateNameAnalysis(nameAnalysis, userContext)

      // 結果を構造化
      return {
        personality: aiResult.personality,
        talents: aiResult.talents,
        challenges: aiResult.challenges,
        advice: aiResult.advice,
        confidence: aiResult.confidence,
        generatedAt: aiResult.generatedAt,
        nameData: nameAnalysis,
        userContext: userContext,
        
        // 追加の分析結果
        personalityTraits: this.extractPersonalityTraits(aiResult.personality),
        careerSuggestions: this.extractCareerSuggestions(aiResult.talents),
        improvementAreas: this.extractImprovementAreas(aiResult.challenges),
        dailyTips: this.extractDailyTips(aiResult.advice)
      }
    } catch (error) {
      console.error('Personality analysis error:', error)
      throw new Error('深層心理分析の実行に失敗しました')
    }
  }

  async analyzePersonalityBatch(
    nameAnalyses: NameAnalysisResult[],
    userContext?: UserContext
  ): Promise<PersonalityAnalysis[]> {
    const results: PersonalityAnalysis[] = []
    
    // 並列処理で効率化
    const promises = nameAnalyses.map(nameAnalysis => 
      this.analyzePersonality(nameAnalysis, userContext)
        .catch(error => {
          console.error(`Batch analysis error for ${nameAnalysis.lastName} ${nameAnalysis.firstName}:`, error)
          return null
        })
    )

    const batchResults = await Promise.all(promises)
    
    // 成功した結果のみを返す
    return batchResults.filter(result => result !== null) as PersonalityAnalysis[]
  }

  private extractPersonalityTraits(personalityText: string): string[] {
    // 性格特徴を抽出するロジック
    const traits: string[] = []
    
    // キーワードベースの抽出
    const traitKeywords = [
      'リーダーシップ', '協調性', '創造性', '分析力', '直感力',
      '責任感', '積極性', '慎重さ', '社交性', '内向性',
      '楽観的', '悲観的', '現実的', '理想主義', '実用主義'
    ]

    traitKeywords.forEach(keyword => {
      if (personalityText.includes(keyword)) {
        traits.push(keyword)
      }
    })

    return traits.length > 0 ? traits : ['個性的', 'バランス感覚']
  }

  private extractCareerSuggestions(talentsText: string): string[] {
    // 職業提案を抽出するロジック
    const suggestions: string[] = []
    
    const careerKeywords = [
      '経営', '営業', 'マーケティング', 'デザイン', 'エンジニア',
      '教育', '医療', '法律', '芸術', '研究',
      'サービス業', '製造業', 'IT', '金融', 'コンサルティング'
    ]

    careerKeywords.forEach(keyword => {
      if (talentsText.includes(keyword)) {
        suggestions.push(keyword)
      }
    })

    return suggestions.length > 0 ? suggestions : ['多様な分野での活躍が期待されます']
  }

  private extractImprovementAreas(challengesText: string): string[] {
    // 改善点を抽出するロジック
    const areas: string[] = []
    
    const improvementKeywords = [
      'コミュニケーション', '時間管理', 'ストレス管理', '決断力',
      '継続力', '柔軟性', '集中力', '自信', '協調性'
    ]

    improvementKeywords.forEach(keyword => {
      if (challengesText.includes(keyword)) {
        areas.push(keyword)
      }
    })

    return areas.length > 0 ? areas : ['継続的な成長が重要です']
  }

  private extractDailyTips(adviceText: string): string[] {
    // 日常のアドバイスを抽出するロジック
    const tips: string[] = []
    
    // 文章を分割して、短いアドバイスを抽出
    const sentences = adviceText.split(/[。！？]/).filter(s => s.trim().length > 0)
    
    sentences.forEach(sentence => {
      if (sentence.trim().length > 10 && sentence.trim().length < 100) {
        tips.push(sentence.trim())
      }
    })

    return tips.slice(0, 3) // 最大3つのアドバイス
  }

  // 分析結果の検証
  validateAnalysis(analysis: PersonalityAnalysis): boolean {
    return (
      analysis.personality.length > 0 &&
      analysis.talents.length > 0 &&
      analysis.challenges.length > 0 &&
      analysis.advice.length > 0 &&
      analysis.confidence >= 0 &&
      analysis.confidence <= 100
    )
  }

  // 分析結果の品質評価
  evaluateAnalysisQuality(analysis: PersonalityAnalysis): number {
    let score = 0
    
    // 各セクションの長さを評価
    if (analysis.personality.length > 100) score += 25
    if (analysis.talents.length > 100) score += 25
    if (analysis.challenges.length > 100) score += 25
    if (analysis.advice.length > 100) score += 25
    
    return Math.min(score, 100)
  }
}

// 拡張された分析結果の型定義
export interface PersonalityAnalysis extends AIAnalysisResult {
  userContext?: UserContext
  personalityTraits: string[]
  careerSuggestions: string[]
  improvementAreas: string[]
  dailyTips: string[]
}

// 分析結果の統計情報
export interface AnalysisStats {
  totalAnalyses: number
  averageConfidence: number
  averageQuality: number
  mostCommonTraits: string[]
  mostCommonCareers: string[]
}
