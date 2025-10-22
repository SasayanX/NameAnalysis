"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FortuneFlowTable } from "./fortune-flow-table"

interface FortuneFlowDisplayProps {
  starPerson?: string
  birthYear?: number
  name?: string
}

export default function FortuneFlowDisplay({
  starPerson = "土星人プラス",
  birthYear = 2024,
  name = "",
}: FortuneFlowDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">運気運行表</CardTitle>
          {name && <p className="text-center text-muted-foreground">{name}さんの運気運行</p>}
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              星人タイプ: <span className="font-semibold">{starPerson}</span>
            </p>
            <p className="text-sm text-muted-foreground">基準年: {birthYear}年</p>
          </div>

          <FortuneFlowTable starPerson={starPerson} baseYear={birthYear} />

          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-2">運気記号の意味:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>◎ 大吉運</div>
              <div>○ 吉運</div>
              <div>△ 小吉運</div>
              <div>× 凶運</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
