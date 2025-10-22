"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Search, RefreshCw, ExternalLink } from "lucide-react"

export function WebhookTroubleshootingGuide() {
  const [currentStep, setCurrentStep] = useState(1)

  const troubleshootingSteps = [
    {
      title: "Webhooksページの確認",
      description: "正しいページにいるか確認します",
      content: (
        <div className="space-y-4">
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              左サイドバーで「Webhooks」が選択されているか確認してください。
              選択されている場合、背景色が変わっているはずです。
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">確認ポイント:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• URLに「webhooks」が含まれているか</li>
              <li>• ページタイトルが「Webhooks」になっているか</li>
              <li>• 既存のサンドボックスWebhookが表示されているか</li>
            </ul>
          </div>

          <Button onClick={() => setCurrentStep(2)} className="w-full">
            Webhooksページにいることを確認しました
          </Button>
        </div>
      ),
    },
    {
      title: "ページの更新",
      description: "ブラウザを更新してUIを再読み込みします",
      content: (
        <div className="space-y-4">
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>ブラウザの更新ボタン（F5キー）を押してページを再読み込みしてください。</AlertDescription>
          </Alert>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">更新後に探すもの:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 「Create Webhook」ボタン（通常は右上または中央）</li>
              <li>• 「Add Webhook」ボタン</li>
              <li>• 「New Webhook」ボタン</li>
              <li>• 「+」アイコンのボタン</li>
            </ul>
          </div>

          <Button onClick={() => setCurrentStep(3)} className="w-full">
            ページを更新しました
          </Button>
        </div>
      ),
    },
    {
      title: "Production環境の確認",
      description: "Production環境が選択されているか確認します",
      content: (
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>重要:</strong> ページ上部に「Sandbox」と「Production」のタブがある場合、
              「Production」タブが選択されているか確認してください。
            </AlertDescription>
          </Alert>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Production環境での表示:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 「Production」タブがアクティブ（青色）になっている</li>
              <li>• 既存のWebhookがない場合は空のリストが表示</li>
              <li>• 「Create Webhook」ボタンが表示される</li>
            </ul>
          </div>

          <Button onClick={() => setCurrentStep(4)} className="w-full">
            Production環境を確認しました
          </Button>
        </div>
      ),
    },
    {
      title: "代替方法：直接URL",
      description: "直接WebhookのURLにアクセスします",
      content: (
        <div className="space-y-4">
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>以下のURLに直接アクセスしてWebhook作成ページを開いてください。</AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">直接アクセスURL:</h4>
                <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                  https://developer.squareup.com/console/en/apps/sq0idp-CbbdF82IxFWDSqf8D2S0Pw/webhooks
                </div>
              </div>

              <Button
                onClick={() =>
                  window.open(
                    "https://developer.squareup.com/console/en/apps/sq0idp-CbbdF82IxFWDSqf8D2S0Pw/webhooks",
                    "_blank",
                  )
                }
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Webhook作成ページを開く
              </Button>
            </div>
          </div>

          <Button onClick={() => setCurrentStep(5)} className="w-full">
            Webhook作成ページにアクセスしました
          </Button>
        </div>
      ),
    },
    {
      title: "手動でWebhook作成",
      description: "Square Dashboardで手動作成します",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">手動作成手順:</h4>
            <ol className="text-sm text-purple-700 space-y-2 list-decimal list-inside">
              <li>Square Dashboard（seller.squareup.com）にログイン</li>
              <li>「Apps & integrations」→「Developer」セクション</li>
              <li>「Webhooks」または「API」設定</li>
              <li>「Add endpoint」または「Create webhook」</li>
              <li>URL: https://nameanalysis216.vercel.app/api/square-webhook</li>
              <li>Events: payment.updated, subscription.*</li>
            </ol>
          </div>

          <Button onClick={() => window.open("https://squareup.com/dashboard", "_blank")} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Square Dashboard を開く
          </Button>

          <Button onClick={() => setCurrentStep(6)} className="w-full">
            手動でWebhookを作成しました
          </Button>
        </div>
      ),
    },
    {
      title: "Signature Key取得",
      description: "作成されたWebhookの署名キーを取得します",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Webhook作成完了</h4>
                <p className="text-sm text-green-700">
                  Webhookが作成されました。Signature Keyを取得してマネタイズ機能を完成させましょう。
                </p>
              </div>
            </div>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>重要:</strong> Signature Keyは一度しか表示されません。 必ずコピーして保存してください。
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">次のステップ:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>作成されたWebhookの詳細ページを開く</li>
              <li>Signature Key（32文字）をコピー</li>
              <li>環境変数として設定</li>
              <li>Vercelで再デプロイ</li>
            </ol>
          </div>

          <Button onClick={() => window.open("/square-webhook-creation", "_blank")} className="w-full">
            Signature Key設定に進む
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Webhook作成トラブルシューティング
            <span className="text-sm font-normal text-gray-500">
              ステップ {currentStep} / {troubleshootingSteps.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {troubleshootingSteps.map((_, index) => (
                <div key={index} className="flex items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > index + 1 ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < troubleshootingSteps.length - 1 && (
                    <div className={`w-8 h-1 ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current step */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{troubleshootingSteps[currentStep - 1].title}</h3>
                <p className="text-gray-600">{troubleshootingSteps[currentStep - 1].description}</p>
              </div>
              {troubleshootingSteps[currentStep - 1].content}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 よくある問題</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Create Webhookボタンが見つからない場合:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Production環境が選択されているか確認</li>
                <li>• ブラウザのキャッシュをクリア</li>
                <li>• 別のブラウザで試す</li>
                <li>• Square Dashboardから直接作成</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
