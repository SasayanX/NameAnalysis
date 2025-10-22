import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Building } from "lucide-react"

export default function TokushoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">特定商取引法に基づく表記</h1>
        <p className="text-gray-600">
          特定商取引に関する法律第11条（通信販売）及び第12条（連鎖販売取引）の規定に基づき、以下の通り表示いたします。
        </p>
      </div>

      <div className="grid gap-6">
        {/* 事業者情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              事業者情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">販売事業者名</h3>
                <p className="text-lg">カナウ四柱推命</p>
                <p className="text-sm text-gray-600">個人事業主</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">代表者名</h3>
                <p className="text-lg">金雨 輝龍（佐々木 靖隆）</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 所在地 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              所在地
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg">〒226-0011</p>
              <p className="text-lg">神奈川県横浜市緑区中山3-1-8-207</p>
              <p className="text-sm text-gray-600 mt-2">※正確な郵便番号をご確認ください</p>
            </div>
          </CardContent>
        </Card>

        {/* 連絡先 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              連絡先
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">電話番号</h3>
              <p className="text-lg">090-6483-3637</p>
              <p className="text-sm text-gray-600">受付時間: 平日 10:00-18:00（携帯電話）</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">メールアドレス</h3>
              <p className="text-lg">kanaukiryu@gmail.com</p>
              <p className="text-sm text-gray-600">24時間受付（返信は営業時間内）</p>
            </div>
          </CardContent>
        </Card>

        {/* 販売価格 */}
        <Card>
          <CardHeader>
            <CardTitle>販売価格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">無料プラン</h3>
                <p className="text-2xl font-bold">0円</p>
                <p className="text-sm text-gray-600">基本機能のみ</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">ベーシックプラン</h3>
                <p className="text-2xl font-bold">
                  220円<span className="text-sm">/月</span>
                </p>
                <p className="text-sm text-gray-600">税込価格</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">プレミアムプラン</h3>
                <p className="text-2xl font-bold">
                  440円<span className="text-sm">/月</span>
                </p>
                <p className="text-sm text-gray-600">税込価格</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              ※価格は全て税込表示です。消費税率の変更に伴い価格が変更される場合があります。
            </p>
          </CardContent>
        </Card>

        {/* 支払方法 */}
        <Card>
          <CardHeader>
            <CardTitle>支払方法・時期</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">利用可能な支払方法</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>クレジットカード（Visa、Mastercard、JCB、American Express）</li>
                <li>デビットカード</li>
                <li>コンビニ決済（予定）</li>
                <li>銀行振込（予定）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">支払時期</h3>
              <p>月額プランは毎月の契約日に自動課金されます。</p>
            </div>
          </CardContent>
        </Card>

        {/* サービス提供時期 */}
        <Card>
          <CardHeader>
            <CardTitle>サービス提供時期</CardTitle>
          </CardHeader>
          <CardContent>
            <p>決済完了後、即座にサービスをご利用いただけます。</p>
          </CardContent>
        </Card>

        {/* 返品・交換・キャンセル */}
        <Card>
          <CardHeader>
            <CardTitle>返品・交換・キャンセル</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">クーリングオフ</h3>
              <p>初回契約から8日以内であれば、理由を問わず契約を解除し、 全額返金いたします。</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">中途解約</h3>
              <p>
                月額プランはいつでも解約可能です。解約後、次回課金日以降は
                サービスが停止されます。既に支払い済みの期間分の返金は 原則として行いません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">返金対応</h3>
              <p>
                当社の責に帰すべき事由によりサービスが利用できない場合、 利用できなかった期間に応じて返金いたします。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* その他 */}
        <Card>
          <CardHeader>
            <CardTitle>その他</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">個人情報の取扱い</h3>
              <p>お客様の個人情報は、当社のプライバシーポリシーに従って 適切に管理・保護いたします。</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">免責事項</h3>
              <p>
                本サービスで提供される姓名判断・運勢分析結果は参考情報であり、
                その正確性や将来の結果を保証するものではありません。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ 法的準備完了</h3>
        <p className="text-sm text-green-700">
          特定商取引法に基づく表記が完成しました。課金機能の実装準備が整いました。
        </p>
      </div>
    </div>
  )
}
