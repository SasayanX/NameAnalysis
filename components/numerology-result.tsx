"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NumerologyResult } from "@/lib/numerology"
import { Calculator, Heart, Eye, Users, Star, Calendar } from "lucide-react"

interface NumerologyResultProps {
  result: NumerologyResult
  name: string
  isPremium: boolean
  premiumLevel: number // 0: 無料, 1: ベーシック, 3: プレミアム
}

export function NumerologyResultComponent({ result, name, isPremium, premiumLevel }: NumerologyResultProps) {
  const numbers = [
    {
      title: "ライフパス数（運命数）",
      number: result.lifePathNumber,
      description: "人生のテーマや方向性",
      interpretation: result.interpretations.lifePath,
      icon: Star,
      color: "bg-purple-100 text-purple-800",
      available: true, // 無料プランでも利用可能
    },
    {
      title: "ディスティニー数（使命数）",
      number: result.destinyNumber,
      description: "社会的役割や使命",
      interpretation: result.interpretations.destiny,
      icon: Calculator,
      color: "bg-blue-100 text-blue-800",
      available: premiumLevel >= 1, // ベーシック以上
    },
    {
      title: "ソウル数（ハート数）",
      number: result.soulNumber,
      description: "内面的な欲求や本質",
      interpretation: result.interpretations.soul,
      icon: Heart,
      color: "bg-red-100 text-red-800",
      available: premiumLevel >= 1, // ベーシック以上
    },
    {
      title: "パーソナリティ数",
      number: result.personalityNumber,
      description: "外面的な印象や第一印象",
      interpretation: result.interpretations.personality,
      icon: Eye,
      color: "bg-green-100 text-green-800",
      available: premiumLevel >= 1, // ベーシック以上
    },
    {
      title: "マチュリティ数",
      number: result.maturityNumber,
      description: "成熟期の特徴",
      interpretation: result.interpretations.maturity,
      icon: Users,
      color: "bg-amber-100 text-amber-800",
      available: premiumLevel >= 1, // ベーシック以上
    },
    {
      title: "バースデー数",
      number: result.birthdayNumber,
      description: "生まれ持った得意分野",
      interpretation: result.interpretations.birthday,
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-800",
      available: premiumLevel >= 1, // ベーシック以上
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {name}さんの数秘術分析（6つのマストナンバー）
          </CardTitle>
          <CardDescription>
            数秘術は名前と生年月日から、あなたの本質と人生の方向性を読み解く古代からの叡智です
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {numbers.map((item, index) => {
          const Icon = item.icon

          if (!item.available) {
            return (
              <Card key={index} className="opacity-60 bg-gray-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <CardTitle className="text-lg text-gray-500">{item.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {premiumLevel === 0 ? "ベーシック限定" : "プレミアム限定"}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-gray-300 mb-2">?</div>
                    <p className="text-sm text-gray-500">
                      {premiumLevel === 0
                        ? "ベーシックプラン以上で6つのマストナンバーすべてをご利用いただけます"
                        : "プレミアムプランで全ての数秘術分析をご利用いただけます"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <Badge className={item.color}>{item.number}</Badge>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-800 mb-2">{item.number}</div>
                    {(item.number === 11 || item.number === 22 || item.number === 33) && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                        マスターナンバー
                      </Badge>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{item.interpretation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {premiumLevel === 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-amber-800">数秘術の全機能を解放</h3>
              <p className="text-amber-700">
                ベーシックプラン以上で、6つのマストナンバーすべてを詳細に分析できます。
                あなたの使命、内面の欲求、外面的印象、成熟期の特徴、生まれ持った才能まで完全解析！
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-200 mt-4">
                <h4 className="font-bold text-amber-800 mb-2">6つのマストナンバー</h4>
                <ul className="text-left text-sm space-y-1">
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> ライフパス数：人生のテーマ（無料）
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> ディスティニー数：社会的使命（有料）
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> ソウル数：内面的欲求（有料）
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> パーソナリティ数：外面的印象（有料）
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> マチュリティ数：成熟期の特徴（有料）
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span> バースデー数：生まれ持った才能（有料）
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Badge className="bg-amber-600 text-white px-4 py-2">ベーシックプラン 220円/月〜</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
