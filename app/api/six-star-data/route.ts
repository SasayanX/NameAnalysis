import { NextResponse } from "next/server"
import { loadDestinyNumbersFromCSV } from "@/lib/six-star-csv-loader"

// CSVファイルのURLを更新
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-vMqMWreWCm9qKYPkqT3QzYut4jN41n.csv"

export async function GET() {
  try {
    const destinyNumbersData = await loadDestinyNumbersFromCSV(CSV_URL)

    // Map型をJSON化できるオブジェクトに変換
    const formattedData: Record<string, Record<string, number>> = {}

    destinyNumbersData.forEach((monthMap, year) => {
      formattedData[year] = {}
      monthMap.forEach((destinyNumber, month) => {
        formattedData[year][month.toString()] = destinyNumber
      })
    })

    return NextResponse.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    console.error("Error fetching six star data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch six star data" }, { status: 500 })
  }
}
