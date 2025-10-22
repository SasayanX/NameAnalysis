"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Globe,
  Zap,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { SEOAnalyzer, type SEOAnalysisResult } from "@/lib/seo-analyzer"

export function SEOAnalysisDashboard() {
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const analyzer = new SEOAnalyzer()
      const result = await analyzer.analyzeWebsite()
      setAnalysisResult(result)
    } catch (err) {
      setError("分析中にエラーが発生しました。再度お試しください。")
      console.error("SEO Analysis Error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 50) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getSeverityIcon = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: "high" | "medium" | "low") => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    } as const

    const labels = {
      high: "高",
      medium: "中",
      low: "低",
    }

    return <Badge variant={variants[severity]}>{labels[severity]}</Badge>
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "robots":
        return <FileText className="h-5 w-5" />
      case "metadata":
        return <Search className="h-5 w-5" />
      case "sitemap":
        return <Globe className="h-5 w-5" />
      case "performance":
        return <Zap className="h-5 w-5" />
      case "indexing":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getCategoryName = (category: string) => {
    const names = {
      robots: "robots.txt",
      metadata: "メタデータ",
      sitemap: "サイトマップ",
      performance: "パフォーマンス",
      indexing: "インデックス",
    }
    return names[category as keyof typeof names] || category
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO分析ダッシュボード</h1>
          <p className="text-muted-foreground">サイトのSEO状況を総合的に分析します</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "分析中..." : "再分析"}
        </Button>
      </div>

      {analysisResult && (
        <>
          {/* 総合スコア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                総合SEOスコア
              </CardTitle>
              <CardDescription>サイト全体のSEO最適化状況を100点満点で評価</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(analysisResult.score)}`}>
                  {analysisResult.score}
                </div>
                <div className="flex-1">
                  <Progress value={analysisResult.score} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.score >= 80 ? "優秀" : analysisResult.score >= 50 ? "改善の余地あり" : "要改善"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* カテゴリ別スコア */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(analysisResult.categories).map(([key, category]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(key)}
                      <span className="font-medium text-sm">{getCategoryName(key)}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>{category.score}</div>
                  </div>
                  <Progress value={category.score} className="h-2" />
                  <div className="flex items-center gap-1 mt-2">
                    {category.status === "good" && <CheckCircle className="h-3 w-3 text-green-500" />}
                    {category.status === "warning" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                    {category.status === "error" && <XCircle className="h-3 w-3 text-red-500" />}
                    <span className="text-xs text-muted-foreground">{category.issues.length}個の問題</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 詳細分析 */}
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="issues">問題点</TabsTrigger>
              <TabsTrigger value="categories">カテゴリ別</TabsTrigger>
              <TabsTrigger value="recommendations">改善提案</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>検出された問題点</CardTitle>
                  <CardDescription>優先度順に問題点を表示しています</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.issues.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">問題は見つかりませんでした！</p>
                      <p className="text-muted-foreground">SEO設定は良好です</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisResult.issues
                        .sort((a, b) => {
                          const severityOrder = { high: 3, medium: 2, low: 1 }
                          return severityOrder[b.severity] - severityOrder[a.severity]
                        })
                        .map((issue, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(issue.severity)}
                                <h3 className="font-medium">{issue.title}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(issue.severity)}
                                <Badge variant="outline">{getCategoryName(issue.category)}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                              <p className="text-sm font-medium text-blue-800">💡 解決方法</p>
                              <p className="text-sm text-blue-700">{issue.solution}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              {Object.entries(analysisResult.categories).map(([key, category]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(key)}
                      {getCategoryName(key)}
                      <div className={`ml-auto text-2xl font-bold ${getScoreColor(category.score)}`}>
                        {category.score}点
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {key === "robots" && "robots.txt ファイルの設定状況"}
                      {key === "metadata" && "ページのメタ情報とSNS共有設定"}
                      {key === "sitemap" && "サイトマップの構造と内容"}
                      {key === "performance" && "ページの読み込み速度と最適化"}
                      {key === "indexing" && "検索エンジンのインデックス設定"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {category.issues.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>問題は見つかりませんでした</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {category.issues.map((issue, index) => (
                          <div key={index} className="border-l-4 border-gray-200 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(issue.severity)}
                              <span className="font-medium text-sm">{issue.title}</span>
                              {getSeverityBadge(issue.severity)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                            <p className="text-sm text-blue-600">💡 {issue.solution}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>改善提案</CardTitle>
                  <CardDescription>SEOスコア向上のための具体的なアクションプラン</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 追加の改善提案 */}
              <Card>
                <CardHeader>
                  <CardTitle>長期的な改善戦略</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">コンテンツ最適化</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 定期的なブログ記事の投稿</li>
                        <li>• キーワードリサーチの実施</li>
                        <li>• ユーザーの検索意図に合わせたコンテンツ作成</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">技術的改善</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• ページ速度の継続的な監視</li>
                        <li>• モバイルファーストインデックス対応</li>
                        <li>• Core Web Vitalsの最適化</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
