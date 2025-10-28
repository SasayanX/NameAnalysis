import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, Info, FileText } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">免責事項</h1>
        <p className="text-gray-600">最終更新日: 2025年1月26日</p>
      </div>

      <div className="space-y-6">
        {/* 重要事項 */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              重要事項
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-semibold mb-2">
                本サービスで提供される姓名判断・運勢分析結果は、統計的手法に基づく参考情報であり、
                その正確性や将来の結果を保証するものではありません。
              </p>
              <p className="text-red-700">
                お客様の判断と責任においてご利用ください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* サービス内容の免責 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              サービス内容に関する免責事項
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. 分析結果の性質</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>姓名判断結果は統計的手法に基づく参考情報です</li>
                <li>AI分析結果は機械学習アルゴリズムによる推測です</li>
                <li>相性診断結果は一般的な傾向に基づくものです</li>
                <li>六星占術結果は伝統的な占術理論に基づくものです</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. 結果の保証</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>分析結果の正確性は保証されません</li>
                <li>将来の運勢や結果を予測するものではありません</li>
                <li>人生の重大な決定の唯一の根拠としないでください</li>
                <li>個人的な状況や環境の違いにより結果が異なる場合があります</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 利用に関する免責 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              利用に関する免責事項
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. サービス利用の責任</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>お客様自身の判断と責任においてサービスをご利用ください</li>
                <li>分析結果に基づく行動の結果について当社は責任を負いません</li>
                <li>投資、就職、結婚等の重要な決定は慎重に行ってください</li>
                <li>医療、法律、財務に関する問題は専門家にご相談ください</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. データの正確性</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>入力された情報の正確性はお客様の責任です</li>
                <li>誤った情報に基づく分析結果について当社は責任を負いません</li>
                <li>漢字の読み方や画数の解釈に複数の説がある場合があります</li>
                <li>旧字体・新字体の違いによる値の相違があります</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 技術的免責 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              技術的免責事項
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. システムの動作</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>システムの中断、停止、エラーが発生する場合があります</li>
                <li>メンテナンスにより一時的にサービスが利用できない場合があります</li>
                <li>インターネット接続の問題によりサービスが利用できない場合があります</li>
                <li>ブラウザの互換性問題により一部機能が動作しない場合があります</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. データの損失</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>システム障害によりデータが消失する場合があります</li>
                <li>分析結果の保存期間に制限があります</li>
                <li>データのバックアップは保証されません</li>
                <li>お客様のデバイスの問題によりデータが失われる場合があります</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 第三者サービス */}
        <Card>
          <CardHeader>
            <CardTitle>第三者サービスに関する免責事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">外部サービス</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>決済サービス（Stripe、Square等）の動作は保証されません</li>
                <li>AI分析サービス（OpenAI等）の結果は保証されません</li>
                <li>外部APIの変更によりサービスが影響を受ける場合があります</li>
                <li>第三者のサービス利用規約に従ってご利用ください</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 損害の免責 */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">損害の免責</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <p className="text-orange-800 font-semibold mb-2">
                当社は、本サービスの利用により生じた以下の損害について一切の責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-1 text-orange-700 ml-4">
                <li>直接的損害（分析結果に基づく判断の結果等）</li>
                <li>間接的損害（機会損失、逸失利益等）</li>
                <li>精神的損害</li>
                <li>第三者に対する損害</li>
                <li>システム障害による損害</li>
                <li>データの消失による損害</li>
                <li>その他本サービスに関連する一切の損害</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 法的免責 */}
        <Card>
          <CardHeader>
            <CardTitle>法的免責事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. 法令遵守</h3>
              <p>
                本サービスは日本の法令に従って運営されていますが、
                お客様の居住地の法令との整合性は保証されません。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. 管轄</h3>
              <p>
                本サービスに関する紛争は、当社所在地を管轄する裁判所を専属的合意管轄裁判所とします。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. 準拠法</h3>
              <p>
                本免責事項は日本法に準拠し、日本法に従って解釈されます。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 変更に関する免責 */}
        <Card>
          <CardHeader>
            <CardTitle>サービス変更に関する免責事項</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>当社は予告なくサービスの内容を変更する場合があります</li>
              <li>料金体系の変更により既存プランが影響を受ける場合があります</li>
              <li>機能の追加・削除により利用方法が変更される場合があります</li>
              <li>サービス終了の場合は事前に通知いたします</li>
            </ul>
          </CardContent>
        </Card>

        {/* お問い合わせ */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">免責事項に関するお問い合わせ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-purple-700">免責事項に関するご質問は、以下までご連絡ください：</p>
              <ul className="list-disc list-inside space-y-1 text-purple-700 ml-4">
                <li>事業者名：まいにちAI姓名判断</li>
                <li>代表者：金雨 輝龍</li>
                <li>メールアドレス：kanaukiryu@gmail.com</li>
                <li>電話番号：090-6483-3637</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">本免責事項は予告なく変更される場合があります。最新版は当サイトでご確認ください。</p>
        <p className="text-sm mt-2">最終更新日: 2025年1月26日</p>
      </div>
    </div>
  )
}
