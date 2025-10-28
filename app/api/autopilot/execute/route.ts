// オートパイロット実行API
import { NextRequest, NextResponse } from 'next/server'
import { StrokeDataExpansionManager } from '@/lib/stroke-data-expansion'
import { AutoShareManager, DEFAULT_AUTO_SHARE_CONFIG } from '@/lib/auto-share-manager'
import { sendShareNotification } from '@/lib/email-notification'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 オートパイロット実行開始')
    console.log('📅 実行時間:', new Date().toISOString())
    console.log('🔍 リクエスト受信:', request.method, request.url)
    
    // 1. 画数データ拡充実行
    console.log('📊 画数データ拡充開始...')
    const expansionManager = new StrokeDataExpansionManager()
    const expansionResult = await expansionManager.expandStrokeData()
    
    console.log(`✅ 画数データ拡充完了: ${expansionResult.addedKanji.length}個の漢字を追加`)
    
    // 2. 自動SNS共有実行（条件を緩和）
    const relaxedConfig = {
      ...DEFAULT_AUTO_SHARE_CONFIG,
      conditions: {
        ...DEFAULT_AUTO_SHARE_CONFIG.conditions,
        minScore: 50,        // 70 → 50に緩和
        minFortune: '凶'      // 吉 → 凶に緩和（より多くの結果を取得）
      }
    }
    const shareManager = new AutoShareManager(relaxedConfig)
    
    // サンプル姓名データ（実際の実装では外部APIから取得）
    const sampleNames = [
      { lastName: '横浜', firstName: '流星', gender: 'male' },
      { lastName: '新垣', firstName: '結衣', gender: 'female' },
      { lastName: '石原', firstName: 'さとみ', gender: 'female' },
      { lastName: '菅田', firstName: '将暉', gender: 'male' },
      { lastName: '有村', firstName: '架純', gender: 'female' }
    ]
    
    // 共有可能な結果を抽出
    console.log('🔍 共有可能な結果を抽出中...')
    console.log('📋 サンプル姓名:', sampleNames.map(n => `${n.lastName}${n.firstName}`))
    console.log('⚙️ 共有条件:', relaxedConfig.conditions)
    
    const shareableResults = await shareManager.extractShareableResults(sampleNames)
    console.log(`📊 抽出結果: ${shareableResults.length}件`)
    
    // 各姓名の詳細結果をログ出力
    for (const nameData of sampleNames) {
      try {
        const result = await analyzeNameFortune({
          lastName: nameData.lastName,
          firstName: nameData.firstName,
          gender: nameData.gender || 'male'
        })
        console.log(`📝 ${nameData.lastName}${nameData.firstName}: スコア${result.totalScore}, 運勢${result.fortune}`)
      } catch (error) {
        console.error(`❌ ${nameData.lastName}${nameData.firstName}の分析エラー:`, error)
      }
    }
    
    if (shareableResults.length > 0) {
      // メール通知送信
      const shareResult = shareableResults[0]
      await sendShareNotification(
        shareResult.name,
        shareResult.result,
        shareResult.shareContent
      )
      
      console.log(`📧 メール通知送信完了: ${shareResult.name}さん`)
    } else {
      console.log('📱 共有可能な結果がありません')
    }
    
    // 3. 結果を返す
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      expansion: {
        processedNames: expansionResult.processedNames,
        missingKanji: expansionResult.missingKanji.length,
        addedKanji: expansionResult.addedKanji.length,
        errors: expansionResult.errors.length
      },
      sharing: {
        shareableResults: shareableResults.length,
        sharedName: shareableResults.length > 0 ? shareableResults[0].name : null
      }
    }
    
    console.log('🎉 オートパイロット実行完了')
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ オートパイロット実行エラー:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GETリクエストでも実行可能（テスト用）
export async function GET(request: NextRequest) {
  return POST(request)
}
