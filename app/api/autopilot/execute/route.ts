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
    
    // 上位検索されている有名人の名前データを取得（X投稿用、投稿履歴チェック付き）
    const getCelebrityNameData = async () => {
      try {
        // 既に投稿済みの姓名を取得
        const { getSupabaseClient } = await import('@/lib/supabase-client')
        const supabase = getSupabaseClient()
        
        let postedNames = new Set<string>()
        try {
          // 過去の投稿履歴を取得（全件取得してチェック）
          const { data: postedHistory, error: historyError } = await supabase
            .from('twitter_posts')
            .select('last_name, first_name')
          
          if (!historyError && postedHistory) {
            // 姓名の組み合わせをSetに追加（重複チェック用）
            postedNames = new Set(
              postedHistory
                .filter((p: any) => p.last_name && p.first_name)
                .map((p: any) => `${p.last_name}${p.first_name}`)
            )
            console.log(`📋 投稿済み姓名数: ${postedNames.size}件`)
          } else {
            console.warn('⚠️ 投稿履歴取得エラー（初回実行の可能性）:', historyError?.message)
          }
        } catch (error) {
          console.warn('⚠️ 投稿履歴チェックスキップ:', error)
        }
        
        // celebrity-names.jsonから有名人データを読み込み
        const celebrityNames = await import('@/data/celebrity-names.json')
        
        const maleCelebrities = celebrityNames.default?.male || []
        const femaleCelebrities = celebrityNames.default?.female || []
        
        // 投稿済みの人物を除外
        const filterPosted = (list: any[]) => {
          return list.filter(celebrity => {
            const fullName = `${celebrity.lastName}${celebrity.firstName}`
            return !postedNames.has(fullName)
          })
        }
        
        const availableMales = filterPosted(maleCelebrities)
        const availableFemales = filterPosted(femaleCelebrities)
        
        console.log(`📊 有名人リスト: 男性${maleCelebrities.length}件 → 未投稿${availableMales.length}件、女性${femaleCelebrities.length}件 → 未投稿${availableFemales.length}件`)
        
        // 未投稿の人物が少ない場合は警告
        if (availableMales.length < 3 || availableFemales.length < 2) {
          console.warn(`⚠️ 未投稿の有名人が少ないです（男性${availableMales.length}件、女性${availableFemales.length}件）`)
        }
        
        // 検索ランク順にソート（上位検索されている人物を優先）
        const sortedMales = [...availableMales].sort((a, b) => (a.searchRank || 999) - (b.searchRank || 999))
        const sortedFemales = [...availableFemales].sort((a, b) => (a.searchRank || 999) - (b.searchRank || 999))
        
        // 上位検索されている人物を優先的に選択（トレンド中はさらに優先）
        const selectCelebrityWithPriority = (list: any[], count: number) => {
          const selected: any[] = []
          const trending = list.filter(c => c.trending === true)
          const others = list.filter(c => c.trending !== true)
          
          // トレンド中の人物を優先的に選択
          const trendingCount = Math.min(count, trending.length)
          for (let i = 0; i < trendingCount; i++) {
            selected.push(trending[i])
          }
          
          // 残りを上位検索ランクから選択
          const remaining = count - selected.length
          for (let i = 0; i < remaining && i < others.length; i++) {
            selected.push(others[i])
          }
          
          return selected
        }
        
        const selectedNames: Array<{ lastName: string, firstName: string, gender: 'male' | 'female', category?: string, searchRank?: number }> = []
        
        // 男性有名人3組（上位検索者優先、未投稿のみ）
        const selectedMales = selectCelebrityWithPriority(sortedMales, 3)
        for (const celebrity of selectedMales) {
          selectedNames.push({
            lastName: celebrity.lastName,
            firstName: celebrity.firstName,
            gender: 'male',
            category: celebrity.category,
            searchRank: celebrity.searchRank
          })
        }
        
        // 女性有名人2組（上位検索者優先、未投稿のみ）
        const selectedFemales = selectCelebrityWithPriority(sortedFemales, 2)
        for (const celebrity of selectedFemales) {
          selectedNames.push({
            lastName: celebrity.lastName,
            firstName: celebrity.firstName,
            gender: 'female',
            category: celebrity.category,
            searchRank: celebrity.searchRank
          })
        }
        
        console.log(`⭐ 上位検索有名人から姓名を選択（投稿履歴チェック済み）: ${selectedNames.length}件`)
        console.log(`⭐ 選択された有名人:`, selectedNames.map(n => `${n.lastName}${n.firstName}（${n.category}、検索ランク${n.searchRank}）`))
        
        return selectedNames
      } catch (error) {
        console.warn('⚠️ 有名人データ読み込みエラー、フォールバックデータを使用:', error)
        // フォールバック：上位検索の有名人（投稿履歴チェックなし）
        return [
          { lastName: '大谷', firstName: '翔平', gender: 'male' as const, category: 'athlete', searchRank: 1 },
          { lastName: '広瀬', firstName: 'すず', gender: 'female' as const, category: 'actress', searchRank: 1 },
          { lastName: '横浜', firstName: '流星', gender: 'male' as const, category: 'actor', searchRank: 4 },
          { lastName: '橋本', firstName: '環奈', gender: 'female' as const, category: 'actress', searchRank: 2 },
          { lastName: '村上', firstName: '宗隆', gender: 'male' as const, category: 'athlete', searchRank: 2 }
        ]
      }
    }
    
    const sampleNames = await getCelebrityNameData()
    
    // 共有可能な結果を抽出
    console.log('🔍 共有可能な結果を抽出中...')
    console.log('📋 サンプル姓名:', sampleNames.map(n => `${n.lastName}${n.firstName}`))
    console.log('⚙️ 共有条件:', relaxedConfig.conditions)
    
    const shareableResults = await shareManager.extractShareableResults(sampleNames)
    console.log(`📊 抽出結果: ${shareableResults.length}件`)
    
    // 各姓名の詳細結果をログ出力
    for (const nameData of sampleNames) {
      try {
        const result = analyzeNameFortune(
          nameData.lastName,
          nameData.firstName,
          nameData.gender || 'male'
        )
        console.log(`📝 ${nameData.lastName}${nameData.firstName}: スコア${result.totalScore}, 運勢${result.totalFortune?.運勢 || '不明'}`)
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
          const result = analyzeNameFortune(
            nameData.lastName,
            nameData.firstName,
            nameData.gender || 'male'
          )
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
        const result = analyzeNameFortune(
          fallback.lastName,
          fallback.firstName,
          fallback.gender || 'male'
        )
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

    // 各処理の成功/失敗状態を追跡
    let emailSent = false
    let emailError: string | null = null
    let tweetId: string | undefined = undefined
    let twitterError: string | null = null
    let twitterSent = false
    let articleId: string | null = null
    let articleError: string | null = null
    
    if (finalShareResult) {
      // X（Twitter）への投稿（重要：失敗しても処理は継続）
      try {
        const { postToTwitter } = await import('@/lib/twitter-api')
        const tweetText = generateTweetText(
          finalShareResult.name,
          finalShareResult.result,
          finalShareResult.shareContent
        )
        
        console.log(`🐦 Xへの投稿開始: ${finalShareResult.name}さん`)
        console.log(`📝 ツイート内容:`, tweetText)
        
        // 縦書き名前画像を生成（オプション）
        let imageBuffer: Buffer | undefined = undefined
        try {
          const { generateNameResultImage } = await import('@/lib/name-result-image-generator')
          
          // 有名人データから姓名を取得（正しい分割）
          const selectedCelebrity = sampleNames.find(n => `${n.lastName}${n.firstName}` === finalShareResult.name)
          const lastName = selectedCelebrity?.lastName || finalShareResult.name.substring(0, 2) || ''
          const firstName = selectedCelebrity?.firstName || finalShareResult.name.substring(2) || ''
          
          console.log(`🖼️ 画像生成開始: ${lastName}${firstName}さん`)
          imageBuffer = await generateNameResultImage(lastName, firstName, finalShareResult.result)
          console.log(`✅ 画像生成完了: ${imageBuffer.length} bytes`)
        } catch (imageError: any) {
          console.warn('⚠️ 画像生成に失敗しましたが、テキストのみで投稿します:', imageError.message)
          // 画像生成失敗時はテキストのみで投稿
        }
        
        // 画像付きまたはテキストのみで投稿
        tweetId = await postToTwitter(tweetText, imageBuffer)
        
        // 開発環境のシミュレーションかどうかチェック
        if (tweetId && tweetId.startsWith('dev_')) {
          // 環境変数の状態を確認
          const apiKey = process.env.TWITTER_API_KEY
          const apiSecret = process.env.TWITTER_API_SECRET
          const accessToken = process.env.TWITTER_ACCESS_TOKEN
          const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET
          
          console.warn('⚠️ 開発環境モード: 実際のX投稿は行われていません')
          console.warn('📋 環境変数の状態:')
          console.warn('  - TWITTER_API_KEY:', apiKey ? '✅ 設定済み' : '❌ 未設定')
          console.warn('  - TWITTER_API_SECRET:', apiSecret ? '✅ 設定済み' : '❌ 未設定')
          console.warn('  - TWITTER_ACCESS_TOKEN:', accessToken ? '✅ 設定済み' : '❌ 未設定')
          console.warn('  - TWITTER_ACCESS_TOKEN_SECRET:', accessTokenSecret ? '✅ 設定済み' : '❌ 未設定')
          
          const missing = []
          if (!apiKey) missing.push('TWITTER_API_KEY')
          if (!apiSecret) missing.push('TWITTER_API_SECRET')
          if (!accessToken) missing.push('TWITTER_ACCESS_TOKEN')
          if (!accessTokenSecret) missing.push('TWITTER_ACCESS_TOKEN_SECRET')
          
          twitterSent = false
          twitterError = missing.length > 0 
            ? `開発環境モード：Twitter API認証情報が不足しています。不足している環境変数: ${missing.join(', ')}。.env.localファイルを確認し、開発サーバーを再起動してください。`
            : '開発環境モード：認証情報は設定されていますが、開発環境のためシミュレーションモードになっています。'
        } else {
          twitterSent = true
          console.log(`✅ X投稿成功: Tweet ID ${tweetId}`)
          
          // 投稿履歴をSupabaseに保存
          try {
            const { getSupabaseClient } = await import('@/lib/supabase-client')
            const supabase = getSupabaseClient()
            await supabase.from('twitter_posts').insert({
              last_name: finalShareResult.name.substring(0, 1),
              first_name: finalShareResult.name.substring(1),
              tweet_id: tweetId,
              tweet_content: tweetText,
              posted_at: new Date().toISOString()
            }).catch(err => console.error('投稿履歴保存エラー:', err))
          } catch (dbError: any) {
            console.warn('⚠️ 投稿履歴保存は失敗しましたが、X投稿自体は成功:', dbError.message)
          }
        }
      } catch (twitterErr: any) {
        twitterSent = false
        twitterError = twitterErr.message || '不明なエラー'
        console.error('❌ X投稿エラー:', twitterError)
        console.error('❌ エラー詳細:', twitterErr)
        // X投稿に失敗しても処理は継続
      }
      
      // ブログ記事を自動生成して保存（重要：失敗しても処理は継続）
      try {
        const { generateBlogArticleFromAnalysis, saveBlogArticle } = await import('@/lib/blog-article-generator')
        
        // 有名人データから姓名を正しく取得（正しい分割）
        const selectedCelebrity = sampleNames.find(n => `${n.lastName}${n.firstName}` === finalShareResult.name)
        const lastName = selectedCelebrity?.lastName || finalShareResult.name.substring(0, 1)
        const firstName = selectedCelebrity?.firstName || finalShareResult.name.substring(1)
        
        console.log(`📝 ブログ記事生成開始: ${lastName}${firstName}さん（姓: ${lastName}, 名: ${firstName}）`)
        const article = await generateBlogArticleFromAnalysis(
          lastName,
          firstName,
          finalShareResult.result,
          tweetId
        )
        
        articleId = await saveBlogArticle(article)
        console.log(`✅ ブログ記事保存完了: ${article.slug} (ID: ${articleId})`)
      } catch (articleErr: any) {
        articleError = articleErr.message || '不明なエラー'
        console.error('❌ ブログ記事生成エラー:', articleError)
        console.error('❌ エラー詳細:', articleErr)
        // ブログ記事生成に失敗しても処理は続行
      }
      
      // メール通知送信（任意：失敗してもオートパイロットは成功として扱う）
      try {
        await sendShareNotification(
          finalShareResult.name,
          finalShareResult.result,
          finalShareResult.shareContent
        )
        emailSent = true
        console.log(`📧 メール通知送信完了: ${finalShareResult.name}さん${forcedShare ? '（フォールバック）' : ''}`)
      } catch (emailErr: any) {
        // メール送信に失敗してもオートパイロット処理は成功として扱う
        emailError = emailErr.message
        console.warn(`⚠️ メール通知送信失敗（処理は継続）: ${emailErr.message}`)
        console.warn('⚠️ ResendのDNS設定が未完了の場合、メール送信は失敗しますが、オートパイロット自体は正常に動作します')
      }
    }
    
    // 3. 結果を返す（メール送信失敗でもsuccess: trueを返す）
    const response = {
      success: true, // メール送信に失敗しても、オートパイロット自体は成功
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
        forcedShare,
        // X投稿状態を明示的に記録
        twitter: {
          sent: twitterSent,
          tweetId: tweetId || null,
          error: twitterError
        },
        // ブログ記事生成状態を明示的に記録
        blog: {
          generated: articleId !== null,
          articleId: articleId || null,
          error: articleError
        },
        // メール送信状態を明示的に記録（任意機能）
        email: {
          sent: emailSent,
          error: emailError
        }
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
