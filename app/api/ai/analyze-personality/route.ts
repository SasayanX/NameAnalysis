import { NextRequest, NextResponse } from 'next/server'
import { PersonalityAnalyzer } from '@/lib/ai/personality-analyzer'
import { analyzeNameServer } from '@/lib/name-analysis-server'

export async function POST(request: NextRequest) {
  try {
    const { lastName, firstName, userContext } = await request.json()
    
    // 入力値の検証
    if (!lastName || !firstName) {
      return NextResponse.json(
        { error: '姓と名の両方を入力してください' },
        { status: 400 }
      )
    }

    // サーバーサイド対応の姓名判断ロジックを使用
    const nameAnalysis = analyzeNameServer(lastName, firstName)
    
    // AI分析を実行
    const personalityAnalyzer = new PersonalityAnalyzer()
    const aiAnalysis = await personalityAnalyzer.analyzePersonality(
      nameAnalysis,
      userContext
    )
    
    // 分析結果の検証
    if (!personalityAnalyzer.validateAnalysis(aiAnalysis)) {
      return NextResponse.json(
        { error: 'AI分析の結果が無効です' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      traditionalAnalysis: nameAnalysis,
      aiAnalysis: aiAnalysis,
      analysisQuality: personalityAnalyzer.evaluateAnalysisQuality(aiAnalysis)
    })
    
  } catch (error) {
    console.error('AI personality analysis error:', error)
    
    // エラーの種類に応じて適切なレスポンスを返す
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
      { error: 'AI分析の実行に失敗しました' },
      { status: 500 }
    )
  }
}

// GET メソッドでサンプル分析を提供
export async function GET() {
  try {
    // サンプルデータで分析を実行
    const sampleAnalysis = analyzeNameServer('田中', '太郎')
    
    return NextResponse.json({
      success: true,
      sample: {
        name: '田中太郎',
        traditionalAnalysis: sampleAnalysis,
        message: 'AI分析のサンプルデータです'
      }
    })
  } catch (error) {
    console.error('Sample analysis error:', error)
    return NextResponse.json(
      { error: 'サンプル分析の生成に失敗しました' },
      { status: 500 }
    )
  }
}
