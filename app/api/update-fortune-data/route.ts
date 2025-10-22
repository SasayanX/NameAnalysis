import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const { fortuneData, fortuneExplanations } = await request.json()

    // カスタムデータファイルの内容を生成
    const fileContent = `// カスタム運勢データ - インポートしたデータがここに保存されます
// このファイルはインポート機能によって自動的に更新されます

export const customFortuneData: Record<string, { 運勢: string; 説明: string }> = ${JSON.stringify(fortuneData, null, 2)}

export const customFortuneExplanations: Record<string, {
  title: string
  description: string
  characteristics: string[]
  advice: string
  examples: number[]
}> = ${JSON.stringify(fortuneExplanations, null, 2)}

// カスタムデータが設定されているかどうかを確認する関数
export function hasCustomData(): boolean {
  return Object.keys(customFortuneData).length > 0
}
`

    // ファイルパスを設定
    const filePath = join(process.cwd(), "lib", "fortune-data-custom.ts")

    // ファイルに書き込み
    await writeFile(filePath, fileContent, "utf8")

    return NextResponse.json({
      success: true,
      message: "カスタムデータファイルが更新されました",
    })
  } catch (error) {
    console.error("ファイル更新エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "ファイルの更新に失敗しました",
      },
      { status: 500 },
    )
  }
}
