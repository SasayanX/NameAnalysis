import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Lock, Star, Crown, Zap, FileText, Users, Baby, Sparkles, Trophy, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "プラン別機能一覧 | まいにちAI姓名判断",
  description: "無料プラン、ベーシックプラン、プレミアムプランの詳細な機能比較と制限事項をご確認いただけます。",
}

interface Feature {
  name: string
  icon: React.ReactNode
  description: string
  free: string | boolean
  basic: string | boolean
  premium: string | boolean
  category: string
}

const features: Feature[] = [
  // 基本機能
  {
    name: "かんたん鑑定",
    icon: <Star className="h-5 w-5" />,
    description: "基本的な姓名判断結果（総格、運勢判定）",
    free: true,
    basic: true,
    premium: true,
    category: "基本機能",
  },
  {
    name: "詳細鑑定",
    icon: <FileText className="h-5 w-5" />,
    description: "天格・人格・地格・外格・総格の詳細分析",
    free: "プレビュー版（数値のみ）",
    basic: "完全版",
    premium: "完全版 + 改善アドバイス",
    category: "基本機能",
  },
  {
    name: "総合分析",
    icon: <Sparkles className="h-5 w-5" />,
    description: "六星占術・五行分析を含む高度な分析",
    free: "基本情報のみ",
    basic: "詳細分析",
    premium: "超詳細分析 + 予測",
    category: "基本機能",
  },
  {
    name: "個人名判断",
    icon: <Users className="h-5 w-5" />,
    description: "個人の姓名による運勢分析",
    free: "1日1回",
    basic: "無制限",
    premium: "無制限",
    category: "基本機能",
  },
  {
    name: "会社名判断",
    icon: <Zap className="h-5 w-5" />,
    description: "会社名・商品名の運勢分析",
    free: "1日1回",
    basic: "無制限",
    premium: "無制限",
    category: "基本機能",
  },
  
  // 高度な機能
  {
    name: "相性診断",
    icon: <Users className="h-5 w-5" />,
    description: "パートナーとの相性を分析",
    free: false,
    basic: "1日5回",
    premium: "無制限",
    category: "高度な機能",
  },
  {
    name: "数秘術分析",
    icon: <Sparkles className="h-5 w-5" />,
    description: "数字による運命分析",
    free: false,
    basic: "1日5回",
    premium: "無制限",
    category: "高度な機能",
  },
  {
    name: "赤ちゃん名付け",
    icon: <Baby className="h-5 w-5" />,
    description: "最適な名前候補のご提案",
    free: false,
    basic: "1日5回",
    premium: "無制限",
    category: "高度な機能",
  },
  {
    name: "運気運行表",
    icon: <Calendar className="h-5 w-5" />,
    description: "年間の運気の流れをカレンダー表示",
    free: false,
    basic: false,
    premium: true,
    category: "高度な機能",
  },
  
  // プレミアム限定機能
  {
    name: "おなまえ格付けランク",
    icon: <Trophy className="h-5 w-5" />,
    description: "名前の総合評価（SSS・SS・S・A・B・C・D）",
    free: false,
    basic: false,
    premium: true,
    category: "プレミアム限定",
  },
  {
    name: "全国ランキング",
    icon: <Trophy className="h-5 w-5" />,
    description: "全国規模での名前の格付け比較",
    free: false,
    basic: false,
    premium: true,
    category: "プレミアム限定",
  },
  
  // 出力・保存機能
  {
    name: "PDF出力",
    icon: <Download className="h-5 w-5" />,
    description: "分析結果をPDFでダウンロード",
    free: false,
    basic: "1日5回",
    premium: "無制限",
    category: "出力・保存",
  },
  {
    name: "履歴保存",
    icon: <FileText className="h-5 w-5" />,
    description: "過去の分析結果を保存",
    free: "10件まで",
    basic: "50件まで",
    premium: "無制限",
    category: "出力・保存",
  },
  // データエクスポート機能は現在実装されていません（将来の機能として予定）
  // {
  //   name: "データエクスポート",
  //   icon: <Download className="h-5 w-5" />,
  //   description: "分析データをCSV/JSON形式でエクスポート",
  //   free: false,
  //   basic: true,
  //   premium: true,
  //   category: "出力・保存",
  // },
]

