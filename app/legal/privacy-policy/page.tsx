import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, Lock, Eye, Trash2, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
        <p className="text-gray-600">最終更新日: 2025年1月26日</p>
      </div>

      <div className="space-y-6">
        {/* 基本方針 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              基本方針
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              当サービス「まいにちAI姓名判断」（以下「本サービス」）は、お客様の個人情報の保護を最重要事項と考え、
              個人情報保護法およびその他の関連法令を遵守し、適切な取り扱いを行います。
            </p>
          </CardContent>
        </Card>

        {/* 収集する情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              収集する個人情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. 直接収集する情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>基本情報</strong>：姓名、性別、生年月日</li>
                <li><strong>連絡先情報</strong>：メールアドレス、電話番号</li>
                <li><strong>決済情報</strong>：クレジットカード情報（決済プロバイダー経由）</li>
                <li><strong>利用履歴</strong>：サービス利用状況、分析結果</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. 自動収集する情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>技術情報</strong>：IPアドレス、ブラウザ情報、デバイス情報</li>
                <li><strong>利用情報</strong>：アクセス時間、ページ閲覧履歴、機能利用状況</li>
                <li><strong>Cookie情報</strong>：サービス改善のための分析データ</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 利用目的 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              個人情報の利用目的
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">収集した個人情報は以下の目的で利用します：</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>姓名判断・運勢分析サービスの提供</li>
                <li>AI深層心理分析の実行</li>
                <li>相性診断機能の提供</li>
                <li>有料プランの課金処理</li>
                <li>カスタマーサポートの提供</li>
                <li>サービス改善・新機能開発</li>
                <li>不正利用の防止・セキュリティ向上</li>
                <li>法的義務の履行</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 第三者提供 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              第三者提供
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">第三者提供について</h3>
              <p className="mb-4">
                当社は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>お客様の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために必要な場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">業務委託先への提供</h3>
              <p>
                当社は、サービス提供のために必要な範囲で、信頼できる業務委託先に個人情報を提供することがあります。
                この場合、当社は委託先に対し適切な監督を行います。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* データ保護 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              データ保護措置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">セキュリティ対策</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS暗号化通信の使用</li>
                <li>アクセス制御と権限管理</li>
                <li>定期的なセキュリティ監査</li>
                <li>データバックアップと復旧体制</li>
                <li>従業員への個人情報保護研修</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">データ保存期間</h3>
              <p>
                個人情報は、利用目的の達成に必要な期間のみ保存し、その後は適切に削除または匿名化します。
                法的保存義務がある場合は、その期間に従って保存します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* お客様の権利 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              お客様の権利
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">お客様は以下の権利を有します：</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・削除請求</li>
                <li>個人情報の利用停止・消去請求</li>
                <li>データの可搬性（データの移行）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">権利行使の方法</h3>
              <p>
                上記の権利を行使される場合は、下記のお問い合わせ先までご連絡ください。
                本人確認を行った上で、適切に対応いたします。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookie */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie（クッキー）について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Cookieの使用目的</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>サービスの機能向上</li>
                <li>利用状況の分析</li>
                <li>パーソナライズされた体験の提供</li>
                <li>広告の配信（該当する場合）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Cookieの管理</h3>
              <p>
                お客様は、ブラウザの設定によりCookieの受け入れを拒否することができます。
                ただし、一部の機能が利用できなくなる場合があります。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 未成年者の個人情報 */}
        <Card>
          <CardHeader>
            <CardTitle>未成年者の個人情報</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              16歳未満のお客様の個人情報を収集する場合は、保護者の同意を得るものとします。
              保護者の同意なく個人情報を収集したことが判明した場合は、速やかに削除いたします。
            </p>
          </CardContent>
        </Card>

        {/* プライバシーポリシーの変更 */}
        <Card>
          <CardHeader>
            <CardTitle>プライバシーポリシーの変更</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。
              重要な変更がある場合は、サービス上でお知らせいたします。
            </p>
          </CardContent>
        </Card>

        {/* お問い合わせ */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Mail className="h-5 w-5" />
              お問い合わせ先
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-purple-700">個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：</p>
              <ul className="list-disc list-inside space-y-1 text-purple-700 ml-4">
                <li>事業者名：まいにちAI姓名判断</li>
                <li>代表者：金雨 輝龍</li>
                <li>メールアドレス：kanaukiryu@gmail.com</li>
                <li>電話番号：090-6483-3637</li>
                <li>所在地：〒226-0019 神奈川県横浜市緑区中山3-1-8-207</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">本プライバシーポリシーは予告なく変更される場合があります。最新版は当サイトでご確認ください。</p>
        <p className="text-sm mt-2">最終更新日: 2025年1月26日</p>
      </div>
    </div>
  )
}
