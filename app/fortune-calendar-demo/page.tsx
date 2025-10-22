"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FortuneCalendar } from "@/components/fortune-calendar"

export default function FortuneCalendarDemo() {
  const [lastName, setLastName] = useState("山田")
  const [firstName, setFirstName] = useState("太郎")
  const [birthdate, setBirthdate] = useState("1990-01-01")
  const [userElements, setUserElements] = useState<{
    dominantElement: "木" | "火" | "土" | "金" | "水"
    weakElement: "木" | "火" | "土" | "金" | "水"
  }>({
    dominantElement: "火",
    weakElement: "水",
  })
  const [isPremium, setIsPremium] = useState(true)

  const handleCalculate = () => {
    // 実際のアプリでは、ここで名前と生年月日から五行を計算します
    // このデモでは、ランダムに五行を設定します
    const elements = ["木", "火", "土", "金", "水"] as const
    const dominant = elements[Math.floor(Math.random() * elements.length)]

    // 優勢な要素以外からランダムに弱い要素を選択
    const filteredElements = elements.filter((e) => e !== dominant)
    const weak = filteredElements[Math.floor(Math.random() * filteredElements.length)]

    setUserElements({
      dominantElement: dominant,
      weakElement: weak,
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">運気カレンダーデモ</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">姓</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="例: 山田"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">名</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="例: 太郎"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">生年月日</Label>
                <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              </div>

              <Button onClick={handleCalculate} className="w-full">
                五行を計算
              </Button>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">現在の五行バランス</h3>
                <p className="text-sm">
                  優勢な五行: <span className="font-medium">{userElements.dominantElement}</span>
                </p>
                <p className="text-sm">
                  弱い五行: <span className="font-medium">{userElements.weakElement}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="premium">プレミアム会員</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <FortuneCalendar userElements={userElements} isPremium={isPremium} />
        </div>
      </div>
    </div>
  )
}