const plans = {
  free: {
    name: "無料プラン",
    price: 0,
    description: "まずはお試しで基本機能を体験",
    color: "gray",
  },
  basic: {
    name: "ベーシックプラン",
    price: 330,
    description: "日常的に姓名判断を活用したい方に",
    color: "blue",
  },
  premium: {
    name: "プレミアムプラン",
    price: 550,
    description: "全機能を無制限で利用したいプロフェッショナル向け",
    color: "purple",
  },
}

function renderFeatureValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <div className="flex items-center justify-center">
        <Check className="h-5 w-5 text-green-600" />
        <span className="ml-2 text-sm text-green-700">利用可能</span>
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <X className="h-5 w-5 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">利用不可</span>
      </div>
    )
  }
  
  if (typeof value === "string" && value.includes("プレビュー") || value.includes("基本情報")) {
    return (
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          <Lock className="h-3 w-3 mr-1" />
          {value}
        </Badge>
      </div>
    )
  }
  
  return (
    <div className="text-center">
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function PlanFeaturesPage() {
  const categories = Array.from(new Set(features.map(f => f.category)))
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">プラン別機能一覧</h1>
          <p className="text-xl text-gray-600 mb-6">
            各プランで利用できる機能を詳細に比較できます
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/pricing">料金プランを見る</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs/plan-features-spec">開発者向け仕様</Link>
            </Button>
          </div>
        </div>

        {/* プラン概要カード */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <Card key={key} className={key === "premium" ? "border-purple-300 border-2" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {key === "premium" && (
                    <Badge className="bg-purple-600">おすすめ</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ¥{plan.price.toLocaleString()}
                  {plan.price > 0 && <span className="text-lg text-gray-500">/月</span>}
                </div>
                {key !== "free" && (
                  <Button 
                    className="w-full" 
                    variant={key === "premium" ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/subscribe?plan=${key}&billing=monthly`}>
                      このプランを選ぶ
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 機能一覧（カテゴリ別） */}
        {categories.map((category) => {
          const categoryFeatures = features.filter(f => f.category === category)
          
          return (
            <Card key={category} className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {category === "プレミアム限定" && <Crown className="h-6 w-6 text-purple-600" />}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4 font-semibold min-w-[200px]">機能名</th>
                        <th className="text-center py-4 px-4 min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">無料プラン</span>
                            <span className="text-xs text-gray-500">¥0</span>
                          </div>
                        </th>
                        <th className="text-center py-4 px-4 min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">ベーシック</span>
                            <span className="text-xs text-gray-500">¥330/月</span>
                          </div>
                        </th>
                        <th className="text-center py-4 px-4 min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">プレミアム</span>
                            <span className="text-xs text-gray-500">¥550/月</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryFeatures.map((feature, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="text-gray-600">{feature.icon}</div>
                              <div>
                                <div className="font-medium">{feature.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {feature.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.free)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.basic)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.premium)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* 注意事項 */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg">重要な注意事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              • <strong>使用回数</strong>: 各機能の使用回数は1日単位でリセットされます（日本時間 0:00）
            </p>
            <p>
              • <strong>詳細鑑定（無料プラン）</strong>: 基本的な数値と情報のみ表示されます。詳細な解説やアドバイスは有料プランでご利用いただけます
            </p>
            <p>
              • <strong>プラン変更</strong>: いつでもプランを変更・解約できます。変更は即座に反映されます
            </p>
            <p>
              • <strong>返金ポリシー</strong>: プラン変更・解約については
              <Link href="/legal/tokusho" className="text-blue-600 underline ml-1">
                特定商取引法に基づく表記
              </Link>
              をご確認ください
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">最適なプランを見つけましょう</h2>
              <p className="mb-6 opacity-90">
                無料で始めて、必要に応じてアップグレードできます
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/pricing">料金プランを詳しく見る</Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
                  <Link href="/">無料で始める</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

