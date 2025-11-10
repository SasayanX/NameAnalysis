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

  // デバッグ: 環境変数の状態をログ出力
  console.log("🔍 Twitter API認証情報チェック:")
  console.log("  - TWITTER_API_KEY:", apiKey ? "✅ 設定済み" : "❌ 未設定")
  console.log("  - TWITTER_API_SECRET:", apiSecret ? "✅ 設定済み" : "❌ 未設定")
  console.log("  - TWITTER_ACCESS_TOKEN:", accessToken ? "✅ 設定済み" : "❌ 未設定")
  console.log("  - TWITTER_ACCESS_TOKEN_SECRET:", accessTokenSecret ? "✅ 設定済み" : "❌ 未設定")
  console.log("  - NODE_ENV:", process.env.NODE_ENV || "undefined")

  // 開発環境では、認証情報がない場合のみログのみ出力
  // 認証情報が揃っている場合は、開発環境でも実際に投稿を試みる
  if (process.env.NODE_ENV === "development" && (!apiKey || !apiSecret || !accessToken || !accessTokenSecret)) {
    console.log("🐦 [開発環境] Twitter投稿シミュレーション（認証情報不足）:")
    console.log("  - apiKey:", apiKey ? "✅" : "❌")
    console.log("  - apiSecret:", apiSecret ? "✅" : "❌")
    console.log("  - accessToken:", accessToken ? "✅" : "❌")
    console.log("  - accessTokenSecret:", accessTokenSecret ? "✅" : "❌")
    console.log("ツイート内容:", content.substring(0, 50) + "...")
    if (imageBuffer) {
      console.log("📷 画像付き（シミュレーション）")
    }
    return `dev_${Date.now()}`
  }

  // 認証情報が揃っている場合は、開発環境でも実際に投稿を試みる
  if (apiKey && apiSecret && accessToken && accessTokenSecret) {
    console.log("✅ 認証情報が揃っています。実際のX投稿を試みます。")
  }

  // 画像付きツイートの場合はOAuth 1.0a必須
  if (imageBuffer) {
    // OAuth認証情報が揃っているかチェック
    if (apiKey && apiSecret && accessToken && accessTokenSecret) {
      // OAuth認証情報が揃っている場合は画像付きで投稿
      try {
        return await postToTwitterWithImage(content, imageBuffer)
      } catch (error: any) {
        console.warn("⚠️ 画像付きツイートに失敗。テキストのみで再試行します:", error.message)
        // 画像付き投稿失敗時はテキストのみで再試行（画像なしで再帰呼び出し）
        return await postToTwitter(content)
      }
    } else {
      // OAuth認証情報が不足している場合、画像なしで再試行
      console.warn("⚠️ 画像付きツイートにはOAuth 1.0a認証（TWITTER_API_KEY, TWITTER_API_SECRET）が必要です。画像なしで投稿します。")
      return await postToTwitter(content) // 画像なしで再試行
    }
  }

  // テキストのみの投稿の場合、OAuth 1.0a認証情報をチェック
  // 注意: Twitter API v2の/2/tweetsはBearer Token（OAuth 2.0 Application-Only）をサポートしていないため、
  // テキストのみのツイートでもOAuth 1.0a User Contextが必要です
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    const missing = []
    if (!apiKey) missing.push("TWITTER_API_KEY")
    if (!apiSecret) missing.push("TWITTER_API_SECRET")
    if (!accessToken) missing.push("TWITTER_ACCESS_TOKEN")
    if (!accessTokenSecret) missing.push("TWITTER_ACCESS_TOKEN_SECRET")
    throw new Error(`Twitter API認証情報が不足しています。不足している環境変数: ${missing.join(", ")}。.env.localファイルに設定し、開発サーバーを再起動してください。`)
  }

  try {
    // OAuth 1.0a方式でテキストのみのツイートを投稿（Twitter API v1.1を使用）
    return await postToTwitterWithOAuth(content)
  } catch (error: any) {
    console.error("Twitter投稿エラー:", error)
    throw new Error(`Twitter投稿に失敗しました: ${error.message}`)
  }
}

/**
 * 画像付きツイートを投稿（OAuth 1.0a使用）
 */
async function postToTwitterWithImage(content: string, imageBuffer: Buffer): Promise<string> {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  // OAuth認証情報のチェック
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("OAuth 1.0a credentials (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET) are required for image posts.")
  }

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
 * OAuth 1.0aでテキストのみのツイートを投稿（Twitter API v1.1）
 */
