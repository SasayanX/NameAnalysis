/**
 * 環境変数の確認用デバッグAPI
 * 開発環境でのみ動作
 */
import { NextResponse } from 'next/server'

export async function GET() {
  // 開発環境でのみ動作
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ利用可能です' },
      { status: 403 }
    )
  }

  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    googleGenerativeAI: {
      keyExists: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      keyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
      keyPrefix: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) || 'N/A',
    },
    firebase: {
      keyPathExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
      keyJsonExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON,
    },
  }

  return NextResponse.json({
    success: true,
    environment: envCheck,
    message: envCheck.googleGenerativeAI.keyExists
      ? '✅ GOOGLE_GENERATIVE_AI_API_KEY が設定されています'
      : '❌ GOOGLE_GENERATIVE_AI_API_KEY が設定されていません',
  })
}

