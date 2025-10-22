import { PayoutInfo } from "@/components/payout-info"

export default function PayoutInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">入金サイクルについて</h1>
        <PayoutInfo />
      </div>
    </div>
  )
}
