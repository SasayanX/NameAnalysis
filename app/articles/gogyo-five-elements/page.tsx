import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Eye, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "五行思想と姓名判断の深い関係 | まいにち姓名判断",
  description:
    "木火土金水の五行がどのように姓名判断に影響するのか詳しく解説。五行の相生・相克関係、姓名判断での活用法、運勢への影響を専門家が分かりやすく説明します。",
  keywords: "五行, 木火土金水, 姓名判断, 相生, 相克, 運勢, 占い, 理論, 専門知識, バランス",
  openGraph: {
    title: "五行思想と姓名判断の深い関係",
    description: "木火土金水の五行がどのように姓名判断に影響するのか詳しく解説。",
    type: "article",
    url: "https://seimei.app/articles/gogyo-five-elements",
    siteName: "まいにち姓名判断",
    locale: "ja_JP",
  },
  authors: [{ name: "姓名判断専門家" }],
  publishedTime: "2025-06-18T00:00:00.000Z",
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "五行思想と姓名判断の深い関係",
  description: "木火土金水の五行がどのように姓名判断に影響するのか詳しく解説。",
  author: {
    "@type": "Person",
    name: "姓名判断専門家",
  },
  datePublished: "2025-06-18T00:00:00.000Z",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://nameanalysis216.vercel.app/articles/gogyo-five-elements",
  },
}

