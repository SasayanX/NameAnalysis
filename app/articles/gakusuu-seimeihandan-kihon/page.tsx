import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calculator,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react"

export const metadata: Metadata = {
  title: "画数でわかる姓名判断の基本と使い方｜初心者向け完全ガイド | まいにち姓名判断",
  description:
    "姓名判断の画数計算方法から五格の意味まで、初心者でもわかりやすく解説。天格・人格・地格・外格・総格の計算手順と吉凶判断を具体例で学べます。",
  keywords: "画数,姓名判断,五格,天格,人格,地格,外格,総格,計算方法,基本,初心者",
  openGraph: {
    title: "画数でわかる姓名判断の基本と使い方｜初心者向け完全ガイド",
    description: "姓名判断の画数計算から五格の意味まで、初心者向けに詳しく解説します。",
    type: "article",
  },
}

export default function GakusuuSeimeihandanKihonPage() {
  const gokakuData = [
    {
      name: "天格",
      reading: "てんかく",
      calculation: "苗字の画数の合計",
      meaning: "先祖から受け継いだ運勢・家系の特徴",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      name: "人格",
      reading: "じんかく",
      calculation: "苗字の最後 + 名前の最初",
      meaning: "核となる性格・中年期の運勢",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      isImportant: true,
    },
    {
      name: "地格",
      reading: "ちかく",
      calculation: "名前の画数の合計",
      meaning: "幼少期〜青年期・基礎的性格",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      name: "外格",
      reading: "がいかく",
      calculation: "総格 - 人格",
      meaning: "対人関係・社会性・仕事運",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      name: "総格",
      reading: "そうかく",
      calculation: "全文字の画数の合計",
      meaning: "人生全体・晩年の運勢",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ]

  const daikichisu = [
    { number: 1, meaning: "リーダーシップ・独立心" },
    { number: 3, meaning: "明朗活発・人気運" },
    { number: 5, meaning: "温和・協調性" },
    { number: 6, meaning: "誠実・責任感" },
    { number: 11, meaning: "直感力・霊感" },
    { number: 13, meaning: "才能・芸術性" },
    { number: 15, meaning: "人徳・円満" },
    { number: 16, meaning: "親分肌・統率力" },
    { number: 21, meaning: "独立・成功運" },
    { number: 23, meaning: "発展・隆盛" },
    { number: 24, meaning: "金運・財運" },
  ]

  const kyousu = [
    { number: 2, meaning: "分離・別れ" },
    { number: 4, meaning: "苦労・病弱" },
    { number: 9, meaning: "苦難・挫折" },
    { number: 10, meaning: "空虚・破滅" },
    { number: 12, meaning: "薄弱・挫折" },
    { number: 14, meaning: "孤独・家族運薄" },
    { number: 19, meaning: "障害・苦労" },
    { number: 20, meaning: "病弱・事故" },
    { number: 22, meaning: "挫折・破滅" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">画数でわかる姓名判断の基本</h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">初心者向け完全ガイド</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            2025年1月2日
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            12分で読める
          </div>
          <Badge className="bg-blue-100 text-blue-700">基礎知識</Badge>
        </div>
      </div>

      {/* 導入 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <p className="text-lg leading-relaxed">
            姓名判断は、名前の画数から運勢を読み解く古来からの占術です。「画数って何？」「どうやって計算するの？」という初心者の疑問から、実際の使い方まで、わかりやすく解説します。
          </p>
        </CardContent>
      </Card>

      {/* 画数の基本概念 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          姓名判断とは？画数の基本概念
        </h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>画数とは何か</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              <strong>画数</strong>とは、漢字を書く際の筆画の数のことです。例えば：
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold mb-1">田</div>
                <div className="text-sm text-gray-600">5画</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold mb-1">中</div>
                <div className="text-sm text-gray-600">4画</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold mb-1">山</div>
                <div className="text-sm text-gray-600">3画</div>
              </div>
            </div>
            <p>姓名判断では、この画数が持つ意味や吉凶を重視します。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>なぜ画数が重要なのか</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">古来より、数には神秘的な力があると考えられてきました。姓名判断では：</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <div className="font-semibold text-red-700 mb-2">奇数（陽の性質）</div>
                <div className="text-sm">積極的、外向的</div>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <div className="font-semibold text-blue-700 mb-2">偶数（陰の性質）</div>
                <div className="text-sm">消極的、内向的</div>
              </div>
            </div>
            <p className="mt-4">この陰陽のバランスが、その人の運勢に影響すると考えられています。</p>
          </CardContent>
        </Card>
      </div>

      {/* 五格の説明 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-600" />
          五格とは？姓名判断の核心システム
        </h2>

        <p className="mb-6 text-gray-600">
          姓名判断の中心となるのが「五格」という概念です。名前を5つの要素に分けて分析します。
        </p>

        <div className="grid gap-4">
          {gokakuData.map((gokaku, index) => (
            <Card
              key={index}
              className={`${gokaku.borderColor} border-2 ${gokaku.isImportant ? "ring-2 ring-red-200" : ""}`}
            >
              <CardHeader className={gokaku.bgColor}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${gokaku.color} flex items-center gap-2`}>
                    {gokaku.name}
                    <span className="text-sm font-normal">（{gokaku.reading}）</span>
                    {gokaku.isImportant && <Badge className="bg-red-500 text-white">最重要</Badge>}
                  </CardTitle>
                </div>
                <CardDescription className="font-medium">{gokaku.calculation}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{gokaku.meaning}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 計算方法 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-green-600" />
          実際の計算方法｜ステップバイステップ
        </h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>例：「田中太郎」さんの場合</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Step 1: 各文字の画数を確認</h4>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold mb-1">田</div>
                  <div className="text-sm text-gray-600">5画</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold mb-1">中</div>
                  <div className="text-sm text-gray-600">4画</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold mb-1">太</div>
                  <div className="text-sm text-gray-600">4画</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold mb-1">郎</div>
                  <div className="text-sm text-gray-600">9画</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Step 2: 五格を計算</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <span>
                    <strong>天格</strong> = 田(5) + 中(4)
                  </span>
                  <span className="font-bold text-purple-600">9画</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <span>
                    <strong>人格</strong> = 中(4) + 太(4)
                  </span>
                  <span className="font-bold text-red-600">8画</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <span>
                    <strong>地格</strong> = 太(4) + 郎(9)
                  </span>
                  <span className="font-bold text-green-600">13画</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <span>
                    <strong>外格</strong> = 総格(22) - 人格(8)
                  </span>
                  <span className="font-bold text-blue-600">14画</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                  <span>
                    <strong>総格</strong> = 田(5) + 中(4) + 太(4) + 郎(9)
                  </span>
                  <span className="font-bold text-orange-600">22画</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              一文字姓・一文字名の特殊計算
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              <strong>一文字の場合は「1画」を補う</strong>のが一般的です：
            </p>
            <div className="bg-white p-4 rounded border">
              <p className="font-semibold mb-2">例：「林誠」さんの場合</p>
              <ul className="space-y-1 text-sm">
                <li>• 天格 = 林(8) + 1 = 9画</li>
                <li>• 人格 = 林(8) + 誠(13) = 21画</li>
                <li>• 地格 = 誠(13) + 1 = 14画</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 吉凶判断 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          画数の吉凶判断｜基本的な見方
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                大吉数（特に良い画数）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {daikichisu.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-green-600">{item.number}画</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                凶数（注意が必要な画数）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kyousu.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-red-600">{item.number}画</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 実践的な使い方 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600" />
          実践的な姓名判断の使い方
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">赤ちゃんの名付け</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">良い名前の条件：</p>
              <ul className="text-sm space-y-1">
                <li>• 人格が大吉数</li>
                <li>• 地格が吉数</li>
                <li>• 凶数を避ける</li>
                <li>• 陰陽のバランス</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">自分の性格分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">現在の名前を分析：</p>
              <ul className="text-sm space-y-1">
                <li>• 人格から核となる性格</li>
                <li>• 地格から潜在能力</li>
                <li>• 外格から対人関係</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">改名の検討</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">検討する場合：</p>
              <ul className="text-sm space-y-1">
                <li>• 人格が凶数</li>
                <li>• 総格が大凶数</li>
                <li>• 人生で困難が続く</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 注意点 */}
      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            姓名判断の注意点と限界
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">1. 旧字体での計算</h4>
              <p className="text-sm">正式な姓名判断では旧字体の画数を使用します。</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. 流派による違い</h4>
              <p className="text-sm">画数の数え方や吉凶判断に違いがあります。</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. 統計的根拠の限界</h4>
              <p className="text-sm">参考程度に留めることが重要です。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* まとめ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>まとめ：画数を活用した姓名判断</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">姓名判断の画数は、名前に込められた意味を数値化して読み解く興味深い方法です。</p>
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h4 className="font-semibold mb-2">重要なポイント：</h4>
            <ul className="space-y-1 text-sm">
              <li>
                1. <strong>五格</strong>（天格・人格・地格・外格・総格）で総合判断
              </li>
              <li>
                2. <strong>人格</strong>が最も重要な要素
              </li>
              <li>
                3. <strong>旧字体</strong>での正確な画数計算
              </li>
              <li>
                4. <strong>参考程度</strong>に留め、人生の指針として活用
              </li>
            </ul>
          </div>
          <p>名前は一生のパートナーです。画数の意味を理解して、より良い人生の参考にしてください。</p>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">あなたの名前を実際に分析してみませんか？</h3>
          <p className="mb-4 opacity-90">学んだ知識を活用して、実際にあなたの名前を姓名判断で分析してみましょう。</p>
          <Link href="/name-analyzer">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Calculator className="h-4 w-4 mr-2" />
              無料で姓名判断を始める
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 関連記事 */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">関連記事</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/articles/kyujitai-seimeihandan" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-sm">旧字体で行う本格姓名判断の理由</h4>
                <p className="text-xs text-gray-600">なぜ姓名判断では旧字体を使うのか詳しく解説</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/articles/gogyo-aishou-shindan" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-sm">五行相性診断の完全ガイド</h4>
                <p className="text-xs text-gray-600">恋愛・ビジネスで活用する古代中国の智慧</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/articles/2025-baby-names-ranking" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-sm">2025年人気の赤ちゃん名前ランキング</h4>
                <p className="text-xs text-gray-600">最新トレンドと姓名判断による運勢分析</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
