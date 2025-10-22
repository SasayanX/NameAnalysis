"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { starPersonPatterns, type StarPersonType, type FortuneType } from "@/lib/fortune-flow-calculator"
import { comparePatterns, originalPatterns, updateAllPatterns } from "@/lib/pattern-validator"

interface PatternComparisonTableProps {
  onUpdatePatterns: (patterns: Record<StarPersonType, FortuneType[]>) => void
}

export function PatternComparisonTable({ onUpdatePatterns }: PatternComparisonTableProps) {
  const [selectedStarPerson, setSelectedStarPerson] = useState<StarPersonType>("木星人+")

  // 現在のパターンと移植元パターンを比較
  const comparisonResults = comparePatterns(starPersonPatterns, originalPatterns)

  // 選択された星人タイプの比較結果
  const selectedResult = comparisonResults[selectedStarPerson]

  // 完全一致の星人タイプを取得
  const perfectMatches = Object.values(comparisonResults).filter((result) => result.matchPercentage === 100)

  // 不一致の星人タイプを取得
  const mismatches = Object.values(comparisonResults).filter((result) => result.matchPercentage < 100)

  // 全体の一致率を計算
  const totalMatches = Object.values(comparisonResults).reduce((sum, result) => sum + result.matches, 0)
  const totalPossible = Object.values(comparisonResults).reduce((sum, result) => sum + result.total, 0)
  const overallMatchPercentage = (totalMatches / totalPossible) * 100

  // 運気の色を取得する関数
  const getFortuneColor = (fortune: FortuneType): string => {
    switch (fortune) {
      case "大吉":
        return "text-red-600 font-bold"
      case "吉":
        return "text-green-600"
      case "中吉":
        return "text-purple-600"
      case "凶":
        return "text-orange-600"
      case "大凶":
        return "text-black font-bold"
      case "中凶":
        return "text-amber-600"
      default:
        return ""
    }
  }

  // パターンを更新する関数
  const handleUpdateAllPatterns = () => {
    const updatedPatterns = updateAllPatterns(starPersonPatterns, originalPatterns)
    onUpdatePatterns(updatedPatterns)
  }

  return (
    <Tabs defaultValue="comparison">
      <TabsList className="mb-4">
        <TabsTrigger value="comparison">比較結果</TabsTrigger>
        <TabsTrigger value="details">詳細</TabsTrigger>
        <TabsTrigger value="summary">サマリー</TabsTrigger>
      </TabsList>

      <TabsContent value="comparison">
        <Card>
          <CardHeader>
            <CardTitle>運気パターン比較</CardTitle>
            <CardDescription>現在のパターンと移植元パターンの比較結果</CardDescription>
            <div className="mt-2">
              <Select
                value={selectedStarPerson}
                onValueChange={(value) => setSelectedStarPerson(value as StarPersonType)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="星人タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(starPersonPatterns).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant={selectedResult.matchPercentage === 100 ? "success" : "destructive"}>
                一致率: {selectedResult.matchPercentage.toFixed(1)}%
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月</TableHead>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <TableHead key={month} className="text-center">
                      {month}月
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">現在</TableCell>
                  {starPersonPatterns[selectedStarPerson].map((fortune, index) => {
                    const isMatch = fortune === originalPatterns[selectedStarPerson][index]
                    return (
                      <TableCell
                        key={`current-${index}`}
                        className={`text-center ${getFortuneColor(fortune)} ${!isMatch ? "bg-yellow-100" : ""}`}
                      >
                        {fortune}
                      </TableCell>
                    )
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">移植元</TableCell>
                  {originalPatterns[selectedStarPerson].map((fortune, index) => {
                    const isMatch = fortune === starPersonPatterns[selectedStarPerson][index]
                    return (
                      <TableCell
                        key={`original-${index}`}
                        className={`text-center ${getFortuneColor(fortune)} ${!isMatch ? "bg-yellow-100" : ""}`}
                      >
                        {fortune}
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableBody>
            </Table>

            {selectedResult.differences.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">不一致の詳細</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedResult.differences.map((diff) => (
                    <li key={`diff-${diff.month}`}>
                      {diff.month}月: 現在「
                      <span className={getFortuneColor(diff.current)}>{diff.current}</span>」→ 移植元「
                      <span className={getFortuneColor(diff.original)}>{diff.original}</span>」
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateAllPatterns}>すべてのパターンを移植元に更新</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>星人タイプ別の一致率</CardTitle>
            <CardDescription>各星人タイプの運気パターンの一致状況</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>星人タイプ</TableHead>
                  <TableHead>一致数</TableHead>
                  <TableHead>総数</TableHead>
                  <TableHead>一致率</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(comparisonResults).map((result) => (
                  <TableRow key={result.starPerson}>
                    <TableCell className="font-medium">{result.starPerson}</TableCell>
                    <TableCell>{result.matches}</TableCell>
                    <TableCell>{result.total}</TableCell>
                    <TableCell>{result.matchPercentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      {result.matchPercentage === 100 ? (
                        <Badge variant="success">完全一致</Badge>
                      ) : (
                        <Badge variant="destructive">不一致あり</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>運気パターン一致サマリー</CardTitle>
            <CardDescription>全体の一致状況の概要</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">全体の一致率</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{overallMatchPercentage.toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      overallMatchPercentage > 90
                        ? "bg-green-500"
                        : overallMatchPercentage > 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${overallMatchPercentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {totalMatches} / {totalPossible} 個の運気が一致しています
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">完全一致の星人タイプ</h3>
                {perfectMatches.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {perfectMatches.map((result) => (
                      <li key={`perfect-${result.starPerson}`}>{result.starPerson}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">完全一致の星人タイプはありません</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">不一致のある星人タイプ</h3>
                {mismatches.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {mismatches.map((result) => (
                      <li key={`mismatch-${result.starPerson}`}>
                        {result.starPerson} ({result.matchPercentage.toFixed(1)}% 一致)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">すべての星人タイプが完全一致しています</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateAllPatterns}>すべてのパターンを移植元に更新</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
