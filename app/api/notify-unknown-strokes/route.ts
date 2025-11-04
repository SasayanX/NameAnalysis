import { NextRequest, NextResponse } from 'next/server'
import { getEmailManager } from '@/lib/email-notification'

/**
 * 推測マーク（画数不明の漢字）検出時にメール通知を送信するAPI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lastName, firstName, unknownKanji } = body

    if (!lastName || !firstName) {
      return NextResponse.json(
        { error: '姓と名が必要です' },
        { status: 400 }
      )
    }

    if (!unknownKanji || unknownKanji.length === 0) {
      return NextResponse.json(
        { message: '推測マークの漢字はありませんでした' },
        { status: 200 }
      )
    }

    // メール送信
    const emailManager = getEmailManager()
    const subject = `【画数データ不足通知】${lastName}${firstName} - ${unknownKanji.length}文字の画数が不明`
    
    const text = [
      `姓名判断実行時に、画数データベースに存在しない漢字が検出されました。`,
      '',
      `【姓名】`,
      `姓: ${lastName}`,
      `名: ${firstName}`,
      `フルネーム: ${lastName}${firstName}`,
      '',
      `【不明な漢字（${unknownKanji.length}文字）】`,
      ...unknownKanji.map((kanji: string, index: number) => `${index + 1}. ${kanji}`),
      '',
      `【対応方法】`,
      `1. /admin/stroke-count で画数を追加`,
      `2. または、lib/name-data-simple.ts と lib/stroke-count-server.ts に直接追加`,
      '',
      `【追加例】`,
      ...unknownKanji.map((kanji: string) => `  ${kanji}: [画数],`),
      '',
      `【確認URL】`,
      `https://mainichi-ai-name-analysis.vercel.app/admin/stroke-count`,
      '',
      `検出日時: ${new Date().toLocaleString('ja-JP')}`,
    ].join('\n')

    await emailManager.sendPlainEmail(subject, text)

    return NextResponse.json({
      success: true,
      message: `${unknownKanji.length}文字の不明な漢字をメール通知しました`,
      unknownKanji,
    })
  } catch (error) {
    console.error('推測マーク通知エラー:', error)
    return NextResponse.json(
      { error: 'メール通知に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

