import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">利用規約</h1>
        <p className="text-gray-600">最終更新日: 2025年1月26日</p>
      </div>

      <div className="space-y-6">
        {/* 第1条 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第1条（適用）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              本利用規約（以下「本規約」）は、当サービス「姓名判断・運勢分析サービス」（以下「本サービス」）の利用条件を定めるものです。
            </p>
            <p>利用者は、本サービスを利用することによって、本規約に同意したものとみなします。</p>
          </CardContent>
        </Card>

        {/* 第2条 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第2条（定義）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">本規約において、以下の用語は以下の意味を有します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>「当社」</strong>：本サービスを運営する事業者
                </li>
                <li>
                  <strong>「利用者」</strong>：本サービスを利用する個人
                </li>
                <li>
                  <strong>「有料プラン」</strong>：本サービスの有料機能を利用できるプラン
                </li>
                <li>
                  <strong>「コンテンツ」</strong>：本サービスで提供される姓名判断結果、分析データ等
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 第3条 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第3条（サービス内容）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2">本サービスは以下の機能を提供します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>姓名判断・運勢分析</li>
                <li>相性診断</li>
                <li>六星占術分析</li>
                <li>運気運行表の表示</li>
                <li>PDF出力機能</li>
                <li>その他当社が提供する関連サービス</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 第4条 - 有料プラン */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第4条（有料プラン）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">4.1 プラン種類</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>無料プラン</strong>：基本機能を制限付きで利用可能
                </li>
                <li>
                  <strong>ベーシックプラン</strong>：月額220円（税込）
                </li>
                <li>
                  <strong>プレミアムプラン</strong>：月額440円（税込）
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4.2 自動更新</h3>
              <p>
                有料プランは自動更新されます。解約を希望する場合は、次回課金日の24時間前までに解約手続きを行ってください。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4.3 料金支払い</h3>
              <p>
                料金は前払いとし、指定された決済方法により毎月自動的に課金されます。
                支払いが確認できない場合、サービスの利用を停止することがあります。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 第5条 - 解約・返金 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第5条（解約・返金）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">5.1 解約</h3>
              <p>
                利用者は、アカウント設定画面からいつでも有料プランを解約できます。
                解約後も、既に支払い済みの期間中はサービスを利用できます。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5.2 返金</h3>
              <p>
                原則として、一度支払われた料金の返金は行いません。 ただし、当社の責に帰すべき事由により
                サービスが利用できない場合は、 この限りではありません。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5.3 クーリングオフ</h3>
              <p>初回契約から8日以内であれば、理由を問わず契約を解除し、 全額返金を受けることができます。</p>
            </div>
          </CardContent>
        </Card>

        {/* 第6条 - 禁止事項 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第6条（禁止事項）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2">利用者は以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスの不正利用</li>
                <li>他の利用者への迷惑行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>コンテンツの無断転載・複製・配布</li>
                <li>逆アセンブル、リバースエンジニアリング等の行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 第7条 - 免責事項 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第7条（免責事項）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              本サービスで提供される姓名判断・運勢分析結果は、 統計的手法に基づく参考情報であり、その正確性や
              将来の結果を保証するものではありません。
            </p>
            <p>利用者が本サービスの利用により被った損害について、 当社は一切の責任を負いません。</p>
          </CardContent>
        </Card>

        {/* 第8条 - 規約変更 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第8条（規約の変更）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              当社は、必要に応じて本規約を変更することがあります。
              変更後の規約は、本サービス上に掲示した時点で効力を生じます。
            </p>
          </CardContent>
        </Card>

        {/* 第9条 - 準拠法・管轄 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">第9条（準拠法・管轄裁判所）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              本規約は日本法に準拠し、本サービスに関する一切の紛争については、
              当社所在地を管轄する裁判所を専属的合意管轄裁判所とします。
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-gray-600">
        <p>本規約についてご質問がある場合は、お問い合わせページよりご連絡ください。</p>
      </div>
    </div>
  )
}
