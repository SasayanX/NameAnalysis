import SquareTestPayment from "@/components/square-test-payment"

export default function PaymentTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Square決済テスト</h1>
        <p className="text-gray-600 mt-2">Webhook動作確認とプラン有効化テスト</p>
      </div>

      <SquareTestPayment />
    </div>
  )
}
