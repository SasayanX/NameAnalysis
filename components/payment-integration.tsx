import { SquarePaymentButton } from "./square-payment-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function PaymentIntegration() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Basic Plan */}
      <Card className="relative border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ベーシックプラン</CardTitle>
          <div className="text-3xl font-bold text-blue-600">¥330</div>
          <p className="text-sm text-muted-foreground">月額（税込）</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">詳細な姓名判断</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">六星占術による運勢</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">広告なし</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">毎日の運勢</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <SquarePaymentButton plan="basic" />
          </div>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className="relative border-2 border-purple-200">
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">おすすめ</Badge>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">プレミアムプラン</CardTitle>
          <div className="text-3xl font-bold text-purple-600">¥550</div>
          <p className="text-sm text-muted-foreground">月額（税込）</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">ベーシックプランの全機能</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">運気運行表</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">相性診断</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">優先サポート</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">無制限利用</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <SquarePaymentButton plan="premium" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
