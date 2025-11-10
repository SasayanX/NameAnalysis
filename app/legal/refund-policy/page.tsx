import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CreditCard, RefreshCw } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">返金・キャンセルポリシー</h1>
        <p className="text-gray-600">当サービスの返金・キャンセルに関する規定を以下に定めます。</p>
      </div>

      <div className="space-y-6">
        {/* クーリングオフ */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Clock className="h-5 w-5" />
              クーリングオフ（8日間の無条件返金）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">適用条件</h3>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>初回有料プラン契約から8日以内</li>
                <li>理由を問わず解約可能</li>
                <li>全額返金保証</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-2">手続き方法</h3>
              <ol className="list-decimal list-inside space-y-2 text-green-700">
                <li>アカウント設定画面から「解約申請」を選択</li>
                <li>解約理由で「クーリングオフ」を選択</li>
                <li>当社で確認後、5営業日以内に返金処理</li>
              </ol>
            </div>

            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>例：</strong> 1月1日に契約した場合、1月8日23:59まで申請可能
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 通常の解約 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              通常の解約（クーリングオフ期間経過後）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">解約条件</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>いつでも解約可能（違約金なし）</li>
                <li>次回課金日の24時間前まで受付</li>
                <li>解約後も支払い済み期間中は利用可能</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">返金について</h3>
              <p className="text-red-600 font-medium">原則として、既に支払い済みの料金の返金は行いません。</p>
              <p className="text-sm text-gray-600 mt-2">
                ※月の途中で解約しても、その月の末日まではサービスをご利用いただけます。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 返金対象となる場合 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CreditCard className="h-5 w-5" />
              返金対象となる場合
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">当社責任による返金</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>システム障害により長期間サービスが利用できない場合</li>
                <li>当社の重大な過失によりサービスが提供できない場合</li>
                <li>誤課金・重複課金が発生した場合</li>
                <li>約束した機能が提供されない場合</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-800 mb-2">返金額の計算</h3>
              <p className="text-blue-700">利用できなかった期間に応じて日割り計算で返金いたします。</p>
              <div className="bg-white p-3 rounded-lg border border-blue-200 mt-2">
                <p className="text-sm text-blue-800">
                  <strong>計算例：</strong> 月額550円のプランで15日間利用できなかった場合
                  <br />
                  返金額 = 550円 × (15日 ÷ 30日) = 275円
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 返金されない場合 */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              返金対象外となる場合
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-red-700">
              <li>お客様の都合による解約（クーリングオフ期間除く）</li>
              <li>利用規約違反による利用停止・強制解約</li>
              <li>お客様の環境（ネット接続等）による利用不可</li>
              <li>姓名判断結果に対する不満・期待との相違</li>
              <li>一時的なメンテナンス・軽微な不具合</li>
            </ul>
          </CardContent>
        </Card>

        {/* 返金手続き */}
        <Card>
          <CardHeader>
            <CardTitle>返金手続きの流れ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <h3 className="font-semibold mb-1">申請</h3>
                <p className="text-sm text-gray-600">お問い合わせフォームから返金申請</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <h3 className="font-semibold mb-1">審査</h3>
                <p className="text-sm text-gray-600">3営業日以内に返金可否を判定</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <h3 className="font-semibold mb-1">通知</h3>
                <p className="text-sm text-gray-600">結果をメールでお知らせ</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  4
                </div>
                <h3 className="font-semibold mb-1">返金</h3>
                <p className="text-sm text-gray-600">承認後5営業日以内に返金</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">返金方法</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>クレジットカード決済：カード会社経由で返金（1-2ヶ月程度）</li>
                <li>コンビニ決済：銀行振込で返金（振込手数料は当社負担）</li>
                <li>銀行振込：同一口座への返金</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* お問い合わせ */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">返金に関するお問い合わせ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-purple-700">返金・解約に関するご質問は、以下の方法でお問い合わせください：</p>
              <ul className="list-disc list-inside space-y-1 text-purple-700 ml-4">
                <li>メール：kanaukiryu@gmail.com</li>
                <li>お問い合わせフォーム：サイト内のお問い合わせページ</li>
                <li>電話：090-6483-3637（平日10:00-18:00）</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">本ポリシーは予告なく変更される場合があります。最新版は当サイトでご確認ください。</p>
        <p className="text-sm mt-2">最終更新日: 2025年1月26日</p>
      </div>
    </div>
  )
}
