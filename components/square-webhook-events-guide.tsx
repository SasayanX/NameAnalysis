"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SquareWebhookEventsGuide() {
  const { toast } = useToast()

  const requiredEvents = [
    {
      name: "payment.updated",
      description: "決済状況の変更（完了・失敗など）",
      importance: "必須",
      reason: "決済完了時にプラン有効化するため",
    },
    {
      name: "subscription.created",
      description: "サブスクリプション作成時",
      importance: "必須",
      reason: "定期課金開始の通知を受け取るため",
    },
    {
      name: "subscription.updated",
      description: "サブスクリプション更新時",
      importance: "必須",
      reason: "プラン変更・更新の通知を受け取るため",
    },
    {
      name: "subscription.canceled",
      description: "サブスクリプションキャンセル時",
      importance: "必須",
      reason: "解約時にプラン無効化するため",
    },
  ]

  const copyEventName = (eventName: string) => {
    navigator.clipboard.writeText(eventName)
    toast({
      title: "コピーしました",
      description: `${eventName} をクリップボードにコピーしました`,
    })
  }

  const copyAllEvents = () => {
    const allEvents = requiredEvents.map((event) => event.name).join("\n")
    navigator.clipboard.writeText(allEvents)
    toast({
      title: "全イベントをコピーしました",
      description: "4つのイベント名をクリップボードにコピーしました",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Square Webhook - 選択すべき4つのイベント
            <Button variant="outline" size="sm" onClick={copyAllEvents}>
              <Copy className="h-4 w-4 mr-2" />
              全てコピー
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">重要: 正確に4つ選択してください</h4>
                  <p className="text-sm text-red-700 mt-1">
                    以下の4つのイベントを正確に選択しないと、決済・サブスクリプション機能が正常に動作しません。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {requiredEvents.map((event, index) => (
                <Card key={event.name} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{event.name}</code>
                          <Badge variant="destructive" className="text-xs">
                            {event.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                        <p className="text-xs text-gray-500">{event.reason}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyEventName(event.name)} className="ml-2">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">選択手順:</h4>
                  <ol className="text-sm text-green-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Square Dashboard の Webhook作成画面で「Events」セクションを探す</li>
                    <li>検索ボックスに上記のイベント名を1つずつ入力</li>
                    <li>表示されたイベントにチェックを入れる</li>
                    <li>4つ全て選択されていることを確認</li>
                    <li>「Create Webhook」をクリック</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">注意事項:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• イベント名は大文字小文字を正確に入力してください</li>
                <li>• ピリオド（.）も含めて正確に入力してください</li>
                <li>• 4つ以外のイベントは選択不要です</li>
                <li>• 1つでも漏れると機能しません</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800 text-sm">各イベントの動作確認</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">payment.updated:</span>
                <p className="text-gray-600">決済完了時にプラン有効化</p>
              </div>
              <div>
                <span className="font-medium">subscription.created:</span>
                <p className="text-gray-600">定期課金開始の記録</p>
              </div>
              <div>
                <span className="font-medium">subscription.updated:</span>
                <p className="text-gray-600">プラン変更の反映</p>
              </div>
              <div>
                <span className="font-medium">subscription.canceled:</span>
                <p className="text-gray-600">解約時のプラン無効化</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
