import PaymentStatusChecker from "@/components/payment-status-checker"

export default function PaymentStatusPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">決済状況確認</h1>
        <p className="text-gray-600 mt-2">購読状況とプラン情報の確認</p>
      </div>

      <PaymentStatusChecker />
    </div>
  )
}