export default function GogyoArticlePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* パンくずナビ */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="パンくず">
            <Link href="/" className="hover:text-primary">
              ホーム
            </Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-primary">
              コラム
            </Link>
            <span>/</span>
            <span>五行思想と姓名判断の深い関係</span>
          </nav>

          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事一覧に戻る
            </Link>
          </Button>

          {/* 記事ヘッダー */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">理論</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">五行思想と姓名判断の深い関係</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                読了時間: 7分
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                1,923回閲覧
              </div>
              <div>公開日: 2025年6月18日</div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              姓名判断の奥深い世界には、古代中国から伝わる「五行思想」が深く関わっています。木・火・土・金・水の五つの要素がどのように名前の運勢に影響するのか、その神秘的な関係を探ってみましょう。
            </p>
          </header>

          {/* 目次 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">📋 この記事の内容</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <Link href="#section1" className="hover:text-primary">
                    五行思想とは何か？
                  </Link>
                </li>
                <li>
                  <Link href="#section2" className="hover:text-primary">
                    五行の相生・相克関係
                  </Link>
                </li>
                <li>
                  <Link href="#section3" className="hover:text-primary">
                    姓名判断における五行の役割
                  </Link>
                </li>
                <li>
                  <Link href="#section4" className="hover:text-primary">
                    五行バランスで読み解く運勢
                  </Link>
                </li>
                <li>
                  <Link href="#section5" className="hover:text-primary">
                    実践的な五行活用法
                  </Link>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none mb-12">
            <div id="section1" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">1. 五行思想とは何か？</h2>
              <p className="text-base leading-relaxed mb-4">
                五行思想は、古代中国で生まれた自然哲学の考え方です。宇宙のすべてのものは「木・火・土・金・水」の5つの要素から成り立っているという思想で、これらの要素が互いに影響し合いながら循環していると考えられています。
              </p>
              <div className="bg-background p-4 rounded border-l-4 border-primary">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>木（もく）</strong>：成長・発展・創造性を表す
                  </li>
                  <li>
                    <strong>火（か）</strong>：情熱・活動・エネルギーを表す
                  </li>
                  <li>
                    <strong>土（ど）</strong>：安定・信頼・包容力を表す
                  </li>
                  <li>
                    <strong>金（きん）</strong>：規律・正義・完成を表す
                  </li>
                  <li>
                    <strong>水（すい）</strong>：知恵・柔軟性・流動性を表す
                  </li>
                </ul>
              </div>
            </div>

            <div id="section2" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">2. 五行の相生・相克関係</h2>
              <p className="text-base leading-relaxed mb-4">
                五行には「相生（そうしょう）」と「相克（そうこく）」という重要な関係があります。
              </p>

              <h3 className="text-lg font-bold mb-3 text-primary">相生関係（お互いを助け合う関係）</h3>
              <div className="bg-background p-4 rounded border-l-4 border-green-500 mb-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>木は火を生む（木が燃えて火になる）</li>
                  <li>火は土を生む（火が燃えて灰（土）になる）</li>
                  <li>土は金を生む（土の中から金属が生まれる）</li>
                  <li>金は水を生む（金属の表面に水滴が生まれる）</li>
                  <li>水は木を生む（水が木を育てる）</li>
                </ul>
              </div>

              <h3 className="text-lg font-bold mb-3 text-primary">相克関係（お互いを制する関係）</h3>
              <div className="bg-background p-4 rounded border-l-4 border-red-500">
                <ul className="list-disc list-inside space-y-1">
                  <li>木は土を克す（木の根が土を吸収する）</li>
                  <li>火は金を克す（火が金属を溶かす）</li>
                  <li>土は水を克す（土が水を吸収する）</li>
                  <li>金は木を克す（金属が木を切る）</li>
                  <li>水は火を克す（水が火を消す）</li>
                </ul>
              </div>
            </div>

            <div id="section3" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">3. 姓名判断における五行の役割</h2>
              <p className="text-base leading-relaxed mb-4">
                <Link href="/" className="text-primary hover:underline">
                  姓名判断
                </Link>
                では、漢字の画数から五行を導き出し、その人の性格や運勢を読み解きます。画数を5で割った余りで五行が決まります。
              </p>
              <div className="bg-background p-4 rounded border-l-4 border-primary mb-4">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>1・2画</strong> → 木行：創造性豊か、成長志向
                  </li>
                  <li>
                    <strong>3・4画</strong> → 火行：情熱的、行動力がある
                  </li>
                  <li>
                    <strong>5・6画</strong> → 土行：安定志向、信頼できる
                  </li>
                  <li>
                    <strong>7・8画</strong> → 金行：規律正しい、完璧主義
                  </li>
                  <li>
                    <strong>9・0画</strong> → 水行：柔軟性がある、知的
                  </li>
                </ul>
              </div>
              <p className="text-base leading-relaxed">
                天格・人格・地格・外格・総格それぞれの五行を調べ、全体のバランスを見ることで、その人の本質や運勢の傾向を読み解くことができます。
              </p>
            </div>

            <div id="section4" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">4. 五行バランスで読み解く運勢</h2>
              <p className="text-base leading-relaxed mb-4">
                理想的な名前は、五行がバランスよく配置されているものです。特定の五行に偏りすぎると、その特徴が強く出すぎて問題となることがあります。
              </p>

              <h3 className="text-lg font-bold mb-3 text-primary">良いバランスの例</h3>
              <div className="bg-background p-4 rounded border-l-4 border-green-500 mb-4">
                <p className="text-sm">
                  人格が「木」、地格が「火」の場合：木が火を生む相生関係で、創造性（木）が情熱（火）を生み出し、積極的で創造的な人生を歩める傾向があります。
                </p>
              </div>

              <h3 className="text-lg font-bold mb-3 text-primary">注意が必要なバランス</h3>
              <div className="bg-background p-4 rounded border-l-4 border-yellow-500">
                <p className="text-sm">
                  人格が「水」、地格が「火」の場合：水が火を消す相克関係で、内面の葛藤や方向性の迷いが生じやすい傾向があります。
                </p>
              </div>
            </div>

            <div id="section5" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">5. 実践的な五行活用法</h2>
              <p className="text-base leading-relaxed mb-4">五行の知識は、日常生活でも活用できます。</p>
              <div className="bg-background p-4 rounded border-l-4 border-primary">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>相性診断</strong>：相手との五行の関係を調べて相性を判断
                  </li>
                  <li>
                    <strong>開運行動</strong>：不足している五行を補う行動を取る
                  </li>
                  <li>
                    <strong>色彩選択</strong>：五行に対応する色を身につける
                  </li>
                  <li>
                    <strong>方位活用</strong>：五行に対応する方位を意識する
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg mb-8 border-l-4 border-primary">
              <blockquote className="text-lg font-medium italic">
                「五行思想は、姓名判断の根幹をなす重要な理論です。」
                <br />
                名前に込められた五行のバランスを理解することで、より深い自己理解と開運への道筋が見えてきます。
              </blockquote>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">まとめ</h2>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>五行思想は姓名判断の重要な理論基盤</li>
                <li>相生・相克関係が運勢に大きく影響</li>
                <li>画数から五行を導き出して性格・運勢を判断</li>
                <li>バランスの良い五行配置が理想的</li>
                <li>日常生活でも五行の知識を活用可能</li>
              </ul>
            </div>
          </article>

          {/* CTA */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">あなたの名前の五行バランスを調べてみませんか？</h3>
              <p className="text-muted-foreground mb-6">
                五行理論に基づいた本格的な姓名判断で、あなたの運勢を詳しく分析します
              </p>
              <Button size="lg" asChild>
                <Link href="/">無料で姓名判断を始める</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 関連記事 */}
          <section>
            <h2 className="text-2xl font-bold mb-6">関連記事</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">
                    基礎知識
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">
                    <Link href="/articles/kyujitai-seimeihandan" className="hover:text-primary">
                      姓名判断は「旧字体」で占うのが正しい理由
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    なぜ姓名判断では旧字体を使うのか？その歴史的背景と理論的根拠を解説
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">
                    運勢
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">
                    <Link href="/articles/rokuseisensei-fortune" className="hover:text-primary">
                      六星占術で読み解く運気の流れ
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">生年月日から導き出される運気パターンと活用法をご紹介</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
