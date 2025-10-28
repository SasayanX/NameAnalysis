// オートパイロット実行API
import { NextRequest, NextResponse } from 'next/server'
import { StrokeDataExpansionManager } from '@/lib/stroke-data-expansion'
import { AutoShareManager, DEFAULT_AUTO_SHARE_CONFIG } from '@/lib/auto-share-manager'
import { analyzeNameFortune } from '@/lib/name-data-simple-fixed'
import { generateNameAnalysisShareContent } from '@/components/share-buttons'
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
    
    // 2. 自動SNS共有実行（条件をさらに緩和）
    const relaxedConfig = {
      ...DEFAULT_AUTO_SHARE_CONFIG,
      conditions: {
        ...DEFAULT_AUTO_SHARE_CONFIG.conditions,
        minScore: 30,        // 50 → 30に緩和
        minFortune: '大凶'    // 凶 → 大凶に緩和（すべての結果を取得）
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
    
    let finalShareResult: { name: string, result: any, shareContent: any } | null = null
    let forcedShare = false

    if (shareableResults.length > 0) {
      // 優先: 条件を満たした結果
      finalShareResult = {
        name: shareableResults[0].name,
        result: shareableResults[0].result,
        shareContent: shareableResults[0].shareContent
      }
    } else {
      // フォールバック: 条件未達でも最高スコアの姓名を1件選出
      console.log('📱 共有可能な結果がありません → フォールバックを実行')

      const evaluated = [] as Array<{ name: string, result: any }>
      for (const nameData of sampleNames) {
        try {
          const result = await analyzeNameFortune({
            lastName: nameData.lastName,
            firstName: nameData.firstName,
            gender: nameData.gender || 'male'
          })
          evaluated.push({ name: `${nameData.lastName}${nameData.firstName}`, result })
        } catch (e) {
          console.error('フォールバック評価エラー:', e)
        }
      }

      if (evaluated.length > 0) {
        evaluated.sort((a, b) => (b.result?.totalScore ?? 0) - (a.result?.totalScore ?? 0))
        const top = evaluated[0]
        finalShareResult = {
          name: top.name,
          result: top.result,
          shareContent: generateNameAnalysisShareContent(top.result)
        }
        forcedShare = true
        console.log(`📌 フォールバック選出: ${top.name}（スコア:${top.result?.totalScore}）`)
      }
    }

    if (finalShareResult) {
      await sendShareNotification(
        finalShareResult.name,
        finalShareResult.result,
        finalShareResult.shareContent
      )
      console.log(`📧 メール通知送信完了: ${finalShareResult.name}さん${forcedShare ? '（フォールバック）' : ''}`)
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
        sharedName: finalShareResult ? finalShareResult.name : null,
        forcedShare
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
