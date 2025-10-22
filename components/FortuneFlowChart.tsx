"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface FortuneFlowChartProps {
  starPerson?: string
  data?: Array<{
    month: string
    fortune: number
    label: string
  }>
}

export default function FortuneFlowChart({ starPerson = "土星人プラス", data = [] }: FortuneFlowChartProps) {
  // デフォルトデータを生成
  const defaultData = [
    { month: "1月", fortune: 3, label: "○" },
    { month: "2月", fortune: 4, label: "◎" },
    { month: "3月", fortune: 2, label: "△" },
    { month: "4月", fortune: 1, label: "×" },
    { month: "5月", fortune: 2, label: "△" },
    { month: "6月", fortune: 3, label: "○" },
    { month: "7月", fortune: 4, label: "◎" },
    { month: "8月", fortune: 3, label: "○" },
    { month: "9月", fortune: 2, label: "△" },
    { month: "10月", fortune: 1, label: "×" },
    { month: "11月", fortune: 2, label: "△" },
    { month: "12月", fortune: 3, label: "○" },
  ]

  const chartData = data.length > 0 ? data : defaultData

  const formatTooltip = (value: number, name: string, props: any) => {
    const fortuneLabels = {
      1: "凶運 (×)",
      2: "小吉運 (△)",
      3: "吉運 (○)",
      4: "大吉運 (◎)",
    }
    return [fortuneLabels[value as keyof typeof fortuneLabels] || "不明", "運気"]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">運気運行チャート</CardTitle>
        <p className="text-center text-sm text-muted-foreground">{starPerson}の年間運気推移</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const labels = { 1: "×", 2: "△", 3: "○", 4: "◎" }
                  return labels[value as keyof typeof labels] || ""
                }}
              />
              <Tooltip formatter={formatTooltip} labelStyle={{ color: "#000" }} />
              <Line
                type="monotone"
                dataKey="fortune"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-semibold mb-2">運気レベル:</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-red-50 rounded">
              <div className="font-bold text-red-600">×</div>
              <div>凶運</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <div className="font-bold text-yellow-600">△</div>
              <div>小吉運</div>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">○</div>
              <div>吉運</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-600">◎</div>
              <div>大吉運</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
