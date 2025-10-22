"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { AdvancedFiveElementsChart } from "@/components/advanced-five-elements-chart"

export default function GogyoExample() {
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [result, setResult] = useState<any>(null)

  const handleCalculate = () => {
    if (!lastName || !firstName) return

    const birthdateObj = birthdate ? new Date(birthdate) : undefined
    const gogyoResult = calculateGogyo(lastName, firstName, birthdateObj)
    setResult(gogyoResult)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>陰陽五行算出</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">姓</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="例: 高畑"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">名</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="例: 充希"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">生年月日</Label>
              <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            </div>
            <Button onClick={handleCalculate}>算出する</Button>
          </div>
        </CardContent>
      </Card>

      {result && <AdvancedFiveElementsChart gogyoResult={result} isPremium={true} />}
    </div>
  )
}
