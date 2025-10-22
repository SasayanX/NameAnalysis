"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SimpleAnalysisResult } from "@/components/simple-analysis-result"
import { analyzeNameFortuneCustom } from "@/lib/name-data-simple-custom"
import { useFortuneData } from "@/contexts/fortune-data-context"

export default function NameAnalysisDemo() {
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [gender, setGender] = useState("male")
  const [results, setResults] = useState<any>(null)
  const { fortuneData } = useFortuneData()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lastName && firstName) {
      // カスタムデータを使用して名前分析を行う
      const analysisResults = analyzeNameFortuneCustom(lastName, firstName, fortuneData, gender)
      setResults(analysisResults)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">姓名判断</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">姓</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="例：山田"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">名</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="例：太郎"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>性別</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">男性</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">女性</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full">
            鑑定する
          </Button>
        </form>
      </div>

      {results && <SimpleAnalysisResult results={results} name={`${lastName}${firstName}`} gender={gender} />}
    </div>
  )
}
