/**
 * Google Cloud Text-to-Speech API
 * AI深層鑑定結果の読み上げ用
 */
import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Google Cloud Text-to-Speech クライアントを取得
 * 注意: APIキーが設定されていても、サービスアカウント方式をフォールバックとして利用可能にするため、
 * この関数は常にサービスアカウントキーを探します
 */
function getTextToSpeechClient(): TextToSpeechClient | null {
  try {
    const keyPath = 
      process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH ||
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH || 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
    const keyJson = 
      process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON ||
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON || 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON

    // 環境変数で指定されていない場合、functions/config ディレクトリから自動検索
    let resolvedKeyPath = keyPath
    let resolvedKeyJson = keyJson

    if (!keyPath && !keyJson) {
      try {
        const fs = require('fs')
        const path = require('path')
        const functionsConfigPath = path.resolve(process.cwd(), 'functions/config')
        
        if (fs.existsSync(functionsConfigPath)) {
          const files = fs.readdirSync(functionsConfigPath)
          const jsonFiles = files.filter((file: string) => file.endsWith('.json'))
          
          if (jsonFiles.length > 0) {
            // 最初に見つかったJSONファイルを使用
            const foundKeyPath = path.join(functionsConfigPath, jsonFiles[0])
            // ファイルが存在するか確認
            if (fs.existsSync(foundKeyPath)) {
              resolvedKeyPath = foundKeyPath
              console.log(`[Text-to-Speech] Found service account key in functions/config: ${jsonFiles[0]}`)
            } else {
              console.warn(`[Text-to-Speech] Service account key file not found: ${foundKeyPath}`)
            }
          } else {
            console.warn('[Text-to-Speech] No JSON files found in functions/config directory')
          }
        } else {
          // 本番環境では、functions/configが存在しない可能性がある
          if (!isDevelopment) {
            console.warn('[Text-to-Speech] functions/config directory not found. Use environment variables for service account key in production.')
          }
        }
      } catch (fsError: any) {
        console.warn('[Text-to-Speech] Could not search functions/config:', fsError.message)
      }
    }

    if (!resolvedKeyPath && !resolvedKeyJson) {
      if (isDevelopment) {
        console.warn('[Text-to-Speech] Service account key not found (will try API key method if available)')
      }
      return null
    }

    const clientConfig: any = {}
    
    if (resolvedKeyPath) {
      // 絶対パスまたはプロジェクトルートからの相対パスで解決
      const path = require('path')
      const fs = require('fs')
      const resolvedPath = path.isAbsolute(resolvedKeyPath) 
        ? resolvedKeyPath 
        : path.resolve(process.cwd(), resolvedKeyPath)
      
      // ファイルの存在を確認
      if (!fs.existsSync(resolvedPath)) {
        console.warn(`[Text-to-Speech] Service account key file not found: ${resolvedPath}`)
        return null
      }
      
      clientConfig.keyFilename = resolvedPath
      console.log(`[Text-to-Speech] Using service account key from: ${resolvedPath}`)
    } else if (resolvedKeyJson) {
      try {
        clientConfig.credentials = JSON.parse(resolvedKeyJson)
        console.log('[Text-to-Speech] Using service account key from JSON environment variable')
      } catch (parseError: any) {
        console.error('[Text-to-Speech] Failed to parse service account key JSON:', parseError.message)
        return null
      }
    }

    const client = new TextToSpeechClient(clientConfig)
    return client
  } catch (error: any) {
    console.error('[Text-to-Speech] Failed to initialize client:', error.message)
    if (isDevelopment) {
      console.error('[Text-to-Speech] Error details:', error.stack)
    }
    return null
  }
}

/**
 * APIキーを使用してGoogle Cloud Text-to-Speech APIを呼び出す（リトライ付き）
 */
