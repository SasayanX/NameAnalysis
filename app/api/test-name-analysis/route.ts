// 姓名判断の結果を直接テストするAPI
import { NextResponse } from 'next/server'
import { analyzeNameFortune } from '@/lib/name-data-simple-fixed'

export async function GET() {
  try {
    const testName = {
      lastName: '大谷',
      firstName: '翔平',
    }
    
    console.log(`🧪 姓名判断テスト開始: ${testName.lastName}${testName.firstName}さん`)
    
    // 姓名判断を実行（analyzeNameFortuneは同期関数）
    const result = analyzeNameFortune(
      testName.lastName,
      testName.firstName,
      'male'
    )
    
    // 結果を詳細に返す
    return NextResponse.json({
      success: true,
      input: {
        lastName: testName.lastName,
        firstName: testName.firstName,
      },
      result: {
        // 直下プロパティ
        tenFormat: result.tenFormat,
        jinFormat: result.jinFormat,
        chiFormat: result.chiFormat,
        gaiFormat: result.gaiFormat,
        totalFormat: result.totalFormat,
        totalScore: result.totalScore,
        
        // categories配列
        categories: result.categories?.map((c: any) => ({
          name: c.name,
          strokeCount: c.strokeCount,
          fortune: c.fortune,
          score: c.score,
        })),
        
        // 運勢データ
        tenFortune: result.tenFortune?.運勢,
        jinFortune: result.jinFortune?.運勢,
        chiFortune: result.chiFortune?.運勢,
        gaiFortune: result.gaiFortune?.運勢,
        totalFortune: result.totalFortune?.運勢,
      },
    })
  } catch (error: any) {
    console.error('❌ 姓名判断テストエラー:', error)
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

