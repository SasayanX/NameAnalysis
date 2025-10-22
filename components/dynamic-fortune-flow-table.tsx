"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"
import { FortuneFlowTable } from "@/components/fortune-flow-table"

interface DynamicFortuneFlowTableProps {
  title?: string
  description?: string
  defaultStarPerson?: StarPersonType
  showCompatibility?: boolean
}

export function DynamicFortuneFlowTable({
  title = "運気運行表",
  description,
  defaultStarPerson = "木星人+",
  showCompatibility = false,
}: DynamicFortuneFlowTableProps) {
  const [starPerson, setStarPerson] = useState<StarPersonType>(defaultStarPerson)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="star-person">星人タイプ:</Label>
            <Select value={starPerson} onValueChange={(value) => setStarPerson(value as StarPersonType)}>
              <SelectTrigger id="star-person" className="w-[180px]">
                <SelectValue placeholder="星人タイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="木星人+">木星人+</SelectItem>
                <SelectItem value="木星人-">木星人-</SelectItem>
                <SelectItem value="火星人+">火星人+</SelectItem>
                <SelectItem value="火星人-">火星人-</SelectItem>
                <SelectItem value="土星人+">土星人+</SelectItem>
                <SelectItem value="土星人-">土星人-</SelectItem>
                <SelectItem value="金星人+">金星人+</SelectItem>
                <SelectItem value="金星人-">金星人-</SelectItem>
                <SelectItem value="水星人+">水星人+</SelectItem>
                <SelectItem value="水星人-">水星人-</SelectItem>
                <SelectItem value="天王星人+">天王星人+</SelectItem>
                <SelectItem value="天王星人-">天王星人-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FortuneFlowTable starPerson={starPerson} showCompatibility={showCompatibility} />
      </CardContent>
    </Card>
  )
}
