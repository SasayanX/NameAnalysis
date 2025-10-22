import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Clock, Info } from "lucide-react"

export function PayoutInfo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Stripe入金サイクルについて
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">週1回入金（推奨）</h3>
                  <p className="text-sm text-gray-600">毎週金曜日に振り込み</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">入金タイミング</h3>
                  <p className="text-sm text-gray-600">決済から2-7営業日後</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">振込手数料</h3>
                  <p className="text-sm text-gray-600">無料（Stripeが負担）</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">最小入金額</h3>
                  <p className="text-sm text-gray-600">1円から入金可能</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">新規事業者へのアドバイス</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 最初は「週1回入金」を選択することをお勧めします</li>
              <li>• 取引実績が積み重なると「毎日入金」に変更可能</li>
              <li>• 入金サイクルは後から変更できます</li>
              <li>• 振込手数料は無料です</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
