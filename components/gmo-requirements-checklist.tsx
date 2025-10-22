"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, FileText, Clock, CreditCard } from "lucide-react"
import { GMO_INDIVIDUAL_REQUIREMENTS, GMO_審査基準, GMO_審査期間, GMO_手数料体系 } from "@/lib/gmo-requirements-guide"

export function GMORequirementsChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const handleCheck = (item: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [item]: checked }))
  }

  const requiredItems = GMO_INDIVIDUAL_REQUIREMENTS.filter((item) => item.required)
  const completedRequired = requiredItems.filter((item) => checkedItems[item.documentType]).length
  const isReady = completedRequired === requiredItems.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 進捗状況 */}
      <Card className={`border-2 ${isReady ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isReady ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            GMO審査準備状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">
              必須書類: {completedRequired}/{requiredItems.length}
            </span>
            <Badge variant={isReady ? "default" : "secondary"} className={isReady ? "bg-green-600" : "bg-orange-600"}>
              {isReady ? "申請可能" : "準備中"}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${isReady ? "bg-green-600" : "bg-orange-600"}`}
              style={{ width: `${(completedRequired / requiredItems.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 必要書類チェックリスト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            必要書類チェックリスト
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {GMO_INDIVIDUAL_REQUIREMENTS.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={item.documentType}
                checked={checkedItems[item.documentType] || false}
                onCheckedChange={(checked) => handleCheck(item.documentType, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label htmlFor={item.documentType} className="font-medium cursor-pointer">
                    {item.documentType}
                  </label>
                  {item.required && (
                    <Badge variant="destructive" className="text-xs">
                      必須
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                {item.notes && <p className="text-xs text-blue-600 mt-1">💡 {item.notes}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 開業届の重要性 */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">⚠️ 開業届が必須な理由</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-red-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">法的要件</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>個人事業主としての正式な証明</li>
                <li>税務署への事業開始届出</li>
                <li>事業の継続性・信頼性の証明</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">GMO審査基準</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>事業実態の確認</li>
                <li>反社チェック・信用調査</li>
                <li>リスク評価・継続性判断</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 審査基準 */}
      <Card>
        <CardHeader>
          <CardTitle>GMO審査基準</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(GMO_審査基準).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-1">{key}</h3>
                <p className="text-sm text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 審査期間・手数料 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              審査期間
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(GMO_審査期間).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              手数料体系
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">初期費用:</span>
              <span className="font-medium text-green-600">{GMO_手数料体系.初期費用}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">月額基本料:</span>
              <span className="font-medium text-green-600">{GMO_手数料体系.月額基本料}</span>
            </div>
            <div className="border-t pt-2">
              <p className="text-sm text-gray-600 mb-1">決済手数料:</p>
              {Object.entries(GMO_手数料体系.決済手数料).map(([card, rate]) => (
                <div key={card} className="flex justify-between text-sm">
                  <span className="text-gray-600">{card.replace("_", "/")}:</span>
                  <span className="font-medium">{rate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-4">
        <Button className="flex-1" disabled={!isReady} onClick={() => window.open("https://www.gmo-pg.com/", "_blank")}>
          {isReady ? "GMO審査申請へ" : "書類準備中..."}
        </Button>
        <Button variant="outline" onClick={() => window.open("/legal/tokusho", "_blank")}>
          特商法ページ確認
        </Button>
      </div>
    </div>
  )
}
