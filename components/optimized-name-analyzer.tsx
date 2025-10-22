"use client"

import React, { memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAnalysis } from "@/contexts/analysis-context"
import { useOptimizedAnalysis } from "@/hooks/use-optimized-analysis"

// 動的インポート用のコンポーネント
const LazyNameAnalysisResult = React.lazy(() => import("./name-analysis-result"))
const LazyCompanyNameResult = React.lazy(() => import("./company-name-result"))
const LazyStarTypeSelector = React.lazy(() => import("./star-type-selector"))
const LazyFortuneFlowDisplay = React.lazy(() => import("./fortune-flow-display"))
const LazyPDFExportButton = React.lazy(() => import("./pdf-export-button"))

// 個人名入力フォームをメモ化
const PersonalForm = memo(function PersonalForm() {
  const { state, setPersonalField } = useAnalysis()
  const { analyzePersonName } = useOptimizedAnalysis()
  const { personal } = state

  const handleBirthdateChange = useCallback(
    (dateString: string) => {
      setPersonalField("birthdateString", dateString)

      try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          setPersonalField("birthdate", date)
          setPersonalField("error", null)
        } else {
          setPersonalField("birthdate", null)
        }
      } catch (error) {
        console.error("Error parsing date:", error)
        setPersonalField("birthdate", null)
        setPersonalField("error", "日付の形式が正しくありません")
      }
    },
    [setPersonalField],
  )

  const hasValidInput = useMemo(() => {
    return Boolean(personal.lastName.trim() && personal.firstName.trim())
  }, [personal.lastName, personal.firstName])

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lastName">姓</Label>
          <Input
            id="lastName"
            name="lastName"
            value={personal.lastName}
            onChange={(e) => setPersonalField("lastName", e.target.value)}
            placeholder="山田"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">名</Label>
          <Input
            id="firstName"
            name="firstName"
            value={personal.firstName}
            onChange={(e) => setPersonalField("firstName", e.target.value)}
            placeholder="太郎"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">生年月日（六星占術用）</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          value={personal.birthdateString}
          onChange={(e) => handleBirthdateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>性別</Label>
        <RadioGroup
          value={personal.gender}
          onValueChange={(value) => setPersonalField("gender", value as "male" | "female")}
          className="flex flex-row space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="gender-male" />
            <Label htmlFor="gender-male">男性</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="gender-female" />
            <Label htmlFor="gender-female">女性</Label>
          </div>
        </RadioGroup>
      </div>

      {personal.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{personal.error}</div>}

      <Button onClick={analyzePersonName} disabled={personal.isLoading || !hasValidInput} className="w-full">
        {personal.isLoading ? "分析中..." : "名前を分析"}
      </Button>
    </div>
  )
})

// 会社名入力フォームをメモ化
const CompanyForm = memo(function CompanyForm() {
  const { state, setCompanyField } = useAnalysis()
  const { analyzeCompany } = useOptimizedAnalysis()
  const { company } = state

  const hasValidInput = useMemo(() => {
    return Boolean(company.companyName.trim())
  }, [company.companyName])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">会社名・商品名</Label>
        <Input
          id="companyName"
          name="companyName"
          value={company.companyName}
          onChange={(e) => setCompanyField("companyName", e.target.value)}
          placeholder="例：株式会社ABC, 新商品α"
        />
      </div>

      {company.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{company.error}</div>}

      <Button onClick={analyzeCompany} disabled={company.isLoading || !hasValidInput} className="w-full">
        {company.isLoading ? "分析中..." : "会社名・商品名を分析"}
      </Button>
    </div>
  )
})

// メインコンポーネント
export const OptimizedNameAnalyzer = memo(function OptimizedNameAnalyzer() {
  const { state, setUIField } = useAnalysis()
  const { ui, personal, company } = state

  const cyclePremiumLevel = useCallback(() => {
    setUIField("premiumLevel", ui.premiumLevel >= 3 ? 1 : ui.premiumLevel + 1)
  }, [ui.premiumLevel, setUIField])

  const handleTabChange = useCallback(
    (value: string) => {
      setUIField("activeTab", value as "personal" | "company")
    },
    [setUIField],
  )

  const handleFortuneFlowToggle = useCallback(() => {
    setUIField("showFortuneFlow", !ui.showFortuneFlow)
  }, [ui.showFortuneFlow, setUIField])

  const premiumLevelText = useMemo(() => {
    switch (ui.premiumLevel) {
      case 1:
        return "シンプル"
      case 2:
        return "詳細"
      case 3:
        return "高度"
      default:
        return "シンプル"
    }
  }, [ui.premiumLevel])

  const personalPDFData = useMemo(
    () => ({
      type: "personal" as const,
      name: `${personal.lastName} ${personal.firstName}`,
      result: personal.results,
      premiumLevel: ui.premiumLevel,
      starType: ui.selectedStarType,
      birthdate: personal.birthdateString,
    }),
    [
      personal.lastName,
      personal.firstName,
      personal.results,
      ui.premiumLevel,
      ui.selectedStarType,
      personal.birthdateString,
    ],
  )

  const companyPDFData = useMemo(
    () => ({
      type: "company" as const,
      name: company.companyName,
      result: company.results,
      premiumLevel: ui.premiumLevel,
    }),
    [company.companyName, company.results, ui.premiumLevel],
  )

  const birthYear = useMemo(() => {
    return personal.birthdateString ? new Date(personal.birthdateString).getFullYear() : 0
  }, [personal.birthdateString])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            名前分析ツール
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={cyclePremiumLevel}
              >
                {premiumLevelText}分析
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            名前の画数や運勢を分析します。プレミアムレベルをクリックして分析の詳細度を変更できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={ui.activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">個人名分析</TabsTrigger>
              <TabsTrigger value="company">社名・商品名分析</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <PersonalForm />

              {personal.results && (
                <div className="space-y-4">
                  <React.Suspense fallback={<div>読み込み中...</div>}>
                    <LazyNameAnalysisResult result={personal.results} premiumLevel={ui.premiumLevel} />

                    {personal.birthdate && (
                      <div className="space-y-4">
                        <LazyStarTypeSelector
                          selectedStarType={ui.selectedStarType}
                          onStarTypeChange={(starType) => setUIField("selectedStarType", starType)}
                          birthdate={personal.birthdateString}
                          gender={personal.gender}
                        />

                        {ui.selectedStarType && (
                          <div className="space-y-4">
                            <Button onClick={handleFortuneFlowToggle} variant="outline" className="w-full">
                              {ui.showFortuneFlow ? "運勢表を隠す" : "運勢表を表示"}
                            </Button>

                            {ui.showFortuneFlow && (
                              <LazyFortuneFlowDisplay starType={ui.selectedStarType} birthYear={birthYear} />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <LazyPDFExportButton data={personalPDFData} />
                  </React.Suspense>
                </div>
              )}
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <CompanyForm />

              {company.results && (
                <div className="space-y-4">
                  <React.Suspense fallback={<div>読み込み中...</div>}>
                    <LazyCompanyNameResult result={company.results} premiumLevel={ui.premiumLevel} />
                    <LazyPDFExportButton data={companyPDFData} />
                  </React.Suspense>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})

export default OptimizedNameAnalyzer
