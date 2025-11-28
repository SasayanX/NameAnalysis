/**
 * Google Cloud TTS環境変数の確認用デバッグAPI
 * 本番環境でも動作（セキュリティのため値は返さない）
 */
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
  
  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    googleCloudTTS: {
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
    },
    serviceAccount: {
      ttsKeyPathExists: !!process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH,
      ttsKeyJsonExists: !!process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON,
      playKeyPathExists: !!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH,
      playKeyJsonExists: !!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON,
      firebaseKeyPathExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
      firebaseKeyJsonExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON,
    },
  }

  return NextResponse.json({
    success: true,
    environment: envCheck,
    message: envCheck.googleCloudTTS.apiKeyExists
      ? '✅ GOOGLE_CLOUD_TTS_API_KEY が設定されています'
      : '❌ GOOGLE_CLOUD_TTS_API_KEY が設定されていません',
    recommendations: envCheck.googleCloudTTS.apiKeyExists
      ? []
      : [
          'Netlify Dashboard > Site settings > Environment variables で GOOGLE_CLOUD_TTS_API_KEY を確認してください',
          '環境変数を追加した後、再デプロイが必要です（Deploys > Trigger deploy > Deploy site）',
          '環境変数のスコープが Production になっているか確認してください',
        ],
  })
}

