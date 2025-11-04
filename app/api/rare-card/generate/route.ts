/**
 * レアカード画像生成API
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateRareCardImage, RankType } from '@/lib/rare-card-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lastName = searchParams.get('lastName')
    const firstName = searchParams.get('firstName')
    const rank = searchParams.get('rank') as RankType
    const totalPoints = parseInt(searchParams.get('totalPoints') || '0', 10)
    const powerLevel = parseInt(searchParams.get('powerLevel') || '1', 10)
    const baseImagePath = searchParams.get('baseImagePath') || undefined

    if (!lastName || !firstName || !rank) {
      return NextResponse.json(
        { success: false, error: 'lastName, firstName, rankパラメータが必要です' },
        { status: 400 }
      )
    }

    // ランクの妥当性チェック
    const validRanks: RankType[] = ['SSS', 'SS', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D']
    if (!validRanks.includes(rank)) {
      return NextResponse.json(
        { success: false, error: `無効なランク: ${rank}` },
        { status: 400 }
      )
    }

    // レアカード画像を生成
    const imageBuffer = await generateRareCardImage(
      lastName,
      firstName,
      rank,
      totalPoints,
      powerLevel,
      baseImagePath
    )

    // PNG画像として返す
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('❌ レアカード画像生成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'レアカード画像生成に失敗しました',
      },
      { status: 500 }
    )
  }
}

