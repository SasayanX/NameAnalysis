"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { loadDestinyNumbersFromCSV } from "@/lib/six-star-csv-loader"

// CSVファイルのURL
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-vMqMWreWCm9qKYPkqT3QzYut4jN41n.csv"

export default function CSVViewerPage() {
  const [csvData, setCsvData] = useState<Map<string, Map<number, number>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchYear, setSearchYear] = useState("")
  const [filteredData, setFilteredData] = useState<[string, Map<number, number>][]>([])

  useEffect(() => {
    async function loadCSVData() {
      try {
        const data = await loadDestinyNumbersFromCSV(CSV_URL)
        setCsvData(data)

        // 初期表示用にすべてのデータをセット
        const allData = Array.from(data.entries())
        setFilteredData(allData.slice(0, 10)) // 最初の10年分だけ表示
      } catch (err) {
        console.error("Error loading CSV data:", err)
        setError(err instanceof Error ? err.message : "CSVデータの読み込み中にエラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadCSVData()
  }, [])

  const handleSearch = () => {
    if (!csvData) return

    if (searchYear) {
      // 特定の年を検索
      const yearData = csvData.get(searchYear)
      if (yearData) {
        setFilteredData([[searchYear, yearData]])
      } else {
        setFilteredData([])
        setError(`${searchYear}年のデータが見つかりませんでした`)
      }
    } else {
      // 検索条件がない場合は最初の10年分を表示
      const allData = Array.from(csvData.entries())
      setFilteredData(allData.slice(0, 10))
      setError(null)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">運命数CSVビューア</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>年で検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="searchYear">年（例: 1969）</Label>
              <Input
                id="searchYear"
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                placeholder="年を入力"
              />
            </div>
            <Button onClick={handleSearch}>検索</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">データを読み込み中...</div>
      ) : error && filteredData.length === 0 ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>運命数データ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>年</TableHead>
                    <TableHead>1月</TableHead>
                    <TableHead>2月</TableHead>
                    <TableHead>3月</TableHead>
                    <TableHead>4月</TableHead>
                    <TableHead>5月</TableHead>
                    <TableHead>6月</TableHead>
                    <TableHead>7月</TableHead>
                    <TableHead>8月</TableHead>
                    <TableHead>9月</TableHead>
                    <TableHead>10月</TableHead>
                    <TableHead>11月</TableHead>
                    <TableHead>12月</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(([year, monthMap]) => (
                    <TableRow key={year}>
                      <TableCell className="font-medium">{year}</TableCell>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <TableCell key={month}>{monthMap.get(month) || "-"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && !error && (
              <div className="text-center py-4">データが見つかりませんでした</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
