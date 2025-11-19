/**
 * Gemini APIで使用可能なモデルをリストアップするAPI
 * サーバー側で.env.localからAPIキーを読み込む
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

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEYが設定されていません' },
      { status: 500 }
    )
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `API呼び出しエラー: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // generateContentをサポートするモデルをフィルタ
    const supportedModels = data.models
      ?.filter((model: any) => {
        const methods = model.supportedGenerationMethods || []
        return methods.includes('generateContent')
      })
      ?.map((model: any) => ({
        name: model.name ? model.name.replace('models/', '') : 'N/A',
        displayName: model.displayName,
        description: model.description,
        methods: model.supportedGenerationMethods,
      })) || []
    
    return NextResponse.json({
      success: true,
      apiKeyConfigured: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      totalModels: data.models?.length || 0,
      supportedModels: supportedModels,
      allModels: data.models?.map((m: any) => ({
        name: m.name?.replace('models/', '') || 'N/A',
        displayName: m.displayName,
        methods: m.supportedGenerationMethods,
      })) || [],
      recommended: supportedModels.find((m: any) => 
        m.name.includes('flash') || m.name.includes('pro')
      )?.name || '使用可能なモデルが見つかりません',
      // 完全なレスポンスも含める
      fullResponse: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

