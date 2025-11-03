// Twitter API認証情報の確認用エンドポイント
import { NextResponse } from 'next/server'

export async function GET() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  const hasBearerToken = !!bearerToken
  const hasOAuth = !!(apiKey && apiSecret && accessToken && accessTokenSecret)

  return NextResponse.json({
    bearerToken: {
      configured: hasBearerToken,
      status: hasBearerToken ? '✅ 設定済み' : '❌ 未設定',
      canPostText: hasBearerToken,
    },
    oauth: {
      configured: hasOAuth,
      status: hasOAuth ? '✅ 設定済み' : '❌ 未設定',
      apiKey: !!apiKey ? '✅' : '❌',
      apiSecret: !!apiSecret ? '✅' : '❌',
      accessToken: !!accessToken ? '✅' : '❌',
      accessTokenSecret: !!accessTokenSecret ? '✅' : '❌',
      canPostImage: hasOAuth,
    },
    summary: {
      canPostText: hasBearerToken,
      canPostImage: hasOAuth && hasBearerToken,
      recommended: hasBearerToken ? 'テキストのみ投稿可能' : '環境変数を設定してください',
    },
  })
}