async function synthesizeSpeechWithApiKey(
  text: string,
  languageCode: string,
  voiceName: string,
  speakingRate: number,
  pitch: number,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<{ audioContent: Uint8Array } | null> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
    
    // タイムアウト設定（30秒）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // レスポンスの詳細をログに記録
      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (parseError) {
          // JSONパースに失敗した場合、テキストとして取得
          const text = await response.text().catch(() => '')
          errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` }
        }
        
        // エラーの詳細情報を構造化
        const errorCode = errorData.error?.code || errorData.code || ''
        const errorMessage = errorData.error?.message || errorData.message || ''
        const errorDetails = errorData.error?.details || errorData.details || []
        
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          errorCode,
          errorMessage,
          errorDetails,
          fullError: errorData,
        }
        
        console.error(`[Text-to-Speech API Key] HTTP ${response.status} error:`, JSON.stringify(errorInfo, null, 2))
        
        // リトライ可能なエラーを判定
        // 500 (INTERNAL), 503 (UNAVAILABLE), 429 (RESOURCE_EXHAUSTED) はリトライ可能
        const isRetryableError = 
          response.status === 500 || // INTERNAL
          response.status === 503 || // UNAVAILABLE
          response.status === 429 || // RESOURCE_EXHAUSTED (クォータ超過)
          errorCode === 'INTERNAL' ||
          errorCode === 'UNAVAILABLE' ||
          errorCode === 'RESOURCE_EXHAUSTED' ||
          errorMessage?.includes('INTERNAL') ||
          errorMessage?.includes('UNAVAILABLE') ||
          errorMessage?.includes('quota') ||
          errorMessage?.includes('rate limit')
        
        // リトライ不可能なエラー（設定や認証の問題）
        const isNonRetryableError = 
          response.status === 400 || // 無効なリクエスト
          response.status === 401 || // 認証エラー
          response.status === 403 || // 権限エラー
          errorCode === 'INVALID_ARGUMENT' ||
          errorCode === 'PERMISSION_DENIED' ||
          errorCode === 'UNAUTHENTICATED' ||
          errorMessage?.includes('PERMISSION_DENIED') ||
          errorMessage?.includes('UNAUTHENTICATED') ||
          errorMessage?.includes('INVALID_ARGUMENT')
        
        if (isRetryableError && retryCount < maxRetries) {
          // 指数バックオフ: 0.5s, 1s, 2s, 4s
          const delayMs = Math.min(Math.pow(2, retryCount) * 500, 4000)
          console.warn(
            `[Text-to-Speech] Retrying after ${response.status}/${errorCode} error (attempt ${retryCount + 1}/${maxRetries}) in ${delayMs}ms`
          )
          await new Promise(resolve => setTimeout(resolve, delayMs))
          return synthesizeSpeechWithApiKey(text, languageCode, voiceName, speakingRate, pitch, retryCount + 1, maxRetries)
        } else if (isNonRetryableError) {
          // リトライ不可能なエラーは即座にスロー
          const error = new Error(
            `HTTP ${response.status}/${errorCode}: ${errorMessage || response.statusText}. This error is not retryable.`
          ) as any
          error.status = response.status
          error.errorCode = errorCode
          error.errorData = errorData
          throw error
        } else if (retryCount >= maxRetries) {
          // リトライ回数上限に達した
          const error = new Error(
            `HTTP ${response.status}/${errorCode}: ${errorMessage || response.statusText}. Max retries (${maxRetries}) exceeded.`
          ) as any
          error.status = response.status
          error.errorCode = errorCode
          error.errorData = errorData
          throw error
        } else {
          // その他のエラー
          const error = new Error(`HTTP ${response.status}/${errorCode}: ${errorMessage || response.statusText}`) as any
          error.status = response.status
          error.errorCode = errorCode
          error.errorData = errorData
          throw error
        }
      }

      const data = await response.json()
      
      if (!data.audioContent) {
        throw new Error('音声データが含まれていません')
      }

      // Base64デコード
      const audioBytes = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))
      
      return { audioContent: audioBytes }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // AbortError（タイムアウト）やネットワークエラーの場合はリトライ
      if (
        (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) &&
        retryCount < maxRetries
      ) {
        const delayMs = Math.pow(2, retryCount) * 1000
        console.warn(
          `[Text-to-Speech] Retrying after network/timeout error (attempt ${retryCount + 1}/${maxRetries}) in ${delayMs}ms:`,
          fetchError.message
        )
        await new Promise(resolve => setTimeout(resolve, delayMs))
        return synthesizeSpeechWithApiKey(text, languageCode, voiceName, speakingRate, pitch, retryCount + 1, maxRetries)
      }
      
      throw fetchError
    }
  } catch (error: any) {
    // 最終的なエラーログ（リトライしきった場合のみ）
    if (retryCount >= maxRetries) {
      console.error('[Text-to-Speech API Key] Final error after retries:', {
        message: error.message,
        status: error.message?.match(/HTTP (\d+)/)?.[1],
        retryCount,
      })
    } else {
      console.error('[Text-to-Speech API Key] Error:', error.message)
    }
    throw error
  }
}

/**
 * テキストを音声に変換
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, languageCode = 'ja-JP', voiceName = 'ja-JP-Neural2-B', speakingRate = 1.0, pitch = 0 } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'テキストが指定されていません' },
        { status: 400 }
      )
    }

    // テキストの長さチェック（Google Cloud TTSの制限: 5000文字）
    // 長文は内部エラーを誘発しやすいため、より短い単位に分割することを推奨
    if (text.length > 5000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'テキストが長すぎます（最大5000文字）',
          suggestion: '長いテキストは文単位で分割して複数回リクエストしてください',
        },
        { status: 400 }
      )
    }
    
    // 警告: 長文は500エラーを誘発しやすい（3000文字以上で警告）
    if (text.length > 3000) {
      console.warn(`[Text-to-Speech] Long text detected (${text.length} chars). Consider splitting into smaller chunks to avoid 500 errors.`)
    }

    // テキストをクリーンアップ
    const cleanText = text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) {
      return NextResponse.json(
        { success: false, error: '有効なテキストがありません' },
        { status: 400 }
      )
    }

    let audioContent: Uint8Array | null = null

    // Google Cloud Text-to-Speech APIはAPIキー方式をサポートしていないため、
    // サービスアカウントキー方式のみを使用
    // 注意: APIキー方式は401エラーが返されるため、使用しない
      const client = getTextToSpeechClient()
      if (!client) {
        // より詳細なデバッグ情報を収集
        const envKeys = Object.keys(process.env)
        const relatedEnvKeys = envKeys.filter(key => 
          key.includes('TTS') || 
          key.includes('GOOGLE_CLOUD') || 
          key.includes('GOOGLE_PLAY') || 
          key.includes('FIREBASE')
        )
        
        // functions/config ディレクトリの状態も確認
        let functionsConfigStatus = {
          directoryExists: false,
          jsonFilesFound: [] as string[],
        }
        
        try {
          const fs = require('fs')
          const path = require('path')
          const functionsConfigPath = path.resolve(process.cwd(), 'functions/config')
          
          if (fs.existsSync(functionsConfigPath)) {
            functionsConfigStatus.directoryExists = true
            const files = fs.readdirSync(functionsConfigPath)
            const jsonFiles = files.filter((file: string) => file.endsWith('.json'))
            functionsConfigStatus.jsonFilesFound = jsonFiles
          }
        } catch (fsError: any) {
          // エラーは無視
        }
        
        const debugInfo = {
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
          nodeEnv: process.env.NODE_ENV,
          relatedEnvKeys: relatedEnvKeys,
          functionsConfig: functionsConfigStatus,
          message: isDevelopment 
            ? 'GOOGLE_CLOUD_TTS_API_KEY またはサービスアカウントキーを設定してください'
            : '環境変数が正しく設定されていない可能性があります。Netlify Dashboardで環境変数を確認し、再デプロイしてください。',
          troubleshooting: [
            'functions/config ディレクトリにサービスアカウントキー（.json）を配置してください',
            'Netlify Dashboard > Site settings > Environment variables で GOOGLE_CLOUD_TTS_API_KEY を確認',
            '環境変数のスコープに Production が含まれているか確認',
            '環境変数を追加/変更した後、必ず再デプロイを実行（Deploys > Trigger deploy > Deploy site）',
            'デバッグエンドポイントにアクセスして状態を確認: /api/debug/tts-env-check',
          ],
        }

        console.error('[Text-to-Speech] Service not configured:', JSON.stringify(debugInfo, null, 2))
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Text-to-Speechサービスが設定されていません',
            details: debugInfo
          },
          { status: 503 }
        )
      }

      console.log('[Text-to-Speech] Using service account method')

      // リクエスト構築
      const requestConfig: any = {
        input: { text: cleanText },
        voice: {
          languageCode: languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: speakingRate,
          pitch: pitch,
        },
      }

      // API呼び出し（リトライ付き）
      let response: any = null
      let lastError: Error | null = null
      const maxRetries = 3

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // タイムアウト付きでAPI呼び出し
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout (30s)')), 30000)
          )
          
          const [result] = await Promise.race([
            client.synthesizeSpeech(requestConfig),
            timeoutPromise
          ]) as [any, any]

          response = result
          
          if (!response.audioContent) {
            throw new Error('音声データが含まれていません')
          }

          break // 成功したらループを抜ける
        } catch (error: any) {
          lastError = error
          
          // エラーの詳細をログに記録
          console.error(`[Text-to-Speech Service Account] Error (attempt ${attempt + 1}/${maxRetries}):`, {
            message: error.message,
            code: error.code,
            status: error.status,
            details: error.details,
            name: error.name,
          })
          
          // 一時的なエラー（503, 429, 500, UNAVAILABLE, DEADLINE_EXCEEDED）の場合はリトライ
          const isRetryableError = 
            error.code === 14 || // DEADLINE_EXCEEDED
            error.code === 8 || // RESOURCE_EXHAUSTED
            error.message?.includes('503') ||
            error.message?.includes('429') ||
            error.message?.includes('500') ||
            error.message?.includes('UNAVAILABLE') ||
            error.message?.includes('DEADLINE_EXCEEDED') ||
            error.message?.includes('timeout') ||
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('ETIMEDOUT')

          if (isRetryableError && attempt < maxRetries - 1) {
            const delayMs = Math.pow(2, attempt) * 1000 // 1秒, 2秒, 4秒
            console.warn(
              `[Text-to-Speech Service Account] Retrying after error (attempt ${attempt + 1}/${maxRetries}) in ${delayMs}ms:`,
              error.message || error.code
            )
            await new Promise((resolve) => setTimeout(resolve, delayMs))
            continue
          }
          
          // リトライ不可能なエラー（認証エラーなど）の場合は即座にスロー
          if (error.code === 7 || // PERMISSION_DENIED
              error.code === 16 || // UNAUTHENTICATED
              error.message?.includes('PERMISSION_DENIED') ||
              error.message?.includes('UNAUTHENTICATED') ||
              error.message?.includes('403')) {
            console.error('[Text-to-Speech Service Account] Authentication error, not retrying:', error.message)
            throw error
          }
          
          // 最終試行の場合はエラーをスロー
          if (attempt >= maxRetries - 1) {
            console.error('[Text-to-Speech Service Account] Max retries exceeded, throwing error')
            throw error
          }
        }
      }

      if (!response || !response.audioContent) {
        const errorDetails = lastError ? {
          message: lastError.message,
          code: (lastError as any).code,
          status: (lastError as any).status,
          details: (lastError as any).details,
        } : { message: '音声データが生成されませんでした' }
        
        console.error('[Text-to-Speech] Service account method failed:', errorDetails)
        
        return NextResponse.json(
          { 
            success: false, 
            error: '音声データの生成に失敗しました',
            details: errorDetails
          },
          { status: 500 }
        )
      }

      audioContent = response.audioContent as Uint8Array
      console.log('[Text-to-Speech] Successfully generated audio using service account method')
    }

    if (!audioContent) {
      console.error('[Text-to-Speech] No audio content generated after all attempts')
      return NextResponse.json(
        {
          success: false,
          error: '音声データの生成に失敗しました（すべての方法が失敗しました）',
        },
        { status: 500 }
      )
    }

    // Base64エンコードされた音声データを返す
    const audioBase64 = Buffer.from(audioContent).toString('base64')

    return NextResponse.json({
      success: true,
      audioContent: audioBase64,
      audioEncoding: 'MP3',
    })
  } catch (error: any) {
    const errorStatus = error.status || 500
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      status: errorStatus,
      errorData: error.errorData,
    }
    
    console.error('[Text-to-Speech] Unexpected error:', errorDetails)
    
    const errorMessage = error.message || '音声生成に失敗しました'
    
    // エラーの詳細情報を返す（本番環境でも基本的な情報は返す）
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: {
          message: error.message,
          name: error.name,
          code: error.code,
          status: errorStatus,
          errorData: error.errorData,
          ...(isDevelopment ? { stack: error.stack } : {}),
        },
      },
      { status: errorStatus }
    )
  }
}

