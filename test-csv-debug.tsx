"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadSixStarCSV, findSixStarFromCSV } from "@/lib/six-star-csv-loader"

export default function TestCSVDebug() {
  const [csvData, setCsvData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [rawCSVSample, setRawCSVSample] = useState<string>("")

  const loadAndDebugCSV = async () => {
    setIsLoading(true)
    try {
      // CSVデータを読み込み
      const data = await loadSixStarCSV()
      setCsvData(data)

      // 2000年9月のデータを検索
      const testDate = new Date(2000, 8, 22) // 2000年9月22日
      const found = findSixStarFromCSV(data, testDate)
      setSearchResult(found)

      // 生CSVデータの最初の部分を取得
      try {
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-BBtsr8aWCfa7Q8aLdN3JwcZ507aceE.csv",
        )
        const csvText = await response.text()
        setRawCSVSample(csvText.substring(0, 1000))
      } catch (error) {
        console.error("生CSV取得エラー:", error)
      }
    } catch (error) {
      console.error("CSV読み込みエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAndDebugCSV()
  }, [])

  // 2000年のデータをフィルタ
  const year2000Data = csvData.filter((d) => d.year === 2000)
  const year2000Month9Data = csvData.filter((d) => d.year === 2000 && d.month === 9)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV列ズレデバッグ</CardTitle>
          <CardDescription>2000年9月の運命数が正しく取得できているかチェック</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={loadAndDebugCSV} disabled={isLoading}>
            {isLoading ? "読み込み中..." : "CSV再読み込み"}
          </Button>

          {/* 検索結果 */}
          {searchResult && (
            <Alert className={searchResult.destinyNumber === 59 ? "border-green-500" : "border-red-500"}>
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>2000年9月22日の検索結果:</strong>
                  </div>
                  <div>
                    運命数:{" "}
                    <Badge variant={searchResult.destinyNumber === 59 ? "default" : "destructive"}>
                      {searchResult.destinyNumber}
                    </Badge>{" "}
                    (期待値: 59)
                  </div>
                  <div>
                    星: {searchResult.star}人{searchResult.type}
                  </div>
                  <div>干支: {searchResult.zodiac}</div>
                  <div>五行: {searchResult.element}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">総データ数</div>
                <div className="text-2xl font-bold">{csvData.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">2000年データ数</div>
                <div className="text-2xl font-bold">{year2000Data.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">2000年9月データ数</div>
                <div className="text-2xl font-bold">{year2000Month9Data.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 生CSVサンプル */}
          {rawCSVSample && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生CSVデータ（最初の1000文字）</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto whitespace-pre-wrap">{rawCSVSample}</pre>
              </CardContent>
            </Card>
          )}

          {/* 2000年9月のデータサンプル */}
          {year2000Month9Data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2000年9月のデータサンプル（最初の10件）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">年</th>
                        <th className="text-left p-2">月</th>
                        <th className="text-left p-2">日</th>
                        <th className="text-left p-2">運命数</th>
                        <th className="text-left p-2">星</th>
                        <th className="text-left p-2">タイプ</th>
                        <th className="text-left p-2">干支</th>
                        <th className="text-left p-2">五行</th>
                      </tr>
                    </thead>
                    <tbody>
                      {year2000Month9Data.slice(0, 10).map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{data.year}</td>
                          <td className="p-2">{data.month}</td>
                          <td className="p-2">{data.day}</td>
                          <td className="p-2">
                            <Badge variant={data.destinyNumber === 59 ? "default" : "secondary"}>
                              {data.destinyNumber}
                            </Badge>
                          </td>
                          <td className="p-2">{data.star}</td>
                          <td className="p-2">{data.type}</td>
                          <td className="p-2">{data.zodiac}</td>
                          <td className="p-2">{data.element}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2000年全体のデータサンプル */}
          {year2000Data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2000年全体のデータサンプル（最初の20件）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">年</th>
                        <th className="text-left p-2">月</th>
                        <th className="text-left p-2">日</th>
                        <th className="text-left p-2">運命数</th>
                        <th className="text-left p-2">星</th>
                        <th className="text-left p-2">タイプ</th>
                        <th className="text-left p-2">干支</th>
                        <th className="text-left p-2">五行</th>
                      </tr>
                    </thead>
                    <tbody>
                      {year2000Data.slice(0, 20).map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{data.year}</td>
                          <td className="p-2">{data.month}</td>
                          <td className="p-2">{data.day}</td>
                          <td className="p-2">
                            <Badge variant={data.month === 9 && data.destinyNumber === 59 ? "default" : "secondary"}>
                              {data.destinyNumber}
                            </Badge>
                          </td>
                          <td className="p-2">{data.star}</td>
                          <td className="p-2">{data.type}</td>
                          <td className="p-2">{data.zodiac}</td>
                          <td className="p-2">{data.element}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 運命数の分布 */}
          {year2000Data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2000年の月別運命数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const monthData = year2000Data.find((d) => d.month === month)
                    return (
                      <div key={month} className="flex justify-between p-2 border rounded">
                        <span>{month}月:</span>
                        <Badge variant={month === 9 && monthData?.destinyNumber === 59 ? "default" : "secondary"}>
                          {monthData?.destinyNumber || "なし"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
