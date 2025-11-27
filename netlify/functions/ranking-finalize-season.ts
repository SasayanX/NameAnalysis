/**
 * Netlify Scheduled Function
 * ランキングシーズン確定処理
 * 
 * シーズン終了時に自動実行され、ランキングを確定して報酬を配布する
 */
import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    console.log('🏆 ランキング確定処理を開始します (Netlify Scheduled Function)')
    
    // Next.js APIルートを呼び出す
    const apiUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET || ''
    
    const response = await fetch(`${apiUrl}/api/ranking/finalize-season`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ ランキング確定処理エラー:', result)
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'ランキング確定処理に失敗しました',
          details: result,
        }),
      }
    }
    
    console.log('✅ ランキング確定処理が完了しました:', result)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ランキング確定処理が完了しました',
        result,
      }),
    }
  } catch (error: any) {
    console.error('❌ Netlify Function実行エラー:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'ランキング確定処理に失敗しました',
      }),
    }
  }
}

