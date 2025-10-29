/**
 * X（Twitter）API統合
 */

interface TwitterClient {
  postTweet(content: string): Promise<{ id: string }>
}

/**
 * Twitter API v2を使用してツイートを投稿
 */
export async function postToTwitter(content: string): Promise<string> {
  // ツイート文字数制限チェック（280文字）
  if (content.length > 280) {
    content = content.substring(0, 277) + "..."
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  // 開発環境ではログのみ出力
  if (process.env.NODE_ENV === "development" && !bearerToken && !apiKey) {
    console.log("🐦 [開発環境] Twitter投稿シミュレーション:")
    console.log(content)
    return `dev_${Date.now()}`
  }

  if (!bearerToken && (!apiKey || !apiSecret || !accessToken || !accessTokenSecret)) {
    throw new Error("Twitter API credentials are not configured. Set TWITTER_BEARER_TOKEN or OAuth credentials.")
  }

  try {
    // OAuth 1.0aを使用する場合は別途実装が必要
    // ここではBearer Tokenを使用したシンプルな実装
    
    if (bearerToken) {
      // Bearer Token方式（アプリのみの認証）
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      return data.data.id
    } else {
      // OAuth 1.0a方式（ユーザー認証）の実装が必要
      // 実際の実装では 'oauth-1.0a' などのライブラリを使用
      throw new Error("OAuth 1.0a implementation required. Please configure TWITTER_BEARER_TOKEN for app-only auth.")
    }
  } catch (error: any) {
    console.error("Twitter投稿エラー:", error)
    throw new Error(`Twitter投稿に失敗しました: ${error.message}`)
  }
}

/**
 * OAuth 1.0a署名付きリクエスト（完全な実装にはoauthライブラリが必要）
 * ここでは簡易版を提供
 */
export async function postToTwitterOAuth(content: string): Promise<string> {
  // TODO: OAuth 1.0a署名を実装
  // 実際の実装では、'oauth-1.0a'や'twitter-api-v2'などのライブラリを使用
  throw new Error("OAuth implementation required")
}

