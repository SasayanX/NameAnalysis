/**
 * Firestoreからkotodama（言霊）マスターデータを取得するAPI
 */
import { NextRequest, NextResponse } from 'next/server'
import { getKotodamaData } from '@/lib/firestore-client'

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

