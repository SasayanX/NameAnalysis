"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { getDestinyNumberFromBirthdate, getZodiac } from "@/lib/six-star-csv-loader"

// CSVファイルのURL
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-vMqMWreWCm9qKYPkqT3QzYut4jN41n.csv"

export default function TestPage() {
  const [birthdate, setBirthdate] = useState("")
  const [result, setResult] = useState<any>(null)
  const [destinyNumber, setDestinyNumber] = useState<number | null>(null)
  const [starNumber, setStarNumber] = useState<number | null>(null)
  const [zodiac, setZodiac] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!birthdate) return

    setIsLoading(true)
    setError(null)

    try {
      const date = new Date(birthdate)
      if (isNaN(date.getTime())) {
        throw new Error("無効な日付です")
      }

      // 干支を計算
      const zodiacSign = getZodiac(date.getFullYear())
      setZodiac(zodiacSign)

      // 運命数を取得
      const destinyResult = await getDestinyNumberFromBirthdate(date, CSV_URL)
      setDestinyNumber(destinyResult.destinyNumber)
      setStarNumber(destinyResult.starNumber)

      // 六星占術の結果を計算
      const sixStarResult = await calculateSixStarFromCSV(date)
      setResult(sixStarResult)
    } catch (err) {
      console.error("Error calculating six star:", err)
      setError(err instanceof Error ? err.message : "計算中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">六星占術テストページ</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>生年月日から六星占術の星を計算</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthdate">生年月日</Label>
              <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            </div>

            <Button onClick={handleCalculate} disabled={isLoading}>
              {isLoading ? "計算中..." : "計算する"}
            </Button>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">エラー: {error}</div>}

            {result && (
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="font-medium text-lg mb-2">計算結果</h3>
                <p>
                  <strong>干支:</strong> {zodiac}
                </p>
                <p>
                  <strong>運命数:</strong> {destinyNumber}
                </p>
                <p>
                  <strong>星数:</strong> {starNumber}
                </p>
                <p>
                  <strong>星:</strong> {result.star}人{result.type}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  計算方法: 運命数({destinyNumber}) - 1 + 生まれ日 = 星数({starNumber})
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
