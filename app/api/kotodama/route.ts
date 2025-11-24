/**
 * Firestoreからkotodama（言霊）マスターデータを取得・作成するAPI
 */
import { NextRequest, NextResponse } from 'next/server'
import { getKotodamaData, createKotodamaData } from '@/lib/firestore-client'

/**
 * GET: kotodamaデータを取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const element = searchParams.get('element') || undefined

    const kotodamaList = await getKotodamaData(element)

    return NextResponse.json({
      success: true,
      data: kotodamaList,
      count: kotodamaList.length,
    })
  } catch (error: any) {
    console.error('❌ kotodamaデータ取得APIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'kotodamaデータの取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

/**
 * POST: 新しいkotodamaデータを作成
 * 開発サーバーでも利用可能
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phrase_jp, advice_text, element, priority } = body

    // 必須フィールドの検証
    if (!phrase_jp || !advice_text || !element) {
      return NextResponse.json(
        {
          success: false,
          error: '必須フィールドが不足しています: phrase_jp, advice_text, element は必須です',
        },
        { status: 400 }
      )
    }

    // 五行要素の検証
    const validElements = ['水', '木', '火', '土', '金']
    if (!validElements.includes(element)) {
      return NextResponse.json(
        {
          success: false,
          error: `無効な五行要素です: ${element}。有効な値: ${validElements.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // データを作成
    const docId = await createKotodamaData({
      phrase_jp,
      advice_text,
      element,
      priority: priority !== undefined ? Number(priority) : undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'kotodamaデータを作成しました',
      id: docId,
    })
  } catch (error: any) {
    console.error('❌ kotodamaデータ作成APIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'kotodamaデータの作成に失敗しました',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

