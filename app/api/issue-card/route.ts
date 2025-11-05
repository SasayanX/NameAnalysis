/**
 * ランクカード発行API
 * KP消費 + 画像生成
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateRareCardImage, RankType } from '@/lib/rare-card-generator'
import { spendPointsSupa, getOrCreatePointsSummary } from '@/lib/kanau-points-supabase'
import { KP_COST_ISSUE } from '@/constants/kp'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🎴 ランクカード発行API: リクエスト受信')
    const body = await request.json()
    console.log('📦 リクエストボディ:', body)
    const { lastName, firstName, rank, totalPoints, powerLevel, userId, baseImagePath } = body

    // バリデーション
    if (!lastName || !firstName || !rank || !userId) {
      console.error('❌ バリデーションエラー: 必須パラメータが不足')
      return NextResponse.json(
        { success: false, error: 'lastName, firstName, rank, userIdパラメータが必要です' },
        { status: 400 }
      )
    }

    // ランクの妥当性チェック
    const validRanks: RankType[] = ['SSS', 'SS', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D']
    if (!validRanks.includes(rank as RankType)) {
      return NextResponse.json(
        { success: false, error: `無効なランク: ${rank}` },
        { status: 400 }
      )
    }

    // 1. Supabaseクライアントの確認
    const supabaseServer = getSupabaseServerClient()
    if (!supabaseServer) {
      console.error('❌ Supabaseサービスロールキーが設定されていません')
      return NextResponse.json(
        { 
          success: false, 
          error: 'サーバー設定エラー: SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local に追加してください。' 
        },
        { status: 500 }
      )
    }

    // 2. KP残高を確認
    console.log('💰 KP残高確認中...')
    let summary
    try {
      summary = await getOrCreatePointsSummary(userId)
      console.log('💰 現在のKP残高:', summary.points)
    } catch (error: any) {
      console.error('❌ KP残高取得エラー:', error)
      const errorMessage = error.message || 'KP残高の取得に失敗しました'
      if (errorMessage.includes('Invalid API key') || errorMessage.includes('API key')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Supabase設定エラー: APIキーが無効です。SUPABASE_SERVICE_ROLE_KEY を確認してください。' 
          },
          { status: 500 }
        )
      }
      throw error
    }

    if (summary.points < KP_COST_ISSUE) {
      console.error('❌ KP不足:', summary.points, '<', KP_COST_ISSUE)
      return NextResponse.json(
        { success: false, error: 'カナウポイントが不足しています' },
        { status: 400 }
      )
    }

    // 3. KP消費（トランザクション記録）
    console.log('💸 KP消費中:', KP_COST_ISSUE)
    try {
      await spendPointsSupa(userId, KP_COST_ISSUE, 'ランクカード発行', 'purchase')
      console.log('✅ KP消費完了')
    } catch (error: any) {
      console.error('❌ KP消費エラー:', error)
      const errorMessage = error.message || 'KP消費に失敗しました'
      if (errorMessage.includes('Invalid API key') || errorMessage.includes('API key')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Supabase設定エラー: APIキーが無効です。SUPABASE_SERVICE_ROLE_KEY を確認してください。' 
          },
          { status: 500 }
        )
      }
      throw error
    }

    // 4. レアカード画像を生成
    console.log('🎨 レアカード画像生成中...')
    const imageBuffer = await generateRareCardImage(
      lastName,
      firstName,
      rank as RankType,
      totalPoints || 0,
      powerLevel || 1,
      baseImagePath
    )
    console.log('✅ 画像生成完了:', imageBuffer.length, 'bytes')

    // 5. Supabase Storageに画像をアップロード（永続的なURLを取得）
    const timestamp = Date.now()
    const filename = `card_${lastName}_${firstName}_${rank}_${timestamp}.png`
    const storagePath = `${userId}/${filename}`
    let imageUrl: string

    try {
      console.log('📤 Supabase Storageにアップロード中...')
      // 画像をSupabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabaseServer.storage
        .from('rare-cards')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/png',
          upsert: false, // 既存ファイルは上書きしない
        })

      if (uploadError) {
        console.error('❌ Storageアップロードエラー:', uploadError)
        throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`)
      }

      // 公開URLを取得
      const { data: urlData } = supabaseServer.storage
        .from('rare-cards')
        .getPublicUrl(storagePath)

      imageUrl = urlData.publicUrl
      console.log('✅ Storageアップロード完了:', imageUrl)
    } catch (error: any) {
      console.error('❌ Storageアップロードエラー:', error)
      // Storageアップロードに失敗した場合、フォールバックとしてローカル保存を試みる
      // （開発環境用、本番環境では動作しない可能性がある）
      try {
        const fs = await import('fs')
        const path = await import('path')
        const outputDir = path.join(process.cwd(), 'public', 'generated', 'cards')
        
        if (fs.existsSync(outputDir) || process.env.NODE_ENV === 'development') {
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
          }
          const outputPath = path.join(outputDir, filename)
          await fs.promises.writeFile(outputPath, imageBuffer)
          imageUrl = `/generated/cards/${filename}`
          console.warn('⚠️ Storageアップロード失敗、ローカルに保存:', imageUrl)
        } else {
          throw new Error('Supabase Storageの設定が必要です。Storageバケット「rare-cards」を作成してください。')
        }
      } catch (fallbackError: any) {
        console.error('❌ フォールバック保存も失敗:', fallbackError)
        throw new Error('画像の保存に失敗しました。Supabase Storageの設定を確認してください。')
      }
    }

    // 6. 10日以上古いカードを自動削除（ストレージ容量節約）
    if (supabaseServer) {
      try {
        const tenDaysAgo = new Date()
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
        const tenDaysAgoISO = tenDaysAgo.toISOString()

        // 10日以上古い発行履歴を取得
        const { data: oldCards, error: fetchError } = await supabaseServer
          .from('issued_cards')
          .select('id, image_url')
          .eq('user_id', userId)
          .lt('created_at', tenDaysAgoISO)

        if (!fetchError && oldCards && oldCards.length > 0) {
          console.log(`🗑️ 古いカード${oldCards.length}件を削除中...`)
          
          for (const oldCard of oldCards) {
            try {
              // Storageから画像を削除
              if (oldCard.image_url) {
                // URLからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/rare-cards/userId/filename）
                const urlMatch = oldCard.image_url.match(/rare-cards\/(.+)$/)
                if (urlMatch) {
                  const storagePath = urlMatch[1]
                  const { error: deleteError } = await supabaseServer.storage
                    .from('rare-cards')
                    .remove([storagePath])
                  
                  if (deleteError) {
                    console.warn(`⚠️ Storage削除エラー: ${deleteError.message}`)
                  } else {
                    console.log(`✅ Storage削除完了: ${storagePath}`)
                  }
                }
              }

              // データベースから発行履歴を削除
              await supabaseServer
                .from('issued_cards')
                .delete()
                .eq('id', oldCard.id)
            } catch (error) {
              console.warn(`⚠️ カード削除エラー (ID: ${oldCard.id}):`, error)
            }
          }
          console.log(`✅ 古いカード${oldCards.length}件の削除完了`)
        }
      } catch (error) {
        console.warn('⚠️ 古いカードの削除処理でエラーが発生しました:', error)
      }
    }

    // 7. 発行履歴を保存（Supabaseに保存）
    if (supabaseServer) {
      try {
        await supabaseServer.from('issued_cards').insert({
          user_id: userId,
          last_name: lastName,
          first_name: firstName,
          rank: rank,
          total_points: totalPoints || 0,
          power_level: powerLevel || 1,
          image_url: imageUrl, // 永続的な公開URL
          created_at: new Date().toISOString(),
        })
        console.log('✅ 発行履歴保存完了')
      } catch (error) {
        console.warn('⚠️ 発行履歴の保存に失敗しました（画像はアップロード済み）:', error)
      }
    }
    let updatedSummary: { points: number }
    try {
      updatedSummary = await getOrCreatePointsSummary(userId)
    } catch (error: any) {
      console.error('❌ 更新後のKP残高取得エラー:', error)
      // エラーが発生しても画像は生成済みなので、発行前の残高から計算
      updatedSummary = { points: Math.max(0, summary.points - KP_COST_ISSUE) }
    }
    console.log('✅ 発行完了:', imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl,
      kpBalance: updatedSummary.points,
    })
  } catch (error: any) {
    console.error('❌ ランクカード発行エラー:', error)
    console.error('エラー詳細:', error.stack)
    
    // エラーメッセージを詳細化
    let errorMessage = error.message || 'ランクカード発行に失敗しました'
    
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('API key')) {
      errorMessage = 'Supabase設定エラー: APIキーが無効です。SUPABASE_SERVICE_ROLE_KEY を確認してください。'
    } else if (errorMessage.includes('Supabase環境変数')) {
      errorMessage = 'Supabase環境変数が設定されていません。.env.local に SUPABASE_SERVICE_ROLE_KEY を追加してください。'
    } else if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
      errorMessage = 'データベースアクセスエラー: RLSポリシーの問題です。SUPABASE_SERVICE_ROLE_KEY が正しく設定されているか確認してください。'
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

