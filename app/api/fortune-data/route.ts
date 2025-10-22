import { NextResponse } from "next/server"

// Supabaseを使用したデータ永続化
export async function GET() {
  try {
    // 環境変数からカスタムデータを取得
    const customData = process.env.CUSTOM_FORTUNE_DATA

    if (customData) {
      const parsedData = JSON.parse(customData)
      return NextResponse.json({
        success: true,
        data: parsedData,
      })
    }

    return NextResponse.json({
      success: false,
      message: "カスタムデータが見つかりません",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "データの取得に失敗しました",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { fortuneData, fortuneExplanations } = await request.json()

    // 本来はここでデータベースに保存
    // 現在は環境変数での設定を案内
    const dataToSave = {
      fortuneData,
      fortuneExplanations,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "データを受信しました。永続化するには環境変数を設定してください。",
      data: dataToSave,
      instructions: {
        envVar: "CUSTOM_FORTUNE_DATA",
        value: JSON.stringify(dataToSave),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "データの処理に失敗しました",
      },
      { status: 500 },
    )
  }
}
