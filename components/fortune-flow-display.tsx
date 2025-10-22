"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FortuneFlowTable } from "./fortune-flow-table"

export function FortuneFlowDisplay() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>運気運行表</CardTitle>
          <CardDescription>12年間の運気の流れを確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <FortuneFlowTable />
        </CardContent>
      </Card>
    </div>
  )
}
