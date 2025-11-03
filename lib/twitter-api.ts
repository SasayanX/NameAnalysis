/**
 * X（Twitter）API統合
 */

interface TwitterClient {
  postTweet(content: string): Promise<{ id: string }>
}

/**
 * Twitter API v2を使用してツイートを投稿
 * @param content ツイート内容
 * @param imageBuffer 画像バッファ（オプション）
 */
export async function postToTwitter(content: string, imageBuffer?: Buffer): Promise<string> {
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
    if (imageBuffer) {
      console.log("📷 画像付き（シミュレーション）")
    }
    return `dev_${Date.now()}`
  }

  // 画像付きツイートの場合はOAuth 1.0a必須
  if (imageBuffer && (!apiKey || !apiSecret || !accessToken || !accessTokenSecret)) {
    console.warn("⚠️ 画像付きツイートにはOAuth 1.0a認証が必要です。画像なしで投稿します。")
    return await postToTwitter(content) // 画像なしで再試行
  }

  if (!bearerToken && (!apiKey || !apiSecret || !accessToken || !accessTokenSecret)) {
    throw new Error("Twitter API credentials are not configured. Set TWITTER_BEARER_TOKEN or OAuth credentials.")
  }

  try {
    if (imageBuffer) {
      // 画像付きツイート（OAuth 1.0a必須）
      return await postToTwitterWithImage(content, imageBuffer)
    } else if (bearerToken) {
      // Bearer Token方式（テキストのみ）
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
      throw new Error("OAuth 1.0a implementation required for image posts. Please configure OAuth credentials.")
    }
  } catch (error: any) {
    console.error("Twitter投稿エラー:", error)
    throw new Error(`Twitter投稿に失敗しました: ${error.message}`)
  }
}

/**
 * 画像付きツイートを投稿（OAuth 1.0a使用）
 */
async function postToTwitterWithImage(content: string, imageBuffer: Buffer): Promise<string> {
  const apiKey = process.env.TWITTER_API_KEY!
  const apiSecret = process.env.TWITTER_API_SECRET!
  const accessToken = process.env.TWITTER_ACCESS_TOKEN!
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET!

  try {
    // OAuth 1.0a署名ライブラリを使用
    const OAuth = await import('oauth-1.0a')
    const crypto = await import('crypto')
    
    const oauth = OAuth.default({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString: string, key: string) => 
        crypto.createHmac('sha1', key).update(baseString).digest('base64')
    })
    
    // ステップ1: メディアをアップロード（Twitter API v1.1）
    const mediaEndpoint = 'https://upload.twitter.com/1.1/media/upload.json'
    const mediaData = imageBuffer.toString('base64')
    
    const mediaRequest = {
      url: mediaEndpoint,
      method: 'POST',
    }
    
    const mediaToken = {
      key: accessToken,
      secret: accessTokenSecret,
    }
    
    const mediaAuthHeader = oauth.toHeader(oauth.authorize(mediaRequest, mediaToken))
    
    // FormData形式でアップロード（Node.js形式）
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('media_data', mediaData)
    
    const mediaResponse = await fetch(mediaEndpoint, {
      method: 'POST',
      headers: {
        ...mediaAuthHeader,
        ...formData.getHeaders(),
      },
      body: formData as any,
    })
    
    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.text()
      throw new Error(`メディアアップロードエラー: ${errorData}`)
    }
    
    const mediaResult = await mediaResponse.json()
    const mediaId = mediaResult.media_id_string
    
    console.log(`✅ メディアアップロード成功: Media ID ${mediaId}`)
    
    // ステップ2: 画像付きツイートを投稿（Twitter API v1.1 - v2ではメディア付き投稿が複雑）
    // v1.1のstatuses/updateエンドポイントを使用
    const tweetEndpoint = 'https://api.twitter.com/1.1/statuses/update.json'
    
    const tweetParams = new URLSearchParams({
      status: content,
      media_ids: mediaId,
    })
    
    const tweetRequest = {
      url: `${tweetEndpoint}?${tweetParams.toString()}`,
      method: 'POST',
    }
    
    const tweetAuthHeader = oauth.toHeader(oauth.authorize(tweetRequest, mediaToken))
    
    const tweetResponse = await fetch(tweetRequest.url, {
      method: 'POST',
      headers: {
        ...tweetAuthHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.json()
      throw new Error(`ツイート投稿エラー: ${JSON.stringify(errorData)}`)
    }
    
    const tweetResult = await tweetResponse.json()
    console.log(`✅ 画像付きツイート投稿成功: Tweet ID ${tweetResult.id_str}`)
    
    return tweetResult.id_str
  } catch (error: any) {
    console.error("画像付きツイートエラー:", error)
    
    // エラー時はテキストのみで投稿を試みる
    console.warn("⚠️ 画像付き投稿に失敗。テキストのみで再試行します。")
    return await postToTwitter(content)
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

