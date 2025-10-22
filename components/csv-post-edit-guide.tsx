"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Upload, TestTube, Play, AlertTriangle, FileText } from "lucide-react"

export function CsvPostEditGuide() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
    if (step < 5) {
      setCurrentStep(step + 1)
    }
  }

  const steps = [
    {
      id: 1,
      title: "CSVファイルの準備確認",
      description: "編集したCSVファイルが正しい形式になっているか確認",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSVファイルの形式を確認してください：</strong>
              <br />• UTF-8エンコード
              <br />• カンマ区切り
              <br />• 漢字,画数 または 画数,漢字 の形式
              <br />• ヘッダー行があってもOK
            </AlertDescription>
          </Alert>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">正しいCSV例：</h4>
            <pre className="text-sm">
              {`漢字,画数
翔,12
陽,12
愛,13
心,4
結,12`}
            </pre>
          </div>
          <Button onClick={() => markStepComplete(1)} className="w-full">
            ✅ CSVファイルの形式を確認しました
          </Button>
        </div>
      ),
    },
    {
      id: 2,
      title: "CSVインポート実行",
      description: "編集したCSVファイルをシステムにインポート",
      icon: <Upload className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>インポート手順：</strong>
              <br />
              1. 「画数別吉凶一覧」ページに移動
              <br />
              2. 「CSVインポート」タブを選択
              <br />
              3. 「CSVファイルを選択」で編集済みファイルを選択
              <br />
              4. プレビューを確認
              <br />
              5. 「TypeScriptファイルとしてエクスポート」をクリック
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/stroke-fortune-list" target="_blank" rel="noreferrer">
                📊 画数別吉凶一覧を開く
              </a>
            </Button>
            <Button onClick={() => markStepComplete(2)}>✅ インポート完了</Button>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "データ反映確認",
      description: "インポートしたデータが正しく反映されているか確認",
      icon: <TestTube className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>確認方法：</strong>
              <br />
              1. 「漢字データ編集」タブで新しい漢字が表示されているか確認
              <br />
              2. いくつかの漢字をランダムに選んで画数が正しいか確認
              <br />
              3. 「保存」ボタンを押してデータを永続化
            </AlertDescription>
          </Alert>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">重要な確認ポイント：</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>翔: 12画</li>
              <li>陽: 12画</li>
              <li>愛: 13画</li>
              <li>心: 4画</li>
              <li>結: 12画</li>
            </ul>
          </div>
          <Button onClick={() => markStepComplete(3)}>✅ データ反映を確認しました</Button>
        </div>
      ),
    },
    {
      id: 4,
      title: "名前分析テスト",
      description: "実際の名前で分析が正しく動作するかテスト",
      icon: <Play className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>テスト手順：</strong>
              <br />
              1. 名前分析ツールで人気の名前をテスト
              <br />
              2. 画数計算が正しいか確認
              <br />
              3. 運勢判定が適切に表示されるか確認
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-pink-50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">テスト用男の子名前：</h4>
              <ul className="text-sm space-y-1">
                <li>• 陽翔（はると）</li>
                <li>• 蒼空（そら）</li>
                <li>• 結翔（ゆいと）</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">テスト用女の子名前：</h4>
              <ul className="text-sm space-y-1">
                <li>• 心愛（ここあ）</li>
                <li>• 結愛（ゆあ）</li>
                <li>• 陽菜（ひな）</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/name-analyzer" target="_blank" rel="noreferrer">
                🔍 名前分析ツールを開く
              </a>
            </Button>
            <Button onClick={() => markStepComplete(4)}>✅ テスト完了</Button>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "本格運用開始",
      description: "すべて正常であることを確認して本格運用を開始",
      icon: <CheckCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 おめでとうございます！</strong>
              <br />
              すべてのステップが完了しました。赤ちゃん名付けツールが正確に動作するようになりました。
            </AlertDescription>
          </Alert>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">今後の運用について：</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>定期的にデータのバックアップを取る</li>
              <li>新しい人気名前が出たら随時追加</li>
              <li>ユーザーからの画数修正要望に対応</li>
              <li>年1回程度の包括的データ見直し</li>
            </ul>
          </div>
          <Button onClick={() => markStepComplete(5)} className="w-full bg-green-600 hover:bg-green-700">
            🚀 本格運用開始！
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            CSV編集後の導入手順ガイド
          </CardTitle>
          <CardDescription>編集したCSVファイルを正しくシステムに反映させるための完全ガイド</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 進捗表示 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">進捗状況</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.length} / {steps.length} 完了
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ステップ一覧 */}
          <div className="space-y-4">
            {steps.map((step) => (
              <Card
                key={step.id}
                className={`transition-all duration-200 ${
                  currentStep === step.id
                    ? "border-blue-500 shadow-md"
                    : completedSteps.includes(step.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          completedSteps.includes(step.id)
                            ? "bg-green-100 text-green-600"
                            : currentStep === step.id
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {completedSteps.includes(step.id) ? <CheckCircle className="h-5 w-5" /> : step.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          ステップ {step.id}: {step.title}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        completedSteps.includes(step.id) ? "default" : currentStep === step.id ? "secondary" : "outline"
                      }
                    >
                      {completedSteps.includes(step.id) ? "完了" : currentStep === step.id ? "実行中" : "待機中"}
                    </Badge>
                  </div>
                </CardHeader>
                {(currentStep === step.id || completedSteps.includes(step.id)) && (
                  <CardContent>{step.content}</CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* 完了メッセージ */}
          {completedSteps.length === steps.length && (
            <Card className="mt-6 border-green-500 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">🎉 すべて完了しました！</h3>
                  <p className="text-green-700 mb-4">
                    赤ちゃん名付けツールが正確に動作するようになりました。
                    <br />
                    安心してユーザーに提供できます。
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <a href="/name-analyzer">🔍 名前分析ツールを確認</a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/baby-naming-validation">📊 最終検証を実行</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
