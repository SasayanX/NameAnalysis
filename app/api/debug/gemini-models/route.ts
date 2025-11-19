/**
 * 使用可能なGeminiモデルをリストアップするデバッグAPI
 * 開発環境でのみ動作
 */
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  // 開発環境でのみ動作
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ利用可能です' },
      { status: 403 }
    )
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEYが設定されていません' },
      { status: 500 }
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const modelNames = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ]
  
  const results: any[] = []

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      // 簡単なテストリクエストを送信
      const result = await model.generateContent('test')
      await result.response
      results.push({
        model: modelName,
        status: '✅ 使用可能',
        error: null,
      })
    } catch (error: any) {
      results.push({
        model: modelName,
        status: '❌ エラー',
        error: error.message || '不明なエラー',
      })
    }
  }

  const availableModel = results.find(r => r.status === '✅ 使用可能')
  
  return NextResponse.json({
    success: true,
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'N/A',
    models: results,
    recommended: availableModel?.model || '使用可能なモデルが見つかりません',
    allFailed: !availableModel,
    errorSummary: availableModel ? null : 'すべてのモデルでエラーが発生しています。APIキーが正しく設定されているか、有効かどうかを確認してください。',
  })
}

