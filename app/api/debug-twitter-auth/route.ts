// Twitter API認証情報とリクエストの詳細を返すデバッグエンドポイント
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  const nodeEnv = process.env.NODE_ENV

  // OAuth署名のテスト生成（実際にはリクエストしない）
  let oauthHeaderInfo = null
  if (apiKey && apiSecret && accessToken && accessTokenSecret) {
    try {
      const OAuth = await import('oauth-1.0a')
      const crypto = await import('crypto')
      
      const oauth = OAuth.default({
        consumer: { key: apiKey, secret: apiSecret },
        signature_method: 'HMAC-SHA1',
        hash_function: (baseString: string, key: string) => 
          crypto.createHmac('sha1', key).update(baseString).digest('base64')
      })
      
      const requestData = {
        url: 'https://api.twitter.com/2/tweets',
        method: 'POST',
      }
      
      const token = {
        key: accessToken,
        secret: accessTokenSecret,
      }
      
      const authHeader = oauth.toHeader(oauth.authorize(requestData, token))
      
      oauthHeaderInfo = {
        headerKeys: Object.keys(authHeader),
        authorizationPresent: !!authHeader.Authorization,
        authorizationLength: authHeader.Authorization?.length || 0,
      }
    } catch (error: any) {
      oauthHeaderInfo = {
        error: error.message,
      }
    }
  }

  return NextResponse.json({
    environment: {
      nodeEnv: nodeEnv || 'undefined',
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
    },
    credentials: {
      apiKey: {
        configured: !!apiKey,
        length: apiKey?.length || 0,
        prefix: apiKey ? `${apiKey.substring(0, 10)}...` : null,
      },
      apiSecret: {
        configured: !!apiSecret,
        length: apiSecret?.length || 0,
        prefix: apiSecret ? `${apiSecret.substring(0, 10)}...` : null,
      },
      accessToken: {
        configured: !!accessToken,
        length: accessToken?.length || 0,
        prefix: accessToken ? `${accessToken.substring(0, 20)}...` : null,
      },
      accessTokenSecret: {
        configured: !!accessTokenSecret,
        length: accessTokenSecret?.length || 0,
        prefix: accessTokenSecret ? `${accessTokenSecret.substring(0, 20)}...` : null,
      },
      bearerToken: {
        configured: !!bearerToken,
        length: bearerToken?.length || 0,
      },
    },
    oauth: {
      allConfigured: !!(apiKey && apiSecret && accessToken && accessTokenSecret),
      canPost: !!(apiKey && apiSecret && accessToken && accessTokenSecret),
      headerInfo: oauthHeaderInfo,
    },
    summary: {
      canPostText: !!(apiKey && apiSecret && accessToken && accessTokenSecret),
      canPostImage: !!(apiKey && apiSecret && accessToken && accessTokenSecret),
      recommended: apiKey && apiSecret && accessToken && accessTokenSecret 
        ? 'OAuth 1.0a認証情報が揃っています。X投稿が可能です。' 
        : 'OAuth 1.0a認証情報が不足しています。.env.localファイルを確認してください。',
    },
  })
}
