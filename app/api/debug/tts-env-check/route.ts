/**
 * Google Cloud TTS環境変数の確認用デバッグAPI
 * 本番環境でも動作（セキュリティのため値は返さない）
 */
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
  
  // 関連する環境変数キーを検索
  const allEnvKeys = Object.keys(process.env)
  const relatedEnvKeys = allEnvKeys.filter(key => 
    key.includes('TTS') || 
    key.includes('GOOGLE_CLOUD') || 
    key.includes('GOOGLE_PLAY') || 
    key.includes('FIREBASE')
  )
  
  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    googleCloudTTS: {
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
      expectedLength: '約50文字前後',
    },
    serviceAccount: {
      ttsKeyPathExists: !!process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH,
      ttsKeyJsonExists: !!process.env.GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON,
      playKeyPathExists: !!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH,
      playKeyJsonExists: !!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON,
      firebaseKeyPathExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
      firebaseKeyJsonExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON,
    },
    allRelatedEnvKeys: relatedEnvKeys,
    totalEnvKeys: allEnvKeys.length,
  }

  const isConfigured = envCheck.googleCloudTTS.apiKeyExists || 
    envCheck.serviceAccount.ttsKeyPathExists || 
    envCheck.serviceAccount.ttsKeyJsonExists ||
    envCheck.serviceAccount.playKeyPathExists ||
    envCheck.serviceAccount.playKeyJsonExists ||
    envCheck.serviceAccount.firebaseKeyPathExists ||
    envCheck.serviceAccount.firebaseKeyJsonExists

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    environment: envCheck,
    message: isConfigured
      ? '✅ Text-to-Speechサービスが設定されています'
      : '❌ Text-to-Speechサービスが設定されていません',
    recommendations: isConfigured
      ? envCheck.googleCloudTTS.apiKeyExists
        ? []
        : ['APIキーが設定されていますが、サービスアカウントキーの設定も確認してください']
      : [
          '1. Netlify Dashboard > Site settings > Environment variables で GOOGLE_CLOUD_TTS_API_KEY を確認',
          '2. 環境変数名が正確か確認（大文字小文字を含む完全一致）',
          '3. 環境変数のスコープに Production が含まれているか確認',
          '4. 環境変数を追加/変更した後、必ず再デプロイを実行',
          '   ・Deploys > Trigger deploy > Deploy site',
          '   ・または空のコミットをプッシュ: git commit --allow-empty -m "Trigger deploy"',
          '5. 再デプロイ後、このエンドポイントに再度アクセスして確認',
        ],
  })
}

