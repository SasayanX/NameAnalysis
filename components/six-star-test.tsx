"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateSixStarFromCSV } from "@/lib/six-star"

export function SixStarTest() {
  const [birthdate, setBirthdate] = useState("1969-06-07")
  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleTest = async () => {
    if (!birthdate) {
      alert("生年月日を入力してください")
      return
    }

    setIsCalculating(true)
    console.log("=== 六星占術テスト開始 ===")
    console.log("入力された生年月日:", birthdate)

    try {
      const date = new Date(birthdate + "T00:00:00")
      console.log("Date オブジェクト:", date)
      console.log("年:", date.getFullYear())
      console.log("月:", date.getMonth() + 1)
      console.log("日:", date.getDate())

      const sixStarResult = await calculateSixStarFromCSV(date)
      console.log("六星占術結果:", sixStarResult)
      setResult(sixStarResult)
    } catch (error) {
      console.error("六星占術テストエラー:", error)
      alert("計算エラーが発生しました: " + error.message)
    } finally {
      setIsCalculating(false)
    }
  }

  const testSpecificDates = async () => {
    console.log("=== 特定日付テスト開始 ===")
    const testDates = ["1969-06-07", "2000-09-22"]

    for (const dateStr of testDates) {
      console.log(`\n📅 テスト: ${dateStr}`)
      try {
        const date = new Date(dateStr + "T00:00:00")
        const result = await calculateSixStarFromCSV(date)
        console.log(`${dateStr} → ${result.star}${result.type}`)
      } catch (error) {
        console.error(`${dateStr} エラー:`, error)
      }
    }
  }

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🧪 六星占術デバッグテスト</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="flex-1" />
          <Button onClick={handleTest} disabled={isCalculating}>
            {isCalculating ? "計算中..." : "テスト実行"}
          </Button>
          <Button onClick={testSpecificDates} variant="outline">
            特定日付テスト
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-semibold mb-2">テスト結果:</h4>
            {result.error ? (
              <p className="text-red-600">エラー: {result.error}</p>
            ) : (
              <div className="space-y-1">
                <p>
                  <strong>星:</strong> {result.star}
                  {result.type}
                </p>
                <p>
                  <strong>運命数:</strong> {result.destinyNumber}
                </p>
                <p>
                  <strong>星数:</strong> {result.starNumber}
                </p>
                <p>
                  <strong>干支:</strong> {result.zodiac}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-blue-600 space-y-1">
          <p>• 1969-06-07 → 木星人- が期待値</p>
          <p>• 2000-09-22 → 金星人+ が期待値</p>
          <p>• コンソールでログを確認してください</p>
        </div>
      </CardContent>
    </Card>
  )
}
