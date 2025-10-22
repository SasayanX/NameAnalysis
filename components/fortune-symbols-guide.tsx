"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fortuneSymbols, type FortuneType } from "@/lib/fortune-flow-calculator"

export function FortuneSymbolsGuide() {
  // 運気記号の説明
  const fortuneDescriptions: Record<FortuneType, string> = {
    大吉: "非常に良い運気。積極的に行動すると大きな成果が得られる時期。",
    吉: "良い運気。物事が順調に進み、計画通りに進める時期。",
    中吉: "まずまずの運気。無理をせず着実に進めると良い時期。",
    凶: "注意が必要な運気。慎重に行動し、重要な決断は避けるべき時期。",
    大凶: "非常に注意が必要な運気。守りに徹し、新しいことは始めない方が良い時期。",
    中凶: "やや注意が必要な運気。慎重さを心がけ、無理な計画は避ける時期。",
  }

  // 運気記号の色を決定する関数
  const getFortuneSymbolColor = (fortune: FortuneType): string => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>運気記号の説明</CardTitle>
        <CardDescription>六星占術で使用される運気記号とその意味</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>運気</TableHead>
              <TableHead>記号</TableHead>
              <TableHead>意味</TableHead>
              <TableHead>対応方法</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(fortuneSymbols) as FortuneType[]).map((fortune) => (
              <TableRow key={fortune}>
                <TableCell className={getFortuneSymbolColor(fortune)}>{fortune}</TableCell>
                <TableCell className={`text-2xl ${getFortuneSymbolColor(fortune)}`}>
                  {fortuneSymbols[fortune]}
                </TableCell>
                <TableCell>{fortuneDescriptions[fortune]}</TableCell>
                <TableCell>
                  {fortune === "大吉" && "積極的に行動し、チャンスを逃さないようにしましょう。"}
                  {fortune === "吉" && "計画を実行に移すのに適した時期です。"}
                  {fortune === "中吉" && "無理せず着実に進めることで良い結果が得られます。"}
                  {fortune === "凶" && "慎重に行動し、重要な決断は避けましょう。"}
                  {fortune === "大凶" && "守りの姿勢を取り、新しいことは始めないようにしましょう。"}
                  {fortune === "中凶" && "無理な計画は避け、基本に忠実に行動しましょう。"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
