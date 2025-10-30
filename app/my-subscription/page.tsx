import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionStatusCard } from "@/components/subscription-status-card"
import { CreditCard, Calendar, Download } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "マイページ | 姓名判断アプリ",
  description: "サブスクリプション状況と利用履歴を確認できます",
}

export default function MySubscriptionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">マイページ</h1>
          <p className="text-gray-600">サブスクリプション状況と利用履歴を確認できます</p>
        </div>

        <SubscriptionStatusCard />

        {/* 利用履歴 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              最近の利用履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">田中太郎の姓名判断</div>
                  <div className="text-sm text-gray-500">2024年1月15日 14:30</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">相性診断（田中太郎 × 佐藤花子）</div>
                  <div className="text-sm text-gray-500">2024年1月14日 16:45</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">運勢カレンダー表示</div>
                  <div className="text-sm text-gray-500">2024年1月13日 09:15</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              履歴をダウンロード
            </Button>
          </CardContent>
        </Card>

        {/* 決済履歴 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              決済履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">プレミアムプラン（月額）</div>
                  <div className="text-sm text-gray-500">2024年1月1日</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">¥550</div>
                  <Badge className="bg-green-100 text-green-800">完了</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">プレミアムプラン（月額）</div>
                  <div className="text-sm text-gray-500">2023年12月1日</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">¥550</div>
                  <Badge className="bg-green-100 text-green-800">完了</Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              領収書をダウンロード
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
