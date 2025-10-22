import OpenAI from 'openai'

export class OpenAIClient {
  private client: OpenAI
  private model: string = 'gpt-4'

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    })
  }

  async generateNameAnalysis(
    nameData: NameAnalysisResult,
    userContext?: UserContext
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildPersonalityAnalysisPrompt(nameData, userContext)
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'あなたは姓名判断の専門家です。旧字体による正確な画数計算と深層心理分析を行い、ユーザーに価値のある洞察を提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('AI analysis response is empty')
      }

      return this.parseAIResponse(content, nameData)
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('AI分析の生成に失敗しました')
    }
  }

  async generateCompatibilityAnalysis(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult,
    relationshipType: 'romance' | 'business' | 'friendship' | 'family' = 'romance'
  ): Promise<CompatibilityAnalysis> {
    try {
      const prompt = this.buildCompatibilityAnalysisPrompt(name1, name2, relationshipType)
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'あなたは姓名判断と相性分析の専門家です。二人の姓名データを基に、深い洞察に基づいた相性分析を提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('AI compatibility analysis response is empty')
      }

      return this.parseCompatibilityResponse(content, name1, name2, relationshipType)
    } catch (error) {
      console.error('OpenAI compatibility analysis error:', error)
      throw new Error('相性分析の生成に失敗しました')
    }
  }

  private buildPersonalityAnalysisPrompt(
    nameData: NameAnalysisResult,
    userContext?: UserContext
  ): string {
    return `
姓名判断データ:
- 姓名: ${nameData.lastName} ${nameData.firstName}
- 天格: ${nameData.tenFormat}画 (${nameData.tenFortune.fortune})
- 人格: ${nameData.jinFormat}画 (${nameData.jinFortune.fortune})
- 地格: ${nameData.chiFormat}画 (${nameData.chiFortune.fortune})
- 外格: ${nameData.gaiFormat}画 (${nameData.gaiFortune.fortune})
- 総格: ${nameData.totalFormat}画 (${nameData.totalFortune.fortune})
- 総合スコア: ${nameData.overallScore}/100

旧字体変換: ${nameData.hasChanged ? 'あり' : 'なし'}

以下の観点で深層心理分析を行ってください:

1. **深層心理的特徴**
   - 基本的な性格の特徴
   - 潜在的な思考パターン
   - 感情の表現方法

2. **潜在的な才能・適性**
   - 得意分野や才能
   - 職業適性
   - 学習スタイル

3. **人生における課題と解決策**
   - 注意すべき点
   - 改善のアドバイス
   - 成長の方向性

4. **具体的なアドバイス**
   - 日常での活かし方
   - 人間関係でのポイント
   - 人生の転機での対応

回答は専門的でありながら親しみやすい文体で、具体的で実用的な内容にしてください。
    `.trim()
  }

  private buildCompatibilityAnalysisPrompt(
    name1: NameAnalysisResult,
    name2: NameAnalysisResult,
    relationshipType: string
  ): string {
    return `
二人の姓名判断データ:

[人物A: ${name1.lastName} ${name1.firstName}]
- 天格: ${name1.tenFormat}画 (${name1.tenFortune.fortune})
- 人格: ${name1.jinFormat}画 (${name1.jinFortune.fortune})
- 地格: ${name1.chiFormat}画 (${name1.chiFortune.fortune})
- 総格: ${name1.totalFormat}画 (${name1.totalFortune.fortune})
- 総合スコア: ${name1.overallScore}/100

[人物B: ${name2.lastName} ${name2.firstName}]
- 天格: ${name2.tenFormat}画 (${name2.tenFortune.fortune})
- 人格: ${name2.jinFormat}画 (${name2.jinFortune.fortune})
- 地格: ${name2.chiFormat}画 (${name2.chiFortune.fortune})
- 総格: ${name2.totalFormat}画 (${name2.totalFortune.fortune})
- 総合スコア: ${name2.overallScore}/100

関係性: ${relationshipType}

以下の観点で相性分析を行ってください:

1. **基本的な相性度合い (0-100点)**
   - 総合的な相性スコア
   - 相性の根拠

2. **強みとなる関係性**
   - お互いの良い影響
   - 補完し合える点
   - 共通の価値観

3. **注意すべき点**
   - 潜在的な対立点
   - 理解し合うべき違い
   - 改善の余地

4. **より良い関係を築くためのアドバイス**
   - 具体的な行動提案
   - コミュニケーションのコツ
   - 関係性の発展方法

回答は具体的で実用的なアドバイスを含めてください。
    `.trim()
  }

  private parseAIResponse(content: string, nameData: NameAnalysisResult): AIAnalysisResult {
    // AI応答をパースして構造化されたデータに変換
    return {
      personality: this.extractSection(content, '深層心理的特徴'),
      talents: this.extractSection(content, '潜在的な才能・適性'),
      challenges: this.extractSection(content, '人生における課題と解決策'),
      advice: this.extractSection(content, '具体的なアドバイス'),
      confidence: 85, // AI分析の信頼度
      generatedAt: new Date().toISOString(),
      nameData: nameData
    }
  }

  private parseCompatibilityResponse(
    content: string,
    name1: NameAnalysisResult,
    name2: NameAnalysisResult,
    relationshipType: string
  ): CompatibilityAnalysis {
    return {
      overallScore: this.extractScore(content),
      strengths: this.extractSection(content, '強みとなる関係性'),
      challenges: this.extractSection(content, '注意すべき点'),
      advice: this.extractSection(content, 'より良い関係を築くためのアドバイス'),
      relationshipType: relationshipType as any,
      generatedAt: new Date().toISOString(),
      name1Data: name1,
      name2Data: name2
    }
  }

  private extractSection(content: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\d+\\.|$)`, 'g')
    const match = content.match(regex)
    return match ? match[0].replace(`${sectionName}`, '').trim() : ''
  }

  private extractScore(content: string): number {
    const scoreMatch = content.match(/(\d+)点/)
    return scoreMatch ? parseInt(scoreMatch[1]) : 75
  }
}

// 型定義
export interface NameAnalysisResult {
  lastName: string
  firstName: string
  tenFormat: number
  jinFormat: number
  chiFormat: number
  gaiFormat: number
  totalFormat: number
  tenFortune: { fortune: string }
  jinFortune: { fortune: string }
  chiFortune: { fortune: string }
  gaiFortune: { fortune: string }
  totalFortune: { fortune: string }
  overallScore: number
  hasChanged: boolean
}

export interface UserContext {
  age?: number
  gender?: string
  occupation?: string
  goals?: string[]
}

export interface AIAnalysisResult {
  personality: string
  talents: string
  challenges: string
  advice: string
  confidence: number
  generatedAt: string
  nameData: NameAnalysisResult
}

export interface CompatibilityAnalysis {
  overallScore: number
  strengths: string
  challenges: string
  advice: string
  relationshipType: 'romance' | 'business' | 'friendship' | 'family'
  generatedAt: string
  name1Data: NameAnalysisResult
  name2Data: NameAnalysisResult
}
