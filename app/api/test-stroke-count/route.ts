// 画数取得のテストAPI
import { NextResponse } from 'next/server'
import { getStrokeCount } from '@/lib/name-data-simple-fixed'
import { getCharStrokeWithContext } from '@/lib/name-data-simple'

export async function GET() {
  try {
    const testChars = ['大', '谷', '翔', '平']
    const results = []
    
    for (const char of testChars) {
      // 直接getCharStrokeWithContextを呼び出し
      const directResult = getCharStrokeWithContext(char, char, 0)
      
      // getStrokeCountを通して呼び出し
      const strokeCountResult = getStrokeCount(char)
      
      results.push({
        char,
        direct: directResult,
        strokeCount: strokeCountResult,
        match: directResult.stroke === strokeCountResult,
      })
    }
    
    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error('❌ 画数テストエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

