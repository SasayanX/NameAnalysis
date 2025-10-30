"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Trophy, Star, Crown } from "lucide-react"

export default function PlanComparisonTable() {
  const features = [
    {
      category: "基本機能",
      items: [
        {
          name: "個人名判断",
          free: "1日1回",
          basic: "1日10回",
          premium: "無制限",
        },
        {
          name: "会社名判断",
          free: "1日1回",
          basic: "1日10回",
          premium: "無制限",
        },
        {
          name: "基本運勢分析",
          free: true,
          basic: true,
          premium: true,
        },
        {
          name: "五行バランス表示",
          free: true,
          basic: true,
          premium: true,
        },
      ],
    },
    {
      category: "高度な分析機能",
      items: [
        {
          name: "相性診断",
          free: false,
          basic: "1日3回",
          premium: "無制限",
        },
        {
          name: "数秘術分析",
          free: false,
          basic: "1日5回",
          premium: "無制限",
        },
        {
          name: "運勢フロー分析",
          free: false,
          basic: "1日5回",
          premium: "無制限",
        },
        {
          name: "赤ちゃん名付け支援",
          free: false,
          basic: "1日5回",
          premium: "無制限",
        },
      ],
    },
    {
      category: "🏆 プレミアム限定機能",
      highlight: true,
      items: [
        {
          name: "おなまえ格付けランク（S・A・B・C・D評価）",
          free: false,
          basic: false,
          premium: true,
          icon: <Trophy className="h-4 w-4 text-purple-600" />,
        },
        {
          name: "全国ランキング比較",
          free: false,
          basic: false,
          premium: true,
          icon: <Crown className="h-4 w-4 text-purple-600" />,
        },
        {
          name: "運勢の強さ・バランス・希少性総合判定",
          free: false,
          basic: false,
          premium: true,
          icon: <Star className="h-4 w-4 text-purple-600" />,
        },
      ],
    },
    {
      category: "データ管理",
      items: [
        {
          name: "PDF出力",
          free: false,
          basic: "1日10回",
          premium: "無制限",
        },
        {
          name: "履歴保存",
          free: false,
          basic: "50件まで",
          premium: "無制限",
        },
        {
          name: "データエクスポート",
          free: false,
          basic: true,
          premium: true,
        },
      ],
    },
    {
      category: "サポート",
      items: [
        {
          name: "基本サポート",
          free: true,
          basic: true,
          premium: true,
        },
        {
          name: "優先サポート",
          free: false,
          basic: false,
          premium: true,
        },
        {
          name: "カスタムレポート",
          free: false,
          basic: false,
          premium: true,
        },
      ],
    },
  ]

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-500 mx-auto" />
      )
    }
    return <span className="text-sm font-medium">{value}</span>
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">機能比較表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">機能</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">無料プラン</span>
                      <span className="text-sm text-gray-500">¥0</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">ベーシック</span>
                      <span className="text-sm text-gray-500">¥330/月</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold">プレミアム</span>
                      </div>
                      <span className="text-sm text-gray-500">¥550/月</span>
                      <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800">
                        おすすめ
                      </Badge>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr>
                      <td
                        colSpan={4}
                        className={`py-3 px-4 font-semibold text-sm uppercase tracking-wide ${
                          category.highlight
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className={item.icon ? "font-medium text-purple-900" : ""}>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{renderFeatureValue(item.free)}</td>
                        <td className="py-3 px-4 text-center">{renderFeatureValue(item.basic)}</td>
                        <td className={`py-3 px-4 text-center ${category.highlight ? "bg-purple-50" : ""}`}>
                          {renderFeatureValue(item.premium)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
