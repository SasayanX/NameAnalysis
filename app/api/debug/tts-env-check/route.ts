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
  
  // functions/config ディレクトリをチェック
  let functionsConfigStatus = {
    directoryExists: false,
    jsonFilesFound: [] as string[],
    autoDetectedKey: null as string | null,
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
      
      if (jsonFiles.length > 0) {
        const foundKeyPath = path.join(functionsConfigPath, jsonFiles[0])
        functionsConfigStatus.autoDetectedKey = foundKeyPath
      }
    }
  } catch (error: any) {
    // エラーは無視（ファイルシステムアクセスができない場合がある）
  }
  
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
    functionsConfig: functionsConfigStatus,
    allRelatedEnvKeys: relatedEnvKeys,
    totalEnvKeys: allEnvKeys.length,
  }

  const isConfigured = envCheck.googleCloudTTS.apiKeyExists || 
    envCheck.serviceAccount.ttsKeyPathExists || 
    envCheck.serviceAccount.ttsKeyJsonExists ||
    envCheck.serviceAccount.playKeyPathExists ||
    envCheck.serviceAccount.playKeyJsonExists ||
    envCheck.serviceAccount.firebaseKeyPathExists ||
    envCheck.serviceAccount.firebaseKeyJsonExists ||
    (envCheck.functionsConfig.directoryExists && envCheck.functionsConfig.jsonFilesFound.length > 0)

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
        : envCheck.functionsConfig.autoDetectedKey
          ? [`✅ functions/config からサービスアカウントキーを自動検出: ${envCheck.functionsConfig.jsonFilesFound.join(', ')}`]
          : ['APIキーが設定されていますが、サービスアカウントキーの設定も確認してください']
      : [
          '1. functions/config ディレクトリにサービスアカウントキー（.json）を配置',
          '   例: functions/config/mainichi-ai-seimei-0e56f72d0796.json',
          '2. または Netlify Dashboard > Site settings > Environment variables で GOOGLE_CLOUD_TTS_API_KEY を設定',
          '3. 環境変数名が正確か確認（大文字小文字を含む完全一致）',
          '4. 環境変数のスコープに Production が含まれているか確認',
          '5. 環境変数を追加/変更した後、必ず再デプロイを実行',
          '   ・Deploys > Trigger deploy > Deploy site',
          '   ・または空のコミットをプッシュ: git commit --allow-empty -m "Trigger deploy"',
          '6. 再デプロイ後、このエンドポイントに再度アクセスして確認',
        ],
  })
}

