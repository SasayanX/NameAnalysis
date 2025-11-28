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
 * APIキーを使用してGoogle Cloud Text-to-Speech APIを呼び出す
 */
async function synthesizeSpeechWithApiKey(
  text: string,
  languageCode: string,
  voiceName: string,
  speakingRate: number,
  pitch: number
): Promise<{ audioContent: Uint8Array } | null> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
    
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
    })

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
  } catch (error: any) {
    console.error('[Text-to-Speech API Key] Error:', error.message)
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
        console.warn('[Text-to-Speech] API Key method failed, falling back to service account:', error.message)
      }
    }

    // サービスアカウント方式を試行
    if (!audioContent) {
      const client = getTextToSpeechClient()
      if (!client) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Text-to-Speechサービスが設定されていません',
            details: isDevelopment ? 'GOOGLE_CLOUD_TTS_API_KEY またはサービスアカウントキーを設定してください' : undefined
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

      // API呼び出し
      const [response] = await client.synthesizeSpeech(requestConfig)
      
      if (!response.audioContent) {
        return NextResponse.json(
          { success: false, error: '音声データの生成に失敗しました' },
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

