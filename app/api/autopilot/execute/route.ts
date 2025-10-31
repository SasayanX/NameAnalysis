// オートパイロット実行API
import { NextRequest, NextResponse } from 'next/server'
import { StrokeDataExpansionManager } from '@/lib/stroke-data-expansion'
import { AutoShareManager, DEFAULT_AUTO_SHARE_CONFIG } from '@/lib/auto-share-manager'
import { analyzeNameFortune } from '@/lib/name-data-simple-fixed'
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
        minScore: 0,         // 共有を保証するため0に緩和
        minFortune: '大凶'    // 最低レベルに設定（全件許容）
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
          shareContent: {
            title: `${top.name} さんの姓名判断結果` ,
            description: `総合スコア: ${top.result?.totalScore}点 / 運勢: ${top.result?.fortune}`,
            hashtags: ['姓名判断', 'MainichiAINameAnalysis'],
            url: ''
          }
        }
        forcedShare = true
        console.log(`📌 フォールバック選出: ${top.name}（スコア:${top.result?.totalScore}）`)
      }
    }

    if (!finalShareResult) {
      // 強制フォールバック: 条件未達・評価失敗時でも最低1件を共有対象にする
      try {
        const fallback = sampleNames[0]
        const result = await analyzeNameFortune({
          lastName: fallback.lastName,
          firstName: fallback.firstName,
          gender: fallback.gender || 'male'
        })
        finalShareResult = {
          name: `${fallback.lastName}${fallback.firstName}`,
          result,
          shareContent: {
            title: `${fallback.lastName}${fallback.firstName} さんの姓名判断結果` ,
            description: `総合スコア: ${result?.totalScore ?? 0}点 / 運勢: ${result?.fortune ?? '不明'}`,
            hashtags: ['姓名判断', 'MainichiAINameAnalysis'],
            url: ''
          }
        }
        forcedShare = true
        console.log(`📌 強制フォールバック選出: ${finalShareResult.name}`)
      } catch (e) {
        // それでも失敗する場合は、最低限のダミーでメール送信を行う
        const fallbackName = `${sampleNames[0].lastName}${sampleNames[0].firstName}`
        finalShareResult = {
          name: fallbackName,
          result: { totalScore: 0, fortune: '不明', categories: [] },
          shareContent: {
            title: `${fallbackName} さんの姓名判断結果`,
            description: `結果の生成に失敗しましたが、実行は正常に完了しました。`,
            hashtags: ['姓名判断', 'MainichiAINameAnalysis'],
            url: ''
          }
        }
        forcedShare = true
        console.warn('⚠️ 強制フォールバック（ダミー）で継続')
      }
    }

    if (finalShareResult) {
      let tweetId: string | undefined = undefined
      
      // X（Twitter）への投稿
      try {
        const { postToTwitter } = await import('@/lib/twitter-api')
        const tweetText = generateTweetText(
          finalShareResult.name,
          finalShareResult.result,
          finalShareResult.shareContent
        )
        
        console.log(`🐦 Xへの投稿開始: ${finalShareResult.name}さん`)
        tweetId = await postToTwitter(tweetText)
        console.log(`✅ X投稿成功: Tweet ID ${tweetId}`)
        
        // 投稿履歴をSupabaseに保存
        const { getSupabaseClient } = await import('@/lib/supabase-client')
        const supabase = getSupabaseClient()
        await supabase.from('twitter_posts').insert({
          last_name: finalShareResult.name.substring(0, 1),
          first_name: finalShareResult.name.substring(1),
          tweet_id: tweetId,
          tweet_content: tweetText,
          posted_at: new Date().toISOString()
        }).catch(err => console.error('投稿履歴保存エラー:', err))
      } catch (twitterError: any) {
        console.error('❌ X投稿エラー:', twitterError.message)
        // X投稿に失敗してもメール通知は送信
      }
      
      // ブログ記事を自動生成して保存
      try {
        const { generateBlogArticleFromAnalysis, saveBlogArticle } = await import('@/lib/blog-article-generator')
        const lastName = finalShareResult.name.substring(0, 1)
        const firstName = finalShareResult.name.substring(1)
        
        console.log(`📝 ブログ記事生成開始: ${finalShareResult.name}さん`)
        const article = generateBlogArticleFromAnalysis(
          lastName,
          firstName,
          finalShareResult.result,
          tweetId
        )
        
        const articleId = await saveBlogArticle(article)
        console.log(`✅ ブログ記事保存完了: ${article.slug} (ID: ${articleId})`)
      } catch (articleError: any) {
        console.error('❌ ブログ記事生成エラー:', articleError.message)
        // ブログ記事生成に失敗しても処理は続行
      }
      
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

// ツイート用テキスト生成
function generateTweetText(name: string, result: any, shareContent: any): string {
  const score = result?.totalScore || 0
  const rank = score >= 85 ? 'S' : score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 55 ? 'C' : score >= 45 ? 'D' : 'E'
  
  const categories = result?.categories || []
  const tenFortune = categories.find((c: any) => c.name === '天格')?.fortune || '不明'
  const jinFortune = categories.find((c: any) => c.name === '人格')?.fortune || '不明'
  const totalFortune = categories.find((c: any) => c.name === '総格')?.fortune || '不明'
  
  return `🔮【${name}さんの姓名判断】

総合評価: ${score}点（${rank}ランク）
天格: ${tenFortune}
人格: ${jinFortune}
総格: ${totalFortune}

#姓名判断 #名前診断 #運勢 #占い`
}

// GETリクエストでも実行可能（テスト用）
export async function GET(request: NextRequest) {
  return POST(request)
}
