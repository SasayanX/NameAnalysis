import { NextRequest, NextResponse } from 'next/server'
import { CompatibilityAnalyzer } from '@/lib/ai/compatibility-analyzer'
import { analyzeNameServer } from '@/lib/name-analysis-server'

export async function POST(request: NextRequest) {
  try {
    const { 
      name1, 
      name2, 
      relationshipType = 'romance' 
    } = await request.json()
    
    // 入力値の検証
    if (!name1?.lastName || !name1?.firstName || 
        !name2?.lastName || !name2?.firstName) {
      return NextResponse.json(
        { error: '両方の人物の姓名を入力してください' },
        { status: 400 }
      )
    }

    // 関係性タイプの検証
    const validRelationshipTypes = ['romance', 'business', 'friendship', 'family']
    if (!validRelationshipTypes.includes(relationshipType)) {
      return NextResponse.json(
        { error: '無効な関係性タイプです' },
        { status: 400 }
      )
    }

    // サーバーサイド対応の姓名判断ロジックを使用
    const analysis1 = analyzeNameServer(name1.lastName, name1.firstName)
    const analysis2 = analyzeNameServer(name2.lastName, name2.firstName)
    
    // AI相性分析を実行
    const compatibilityAnalyzer = new CompatibilityAnalyzer()
    const compatibility = await compatibilityAnalyzer.analyzeCompatibility(
      analysis1,
      analysis2,
      relationshipType as any
    )
    
    // 分析結果の検証
    if (!compatibilityAnalyzer.validateAnalysis(compatibility)) {
      return NextResponse.json(
        { error: '相性分析の結果が無効です' },
        { status: 500 }
      )
    }

    // スコア詳細分析を追加
    const scoreBreakdown = compatibilityAnalyzer.analyzeScoreBreakdown(compatibility)

    return NextResponse.json({
      success: true,
      name1Analysis: analysis1,
      name2Analysis: analysis2,
      compatibility: compatibility,
      scoreBreakdown: scoreBreakdown
    })
    
  } catch (error) {
    console.error('AI compatibility analysis error:', error)
    
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
      { error: '相性分析の実行に失敗しました' },
      { status: 500 }
    )
  }
}

// GET メソッドで複数関係性分析を提供
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lastName1 = searchParams.get('lastName1')
    const firstName1 = searchParams.get('firstName1')
    const lastName2 = searchParams.get('lastName2')
    const firstName2 = searchParams.get('firstName2')
    
    if (!lastName1 || !firstName1 || !lastName2 || !firstName2) {
      return NextResponse.json(
        { error: '両方の人物の姓名をクエリパラメータで指定してください' },
        { status: 400 }
      )
    }

    // 姓名判断データを取得
    const analysis1 = analyzeNameServer(lastName1, firstName1)
    const analysis2 = analyzeNameServer(lastName2, firstName2)
    
    // 複数関係性分析を実行
    const compatibilityAnalyzer = new CompatibilityAnalyzer()
    const multiAnalysis = await compatibilityAnalyzer.analyzeMultipleRelationships(
      analysis1,
      analysis2
    )

    return NextResponse.json({
      success: true,
      multiRelationshipAnalysis: multiAnalysis
    })
    
  } catch (error) {
    console.error('Multi-relationship analysis error:', error)
    return NextResponse.json(
      { error: '複数関係性分析の実行に失敗しました' },
      { status: 500 }
    )
  }
}
