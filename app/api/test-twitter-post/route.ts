// Twitter APIへの実際の投稿テスト用エンドポイント
import { NextRequest, NextResponse } from 'next/server'
import { postToTwitter } from '@/lib/twitter-api'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    const testText = text || 'テスト投稿: まいにちAI姓名判断 🧙‍♂️'
    
    console.log('🧪 テスト投稿開始:', testText)
    
    const tweetId = await postToTwitter(testText)
    
    console.log('✅ テスト投稿成功:', tweetId)
    
    return NextResponse.json({
      success: true,
      tweetId,
      message: 'テスト投稿が成功しました',
    })
  } catch (error: any) {
    console.error('❌ テスト投稿エラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || '不明なエラー',
      errorDetails: {
        message: error.message,
        stack: error.stack,
      },
    }, { status: 500 })
  }
}

export async function GET() {
  // GETリクエストで簡単なテスト投稿を実行
  try {
    const testText = 'テスト投稿: まいにちAI姓名判断 🧙‍♂️'
    
    console.log('🧪 テスト投稿開始（GET）:', testText)
    
    const tweetId = await postToTwitter(testText)
    
    console.log('✅ テスト投稿成功:', tweetId)
    
    return NextResponse.json({
      success: true,
      tweetId,
      message: 'テスト投稿が成功しました',
    })
  } catch (error: any) {
    console.error('❌ テスト投稿エラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || '不明なエラー',
      errorDetails: {
        message: error.message,
        stack: error.stack,
      },
    }, { status: 500 })
  }
}
