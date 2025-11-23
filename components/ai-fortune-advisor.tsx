// AI開運アドバイス表示コンポーネント
"use client"

import React, { useState, useEffect } from "react"
import { generateAIFortuneAdvice, AIFortuneAdvice, NameAnalysisData } from "@/lib/ai-fortune-advisor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, Briefcase, Users, Activity, Calendar, TrendingUp } from "lucide-react"

interface AIFortuneAdvisorProps {
  analysisData: NameAnalysisData
  className?: string
}

export function AIFortuneAdvisor({ analysisData, className = "" }: AIFortuneAdvisorProps) {
  const [aiAdvice, setAiAdvice] = useState<AIFortuneAdvice | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<keyof AIFortuneAdvice>("personalizedAdvice")

  useEffect(() => {
    generateAdvice()
  }, [analysisData])

  const generateAdvice = async () => {
    setIsGenerating(true)
    try {
      // AI生成の演出（実際のAPI呼び出しをシミュレート）
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const advice = generateAIFortuneAdvice(analysisData)
      setAiAdvice(advice)
    } catch (error) {
      console.error("AIアドバイス生成エラー:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI開運アドバイス生成中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">AIがあなた専用のアドバイスを生成しています...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!aiAdvice) {
    return (
      <Card className={`${className}`}>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">アドバイスを生成できませんでした</p>
          <Button onClick={generateAdvice} className="mt-4">
            再生成
          </Button>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { key: "personalizedAdvice" as const, label: "パーソナルアドバイス", icon: Sparkles },
    { key: "careerGuidance" as const, label: "キャリア", icon: Briefcase },
    { key: "relationshipAdvice" as const, label: "人間関係", icon: Users },
    { key: "healthTips" as const, label: "健康", icon: Activity },
    { key: "dailyActions" as const, label: "日々のアクション", icon: Calendar },
    { key: "yearlyOutlook" as const, label: "年間展望", icon: TrendingUp },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "personalizedAdvice":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{aiAdvice.personalizedAdvice}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">ラッキー要素</h4>
                <div className="flex flex-wrap gap-1">
                  {aiAdvice.luckyElements.map((element, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">ラッキーカラー</h4>
                <div className="flex flex-wrap gap-1">
                  {aiAdvice.luckyColors.map((color, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">ラッキーナンバー</h4>
                <div className="flex flex-wrap gap-1">
                  {aiAdvice.luckyNumbers.map((number, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "careerGuidance":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">キャリアガイダンス</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{aiAdvice.careerGuidance}</p>
              </div>
            </div>
          </div>
        )

      case "relationshipAdvice":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-pink-500 dark:text-pink-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">人間関係アドバイス</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{aiAdvice.relationshipAdvice}</p>
              </div>
            </div>
          </div>
        )

      case "healthTips":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-green-500 dark:text-green-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">健康アドバイス</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{aiAdvice.healthTips}</p>
              </div>
            </div>
          </div>
        )

      case "dailyActions":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">日々のアクション</h3>
                <div className="space-y-2">
                  {aiAdvice.dailyActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-200">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">今月のフォーカス</h4>
              <p className="text-gray-700 dark:text-gray-200">{aiAdvice.monthlyFocus}</p>
            </div>
          </div>
        )

      case "yearlyOutlook":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">年間展望</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{aiAdvice.yearlyOutlook}</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI開運アドバイス
          <Badge variant="secondary" className="ml-auto">
            無料
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          あなたの姓名判断結果に基づいて、AIがパーソナライズされた開運アドバイスを生成しました
        </p>
      </CardHeader>
      
      <CardContent>
        {/* タブナビゲーション */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* タブコンテンツ */}
        <div className="min-h-[200px]">
          {renderTabContent()}
        </div>

        {/* 再生成ボタン */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <Button 
            onClick={generateAdvice} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            アドバイスを再生成
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
