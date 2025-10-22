import { SquarePaymentForm } from "@/components/square-payment-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プラン申し込み | 姓名判断アプリ",
  description: "ベーシックプランまたはプレミアムプランにお申し込みください",
}

export default function SubscribePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">プラン申し込み</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          あなたに最適なプランを選択して、より詳細な姓名判断をお楽しみください。
          安全な決済システムで、すぐにご利用いただけます。
        </p>
      </div>

      <SquarePaymentForm />
    </div>
  )
}
