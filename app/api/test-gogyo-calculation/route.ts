import { NextRequest, NextResponse } from "next/server"
import { calculateGogyo } from "@/lib/advanced-gogyo"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lastName = searchParams.get("lastName") || "田中"
    const firstName = searchParams.get("firstName") || "太郎"
    const birthdateStr = searchParams.get("birthdate")

    let birthdate: Date | undefined
    if (birthdateStr) {
      birthdate = new Date(birthdateStr)
    }

    console.log("=== 五行計算テスト ===")
    console.log(`名前: ${lastName} ${firstName}`)
    console.log(`生年月日: ${birthdate ? birthdate.toISOString() : "未設定"}`)

    const result = calculateGogyo(lastName, firstName, birthdate)

    return NextResponse.json({
      success: true,
      input: {
        lastName,
        firstName,
        birthdate: birthdate ? birthdate.toISOString() : null,
      },
      result: {
        elements: result.elements,
        dominantElement: result.dominantElement,
        weakElement: result.weakElement,
        birthStars: result.birthStars,
        nameStars: result.nameStars,
        debug: result.debug,
      },
    })
  } catch (error) {
    console.error("五行計算テストエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

