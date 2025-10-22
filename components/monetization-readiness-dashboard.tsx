"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, DollarSign, CreditCard, FileText, Users, Zap } from "lucide-react"

export default function MonetizationReadinessDashboard() {
  const readinessItems = [
    {
      category: "技術的準備",
      icon: <Zap className="h-5 w-5" />,
      items: [
        { name: "Square決済システム", status: "完了", progress: 100 },
        { name: "Webhook処理", status: "完了", progress: 100 },
        { name: "プラン管理システム", status: "完了", progress: 100 },
        { name: "使用制限システム", status: "完了", progress: 100 },
        { name: "サブスクリプション管理", status: "完了", progress: 100 },
      ],
    },
    {
      category: "法的準備",
      icon: <FileText className="h-5 w-5" />,
      items: [
        { name: "特定商取引法表記", status: "完了", progress: 100 },
        { name: "利用規約", status: "完了", progress: 100 },
        { name: "プライバシーポリシー", status: "完了", progress: 100 },
        { name: "返金ポリシー", status: "完了", progress: 100 },
      ],
    },
    {
      category: "ビジネス準備",
      icon: <DollarSign className="h-5 w-5" />,
      items: [
        { name: "料金設定", status: "完了", progress: 100 },
        { name: "プラン設計", status: "完了", progress: 100 },
        { name: "価値提案", status: "完了", progress: 100 },
        { name: "競合分析", status: "完了", progress: 100 },
      ],
    },
    {
      category: "決済プロバイダー",
      icon: <CreditCard className="h-5 w-5" />,
      items: [
        { name: "Square審査", status: "待機中", progress: 0 },
        { name: "本番環境設定", status: "待機中", progress: 0 },
        { name: "テスト決済", status: "Sandbox完了", progress: 50 },
        { name: "本番決済", status: "待機中", progress: 0 },
      ],
    },
    {
      category: "マーケティング",
      icon: <Users className="h-5 w-5" />,
      items: [
        { name: "SEO記事", status: "進行中", progress: 80 },
        { name: "サイトマップ", status: "修正中", progress: 90 },
        { name: "ユーザー獲得戦略", status: "完了", progress: 100 },
        { name: "コンテンツ戦略", status: "完了", progress: 100 },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "完了":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "進行中":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "修正中":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "待機中":
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "完了":
        return <Badge className="bg-green-100 text-green-800">完了</Badge>
      case "進行中":
        return <Badge className="bg-yellow-100 text-yellow-800">進行中</Badge>
      case "修正中":
        return <Badge className="bg-blue-100 text-blue-800">修正中</Badge>
      case "待機中":
        return <Badge className="bg-gray-100 text-gray-600">待機中</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600">未着手</Badge>
    }
  }

  const overallProgress = Math.round(
    readinessItems.reduce((acc, category) => {
      const categoryProgress = category.items.reduce((sum, item) => sum + item.progress, 0) / category.items.length
      return acc + categoryProgress
    }, 0) / readinessItems.length,
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">課金実装準備状況</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-4xl font-bold text-blue-600">{overallProgress}%</div>
          <div className="text-lg text-gray-600">準備完了</div>
        </div>
        <Progress value={overallProgress} className="w-full max-w-md mx-auto" />
      </div>

      {/* 実装開始タイミング */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <DollarSign className="h-6 w-6" />
            課金実装開始タイミング
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">✅ 今すぐ可能（Sandbox）</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  テスト環境での課金機能
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  全システム動作確認済み
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  法的準備完了
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-blue-700">🎯 本格運用開始</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Square審査通過後（1-2週間）
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  本番環境設定完了後
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  最終テスト完了後
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリー別準備状況 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {readinessItems.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 次のアクション */}
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">次に必要なアクション</CardTitle>
          <CardDescription>課金実装開始のための具体的なステップ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🚀 即座に実行可能</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Square審査申請
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  サイトマップ最終修正
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  最終記事作成
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">⏳ 審査通過後</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  本番環境設定
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  本番決済テスト
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  課金機能リリース
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 収益予測 */}
      <Card>
        <CardHeader>
          <CardTitle>収益予測（Square単体）</CardTitle>
          <CardDescription>現実的な収益シミュレーション</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">保守的</div>
              <div className="text-lg">月7,500円</div>
              <div className="text-sm text-gray-500">手取り7,256円</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-600">現実的</div>
              <div className="text-lg">月20,000円</div>
              <div className="text-sm text-blue-500">手取り19,350円</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">楽観的</div>
              <div className="text-lg">月50,000円</div>
              <div className="text-sm text-green-500">手取り48,375円</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
