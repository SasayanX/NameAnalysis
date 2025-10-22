"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Search, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function SquareWebhookEventsCorrected() {
  const { toast } = useToast()

  const correctEvents = [
    {
      name: "payment.updated",
      description: "決済状況の変更（完了・失敗など）",
      importance: "必須",
      reason: "決済完了時にプラン有効化するため",
      searchTerm: "payment",
      status: "確認済み",
    },
    {
      name: "subscription.created",
      description: "サブスクリプション作成時",
      importance: "必須",
      reason: "定期課金開始の通知を受け取るため",
      searchTerm: "subscription",
      status: "画像で確認済み",
    },
    {
      name: "subscription.updated",
      description: "サブスクリプション更新時",
      importance: "必須",
      reason: "プラン変更・更新の通知を受け取るため",
      searchTerm: "subscription",
      status: "画像で確認済み",
    },
    {
      name: "invoice.payment_made",
      description: "請求書の支払い完了時",
      importance: "推奨",
      reason: "サブスクリプション決済完了の通知",
      searchTerm: "invoice",
      status: "画像で確認済み",
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
    const allEvents = correctEvents.map((event) => event.name).join("\n")
    navigator.clipboard.writeText(allEvents)
    toast({
      title: "4つのイベントをコピーしました",
      description: "実際に存在するイベント名をクリップボードにコピーしました",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Square Dashboard画像から確認: 実際に存在するイベント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-2">Subscription Events (確認済み)</h4>
              <Image
                src="/images/square-webhook-subscription-events.png"
                alt="Square webhook subscription events"
                width={400}
                height={300}
                className="border rounded"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Invoice Events (確認済み)</h4>
              <Image
                src="/images/square-webhook-invoice-events.png"
                alt="Square webhook invoice events"
                width={400}
                height={300}
                className="border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            実際に選択すべき4つのイベント
            <Button variant="outline" size="sm" onClick={copyAllEvents}>
              <Copy className="h-4 w-4 mr-2" />
              全てコピー
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">画像から確認された実際のイベント名</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    あなたのSquare Dashboardのスクリーンショットから、実際に存在するイベントを確認しました。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {correctEvents.map((event, index) => (
                <Card key={event.name} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{event.name}</code>
                          <Badge
                            variant={event.importance === "必須" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {event.importance}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                        <p className="text-xs text-gray-500 mb-2">{event.reason}</p>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <Search className="h-3 w-3" />
                          <span>検索キーワード: "{event.searchTerm}"</span>
                        </div>
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
              <h4 className="font-medium text-green-800 mb-3">Square Dashboardでの選択手順:</h4>
              <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside">
                <li>
                  <strong>"payment"</strong> と検索 → <code>payment.updated</code> を選択
                </li>
                <li>
                  <strong>"subscription"</strong> と検索 → <code>subscription.created</code> と{" "}
                  <code>subscription.updated</code> を選択
                </li>
                <li>
                  <strong>"invoice"</strong> と検索 → <code>invoice.payment_made</code> を選択
                </li>
                <li>合計4つのイベントが選択されていることを確認</li>
                <li>「Save」をクリックしてWebhookを作成</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">重要な注意点:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 画像で確認済みのイベント名を正確に入力してください</li>
                <li>
                  • <code>subscription.canceled</code> や <code>subscription.deactivated</code> は存在しません
                </li>
                <li>
                  • <code>invoice.payment_made</code> がサブスクリプション決済完了の通知に使用されます
                </li>
                <li>• 4つ全て選択されていることを必ず確認してください</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">現在の選択状況（画像から確認）:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">✅ subscription.created</span>
                  <p className="text-gray-600">既に選択済み</p>
                </div>
                <div>
                  <span className="text-green-600">✅ subscription.updated</span>
                  <p className="text-gray-600">既に選択済み</p>
                </div>
                <div>
                  <span className="text-orange-600">⏳ payment.updated</span>
                  <p className="text-gray-600">追加で選択が必要</p>
                </div>
                <div>
                  <span className="text-orange-600">⏳ invoice.payment_made</span>
                  <p className="text-gray-600">追加で選択が必要</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
