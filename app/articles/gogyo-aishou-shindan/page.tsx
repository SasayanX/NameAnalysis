import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Users, Briefcase, Star, CheckCircle, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "五行相性診断の完全ガイド | 恋愛・ビジネス・友人関係で活用 | まいにち姓名判断",
  description:
    "五行思想（木火土金水）を使った相性診断の完全ガイド。恋愛・ビジネス・友人関係での活用法から相性改善のコツまで詳しく解説します。",
  keywords: "五行,相性診断,恋愛,ビジネス,友人関係,木火土金水,相生,相克,姓名判断",
  openGraph: {
    title: "五行相性診断の完全ガイド | まいにち姓名判断",
    description: "古代中国の五行思想を使った相性診断で、より良い人間関係を築きましょう。",
    type: "article",
    publishedTime: "2025-06-28T00:00:00.000Z",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function GogyoAishouShindan() {
  const gogyoElements = [
    {
      name: "木",
      reading: "もく",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      characteristics: ["成長", "発展", "創造性"],
      personality: ["積極的", "チャレンジ精神", "リーダーシップ"],
      season: "春",
      colors: ["緑", "青"],
    },
    {
      name: "火",
      reading: "か",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      characteristics: ["情熱", "エネルギー", "明るさ"],
      personality: ["社交的", "表現力豊か", "感情的"],
      season: "夏",
      colors: ["赤", "オレンジ"],
    },
    {
      name: "土",
      reading: "ど",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      characteristics: ["安定", "信頼", "包容力"],
      personality: ["堅実", "責任感", "協調性"],
      season: "土用",
      colors: ["黄", "茶"],
    },
    {
      name: "金",
      reading: "きん",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      characteristics: ["規律", "完璧主義", "論理性"],
      personality: ["几帳面", "分析的", "品格"],
      season: "秋",
      colors: ["白", "銀"],
    },
    {
      name: "水",
      reading: "すい",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      characteristics: ["柔軟性", "知恵", "直感"],
      personality: ["適応力", "洞察力", "神秘的"],
      season: "冬",
      colors: ["黒", "紺"],
    },
  ]

  const soushouRelations = [
    { from: "木", to: "火", description: "木が燃えて火を生む" },
    { from: "火", to: "土", description: "火が燃えて灰（土）を作る" },
    { from: "土", to: "金", description: "土の中から金属が生まれる" },
    { from: "金", to: "水", description: "金属の表面に水滴が生まれる" },
    { from: "水", to: "木", description: "水が木を育てる" },
  ]

  const soukokuRelations = [
    { from: "木", to: "土", description: "木が土の養分を吸い取る" },
    { from: "土", to: "水", description: "土が水を吸収・濁らせる" },
    { from: "水", to: "火", description: "水が火を消す" },
    { from: "火", to: "金", description: "火が金属を溶かす" },
    { from: "金", to: "木", description: "金属（斧）が木を切る" },
  ]

  const loveCompatibility = [
    {
      combination: "木 × 火",
      type: "相生",
      description: "木の成長志向と火の情熱が相乗効果を生む理想的なカップル",
      advice: "お互いを高め合える関係。火の人が木の人を燃やし尽くさないよう適度な距離も大切",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      combination: "火 × 土",
      type: "相生",
      description: "火の情熱と土の安定感がバランス良く調和する組み合わせ",
      advice: "土の人が火の人を支え、火の人が土の人を活性化。長期的な関係を築きやすい",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      combination: "水 × 火",
      type: "相克",
      description: "水の冷静さと火の情熱が対立しやすい刺激的な関係",
      advice: "お互いを補完し合えれば最強のカップルに。コミュニケーションが特に重要",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ナビゲーション */}
      <div className="mb-6">
        <Link href="/articles" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          記事一覧に戻る
        </Link>
      </div>

      {/* ヘッダー */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-pink-100 text-pink-700">相性診断</Badge>
          <Badge variant="outline">2025年6月28日</Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          五行相性診断の完全ガイド
        </h1>
        <p className="text-xl text-gray-600 mb-6">恋愛・ビジネス・友人関係で活用する古代中国の智慧</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">五行</Badge>
          <Badge variant="outline">相性</Badge>
          <Badge variant="outline">恋愛</Badge>
          <Badge variant="outline">ビジネス</Badge>
          <Badge variant="outline">人間関係</Badge>
        </div>
      </header>

      {/* 導入 */}
      <section className="mb-12">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              五行思想は、古代中国から伝わる自然哲学の一つで、木・火・土・金・水の5つの要素が万物を構成するという考え方です。
              この五行理論を使った相性診断は、恋愛関係だけでなく、ビジネスパートナーや友人関係においても非常に有効な判断材料となります。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 五行の基本要素 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Star className="h-8 w-8 text-yellow-500" />
          五行の基本要素
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gogyoElements.map((element, index) => (
            <Card key={index} className={`${element.borderColor} border-2`}>
              <CardHeader className={element.bgColor}>
                <CardTitle className={`text-2xl ${element.color} text-center`}>
                  {element.name}（{element.reading}）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">特徴</h4>
                  <div className="flex flex-wrap gap-1">
                    {element.characteristics.map((char, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">性格</h4>
                  <div className="flex flex-wrap gap-1">
                    {element.personality.map((trait, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>季節:</strong> {element.season}
                  </p>
                  <p>
                    <strong>色:</strong> {element.colors.join("、")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 相生関係 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
          相生関係 - 良い相性
        </h2>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <p className="mb-6 text-gray-700">
              五行には「相生」という、お互いを生かし合う関係があります。この関係にある人同士は、自然と協力し合い、お互いを高め合うことができます。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {soushouRelations.map((relation, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {relation.from} → {relation.to}
                  </div>
                  <div className="text-sm text-gray-600">{relation.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 相克関係 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          相克関係 - 注意が必要な相性
        </h2>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <p className="mb-6 text-gray-700">
              一方で「相克」という、対立しやすい関係もあります。しかし、この関係も理解し合えれば、お互いを刺激し成長させる関係になります。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {soukokuRelations.map((relation, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {relation.from} → {relation.to}
                  </div>
                  <div className="text-sm text-gray-600">{relation.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 恋愛における相性 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-8 w-8 text-pink-500" />
          恋愛における五行相性
        </h2>
        <div className="space-y-6">
          {loveCompatibility.map((compatibility, index) => {
            const IconComponent = compatibility.icon
            return (
              <Card key={index} className="border-l-4 border-l-pink-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-6 w-6 ${compatibility.color}`} />
                    <CardTitle className="text-xl">{compatibility.combination}</CardTitle>
                    <Badge variant={compatibility.type === "相生" ? "default" : "secondary"}>
                      {compatibility.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{compatibility.description}</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>アドバイス:</strong> {compatibility.advice}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ビジネスでの活用 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-blue-500" />
          ビジネスにおける五行活用法
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>理想的なチーム編成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">木</Badge>
                <span className="text-sm">プロジェクトリーダー（新しいアイデア）</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700">火</Badge>
                <span className="text-sm">営業・マーケティング（情熱的な提案）</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700">土</Badge>
                <span className="text-sm">経理・管理（組織の基盤）</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-700">金</Badge>
                <span className="text-sm">品質管理・分析（完璧主義）</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">水</Badge>
                <span className="text-sm">企画・戦略（柔軟な発想）</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>取引先との相性判断</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">相生関係の取引先</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• 長期的なパートナーシップを築きやすい</li>
                  <li>• お互いの強みを活かし合える</li>
                  <li>• Win-Winの関係を構築しやすい</li>
                </ul>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-700 mb-2">相克関係の取引先</h4>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• 短期的な取引に留める</li>
                  <li>• 明確な契約と役割分担が重要</li>
                  <li>• 第三者を介した取引を検討</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 友人関係での活用 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-8 w-8 text-purple-500" />
          友人関係での五行相性
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">同じ五行同士</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• 価値観が似ているため理解し合いやすい</li>
                <li>• 共通の趣味や興味を持ちやすい</li>
                <li>• 安心できる関係を築ける</li>
                <li className="text-gray-600">※ 刺激が少なく成長機会が限られる場合も</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">相生関係</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• お互いを高め合える関係</li>
                <li>• 困った時に自然とサポートし合える</li>
                <li>• 長期的な友情を育みやすい</li>
                <li>• 生涯の友となる可能性が高い</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">相克関係</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• 価値観の違いから刺激を受けられる</li>
                <li>• 新しい視点や考え方を学べる</li>
                <li>• 成長のきっかけを与え合える</li>
                <li className="text-gray-600">※ 深い付き合いには注意が必要</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 診断方法 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">五行診断の実践方法</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">ステップ1: 自分の五行を知る</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-3">姓名判断では、名前の画数から五行を導き出します：</p>
                  <div className="grid grid-cols-5 gap-2 text-sm">
                    <div className="text-center p-2 bg-green-100 rounded">
                      1,2画
                      <br />木
                    </div>
                    <div className="text-center p-2 bg-red-100 rounded">
                      3,4画
                      <br />火
                    </div>
                    <div className="text-center p-2 bg-yellow-100 rounded">
                      5,6画
                      <br />土
                    </div>
                    <div className="text-center p-2 bg-gray-100 rounded">
                      7,8画
                      <br />金
                    </div>
                    <div className="text-center p-2 bg-blue-100 rounded">
                      9,0画
                      <br />水
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">ステップ2: 相手の五行を知る</h3>
                <p className="text-gray-700">同様に相手の名前からも五行を導き出します。</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">ステップ3: 相性を判定</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>
                      <strong>相生関係:</strong> 非常に良い相性
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    <span>
                      <strong>同じ五行:</strong> 安定した相性
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>
                      <strong>相克関係:</strong> 刺激的だが注意が必要
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 注意点 */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">五行相性診断の注意点</h2>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">診断結果に振り回されない</h3>
                  <p className="text-gray-700">
                    五行相性診断は参考程度に留め、人間関係は複雑で五行だけで全てが決まるわけではありません。
                    個人の努力や相互理解が最も重要です。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">建設的な活用方法</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• 自己理解のツールとして活用</li>
                    <li>• コミュニケーション改善のヒント</li>
                    <li>• チームワーク向上の参考</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* まとめ */}
      <section className="mb-12">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">まとめ</h2>
            <p className="text-lg text-gray-700 mb-6">
              五行相性診断は、古代中国の智慧を現代の人間関係に活かす実用的なツールです。
              恋愛、ビジネス、友人関係において、相手を理解し、より良い関係を築くための指針として活用できます。
            </p>
            <p className="text-gray-600 mb-8">
              ただし、診断結果に固執せず、あくまで参考として捉え、
              実際の人間関係では相互理解と努力が最も重要であることを忘れてはいけません。
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Heart className="h-5 w-5 mr-2" />
                あなたの五行相性を診断する
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* 関連記事 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">関連記事</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/articles/kyujitai-seimeihandan" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">旧字体で行う本格姓名判断の理由</CardTitle>
                <CardDescription>
                  なぜ姓名判断では旧字体を使うのか？その歴史的背景と現代における意義を詳しく解説します。
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/articles/tengaku-kyousuu-myouji" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">天格強数の苗字を持つ人の対処法</CardTitle>
                <CardDescription>
                  強すぎる苗字の画数による影響と、それを和らげる具体的な方法を詳しく解説します。
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">五行相性診断を実際に体験</h3>
            <p className="mb-6 opacity-90">
              記事で学んだ知識を活用して、実際にあなたの名前を姓名判断で分析し、五行相性を確認してみませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Star className="h-4 w-4 mr-2" />
                  無料で姓名判断を始める
                </Button>
              </Link>
              <Link href="/articles">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  他の記事も読む
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
