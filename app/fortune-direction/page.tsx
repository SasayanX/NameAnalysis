"use client"

import type React from "react"

import { useState } from "react"
import { FortuneDirectionTable } from "@/components/fortune-direction-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"

export default function FortuneDirectionPage() {
  const [name, setName] = useState("")
  const [starPerson, setStarPerson] = useState<StarPersonType>("木星人+")
  const [startYear, setStartYear] = useState(2021)
  const [showTable, setShowTable] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowTable(true)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">運気方位表</h1>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>運気方位表の設定</CardTitle>
            <CardDescription>あなたの情報を入力して、運気方位表を表示します。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fortune-name">お名前</Label>
                  <Input
                    id="fortune-name"
                    name="fortuneName"
                    placeholder="お名前を入力してください"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fortune-starPerson">星人タイプ</Label>
                  <Select value={starPerson} onValueChange={(value) => setStarPerson(value as StarPersonType)}>
                    <SelectTrigger id="fortune-starPerson">
                      <SelectValue placeholder="星人タイプを選択してください" />
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

              <div className="space-y-2">
                <Label htmlFor="fortune-startYear">開始年</Label>
                <Input
                  id="fortune-startYear"
                  name="fortuneStartYear"
                  type="number"
                  min="1900"
                  max="2100"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                />
              </div>

              <Button type="submit" className="w-full">
                運気方位表を表示
              </Button>
            </form>
          </CardContent>
        </Card>

        {showTable && <FortuneDirectionTable starPerson={starPerson} name={name} startYear={startYear} />}
      </div>
    </div>
  )
}