async function postToTwitterWithOAuth(content: string): Promise<string> {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  // OAuth認証情報のチェック
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("OAuth 1.0a credentials (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET) are required.")
  }

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
    
    // Twitter API v2のエンドポイントを使用（OAuth 1.0aでアクセス可能）
    // Freeプランでも/2/tweetsエンドポイントは利用可能
    const tweetEndpoint = 'https://api.twitter.com/2/tweets'
    
    const token = {
      key: accessToken,
      secret: accessTokenSecret,
    }
    
    // OAuth 1.0a署名を生成（v2エンドポイント用）
    // v2エンドポイントでは、リクエストボディは署名計算に含めない（URLのみ）
    const requestData = {
      url: tweetEndpoint,
      method: 'POST',
    }
    
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token))
    
    console.log("🔐 OAuth署名生成完了（v2エンドポイント）")
    console.log("📝 リクエストURL:", tweetEndpoint)
    console.log("📝 ツイート内容（最初の50文字）:", content.substring(0, 50) + "...")
    console.log("📋 OAuth認証情報:")
    console.log("  - API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "❌ 未設定")
    console.log("  - Access Token:", accessToken ? `${accessToken.substring(0, 20)}...` : "❌ 未設定")
    console.log("  - Authorization Header Keys:", Object.keys(authHeader).join(", "))
    
    // v2エンドポイントはJSON形式でリクエストを送信
    const requestBody = JSON.stringify({
      text: content,
    })
    
    console.log("📤 リクエスト送信開始...")
    const tweetResponse = await fetch(tweetEndpoint, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    })
    
    console.log("📡 レスポンスステータス:", tweetResponse.status)
    
    if (!tweetResponse.ok) {
      let errorData: any
      try {
        errorData = await tweetResponse.json()
      } catch (e) {
        const errorText = await tweetResponse.text()
        console.error("❌ Twitter APIエラー（JSON解析失敗）:", errorText)
        throw new Error(`Twitter APIエラー: ステータス ${tweetResponse.status}, レスポンス: ${errorText}`)
      }
      
      console.error("❌ Twitter APIエラー詳細:")
      console.error("  - ステータス:", tweetResponse.status)
      console.error("  - エラーデータ:", JSON.stringify(errorData, null, 2))
      
      // エラーの詳細を確認
      if (errorData.detail && errorData.detail.includes('oauth1 app permissions')) {
        console.error("⚠️ OAuth 1.0a権限エラー検出")
        console.error("💡 解決方法:")
        console.error("  1. Developer Portalで「Read and write」が選択されているか確認")
        console.error("  2. Saveボタンをクリックしたか確認")
        console.error("  3. Access TokenとSecretを再生成（必須）")
        console.error("  4. 新しいAccess TokenとSecretを.env.localに反映")
        console.error("  5. 開発サーバーを再起動")
        console.error("  6. 設定変更後、10〜15分待ってから再試行")
        throw new Error(`OAuth 1.0a権限エラー: Developer Portal → Apps → あなたのアプリ → User authentication settings → App permissions を「Read and write」に設定し、Access TokenとSecretを再生成してください。エラー: ${errorData.detail}`)
      }
      
      if (errorData.errors && errorData.errors.length > 0) {
        const error = errorData.errors[0]
        if (error.code === 32) {
          throw new Error(`認証エラー: API Key/SecretまたはAccess Token/Secretが無効です。Twitter Developer Portalで認証情報を確認してください。エラーコード: ${error.code}`)
        } else if (error.code === 89) {
          throw new Error(`認証エラー: Access Tokenが無効または期限切れです。Twitter Developer Portalで再生成してください。エラーコード: ${error.code}`)
        } else if (error.code === 453) {
          throw new Error(`アクセスレベル不足: Developer Portalでアプリのアクセス権限（Read and Write）を確認してください。また、Freeプランでは/2/tweetsエンドポイントが利用可能です。エラーコード: ${error.code}`)
        }
      }
      
      throw new Error(`ツイート投稿エラー: ${JSON.stringify(errorData)}`)
    }
    
    const tweetResult = await tweetResponse.json()
    
    // v2エンドポイントのレスポンス形式に対応
    const tweetId = tweetResult.data?.id || tweetResult.id_str || tweetResult.id
    console.log(`✅ テキストのみツイート投稿成功: Tweet ID ${tweetId}`)
    
    return tweetId
  } catch (error: any) {
    console.error("❌ OAuth 1.0aツイートエラー:", error)
    throw error
  }
}

