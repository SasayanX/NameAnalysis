/**
 * Google Cloud Text-to-Speech API
 * AI深層鑑定結果の読み上げ用
 */
import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Google Cloud Text-to-Speech クライアントを取得
 */
function getTextToSpeechClient(): TextToSpeechClient | null {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
    const keyPath = 
      process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH ||
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH || 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
    const keyJson = 
      process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON ||
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON || 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON

    // APIキーがある場合は、HTTPリクエストを使用（後で実装）
    if (apiKey) {
      return null // APIキー方式は別関数で処理
    }

    if (!keyPath && !keyJson) {
      if (isDevelopment) {
        console.warn('[Text-to-Speech] Service account key or API key not configured')
      }
      return null
    }

    const clientConfig: any = {}
    
    if (keyPath) {
      clientConfig.keyFilename = keyPath
    } else if (keyJson) {
      clientConfig.credentials = JSON.parse(keyJson)
    }

    const client = new TextToSpeechClient(clientConfig)
    return client
  } catch (error: any) {
    console.error('[Text-to-Speech] Failed to initialize client:', error.message)
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

      // 503エラーや一時的なエラーの場合はリトライ
      if (response.status === 503 || response.status === 429 || response.status === 500) {
        if (retryCount < maxRetries) {
          // 指数バックオフ: 1秒, 2秒, 4秒
          const delayMs = Math.pow(2, retryCount) * 1000
          console.warn(
            `[Text-to-Speech] Retrying after ${response.status} error (attempt ${retryCount + 1}/${maxRetries}) in ${delayMs}ms`
          )
          await new Promise(resolve => setTimeout(resolve, delayMs))
          return synthesizeSpeechWithApiKey(text, languageCode, voiceName, speakingRate, pitch, retryCount + 1, maxRetries)
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}. Max retries (${maxRetries}) exceeded. ${errorData.error?.message || ''}`
          )
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
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

    // テキストの長さチェック（5000文字制限）
    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'テキストが長すぎます（最大5000文字）' },
        { status: 400 }
      )
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

    // APIキー方式を優先して試行
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
    console.log('[Text-to-Speech] Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
      nodeEnv: process.env.NODE_ENV,
    })

    if (apiKey) {
      try {
        const result = await synthesizeSpeechWithApiKey(
          cleanText,
          languageCode,
          voiceName,
          speakingRate,
          pitch
        )
        if (result) {
          audioContent = result.audioContent
        }
      } catch (error: any) {
        console.error('[Text-to-Speech] API Key method failed:', error.message)
        // 本番環境でもエラー詳細を返す（デバッグ用）
        if (!isDevelopment && error.message) {
          console.error('[Text-to-Speech] Full error:', error)
        }
      }
    }

    // サービスアカウント方式を試行
    if (!audioContent) {
      const client = getTextToSpeechClient()
      if (!client) {
        const debugInfo = isDevelopment ? {
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          message: 'GOOGLE_CLOUD_TTS_API_KEY またはサービスアカウントキーを設定してください',
        } : {
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          message: '環境変数が正しく設定されていない可能性があります。Netlify Dashboardで環境変数を確認してください。',
        }

        console.error('[Text-to-Speech] Service not configured:', debugInfo)
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Text-to-Speechサービスが設定されていません',
            details: debugInfo
          },
          { status: 503 }
        )
      }

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
          
          throw error
        }
      }

      if (!response || !response.audioContent) {
        return NextResponse.json(
          { 
            success: false, 
            error: '音声データの生成に失敗しました',
            details: lastError ? { message: lastError.message, code: (lastError as any).code } : undefined
          },
          { status: 500 }
        )
      }

      audioContent = response.audioContent as Uint8Array
    }

    // Base64エンコードされた音声データを返す
    const audioBase64 = Buffer.from(audioContent).toString('base64')

    return NextResponse.json({
      success: true,
      audioContent: audioBase64,
      audioEncoding: 'MP3',
    })
  } catch (error: any) {
    console.error('[Text-to-Speech] Error:', error)
    
    const errorMessage = error.message || '音声生成に失敗しました'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: isDevelopment ? {
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

