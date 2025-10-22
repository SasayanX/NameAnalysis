import { NextRequest, NextResponse } from 'next/server'
import { PersonalityAnalyzer } from '@/lib/ai/personality-analyzer'
import { CompatibilityAnalyzer } from '@/lib/ai/compatibility-analyzer'
import { analyzeNameServer } from '@/lib/name-analysis-server'

export async function POST(request: NextRequest) {
  try {
    const { 
      analysisType,
      names,
      relationshipType = 'romance'
    } = await request.json()
    
    // 入力値の検証
    if (!analysisType || !names || !Array.isArray(names)) {
      return NextResponse.json(
        { error: '分析タイプと名前の配列を指定してください' },
        { status: 400 }
      )
    }

    const validAnalysisTypes = ['personality', 'compatibility', 'both']
    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json(
        { error: '無効な分析タイプです' },
        { status: 400 }
      )
    }

    // 名前の検証
    for (const name of names) {
      if (!name.lastName || !name.firstName) {
        return NextResponse.json(
          { error: 'すべての名前で姓と名の両方を指定してください' },
          { status: 400 }
        )
      }
    }

    const results: any[] = []

    if (analysisType === 'personality' || analysisType === 'both') {
      // 深層心理分析のバッチ処理
      const nameAnalyses = names.map(name => 
        analyzeNameServer(name.lastName, name.firstName)
      )
      
      const personalityAnalyzer = new PersonalityAnalyzer()
      const personalityResults = await personalityAnalyzer.analyzePersonalityBatch(
        nameAnalyses
      )
      
      results.push(...personalityResults.map(result => ({
        type: 'personality',
        name: `${result.nameData.lastName} ${result.nameData.firstName}`,
        result: result
      })))
    }

    if (analysisType === 'compatibility' || analysisType === 'both') {
      // 相性分析のバッチ処理
      if (names.length >= 2) {
        const compatibilityAnalyzer = new CompatibilityAnalyzer()
        
        // すべての組み合わせで相性分析を実行
        for (let i = 0; i < names.length - 1; i++) {
          for (let j = i + 1; j < names.length; j++) {
            const name1 = names[i]
            const name2 = names[j]
            
            const analysis1 = analyzeNameServer(name1.lastName, name1.firstName)
            const analysis2 = analyzeNameServer(name2.lastName, name2.firstName)
            
            const compatibilityResult = await compatibilityAnalyzer.analyzeCompatibility(
              analysis1,
              analysis2,
              relationshipType as any
            )
            
            results.push({
              type: 'compatibility',
              names: [
                `${name1.lastName} ${name1.firstName}`,
                `${name2.lastName} ${name2.firstName}`
              ],
              relationshipType: relationshipType,
              result: compatibilityResult
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysisType: analysisType,
      totalResults: results.length,
      results: results
    })
    
  } catch (error) {
    console.error('Batch analysis error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI分析サービスが設定されていません' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'バッチ分析の実行に失敗しました' },
      { status: 500 }
    )
  }
}

// GET メソッドでバッチ分析の統計情報を提供
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      info: {
        supportedAnalysisTypes: ['personality', 'compatibility', 'both'],
        maxNamesPerRequest: 10,
        supportedRelationshipTypes: ['romance', 'business', 'friendship', 'family'],
        features: [
          '深層心理分析',
          '相性分析',
          '複数関係性分析',
          'バッチ処理',
          'スコア詳細分析'
        ]
      }
    })
  } catch (error) {
    console.error('Batch analysis info error:', error)
    return NextResponse.json(
      { error: '情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}
