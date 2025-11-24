import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Eye, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "六星占術で読み解く運気の流れ | まいにち姓名判断",
  description:
    "生年月日から導き出される六星占術の運気パターンと、日々の運勢の活用法をご紹介。土星、金星、火星、天王星、木星、水星の特徴と運気の流れを詳しく解説します。",
  keywords: "六星占術, 運気, 生年月日, 土星, 金星, 火星, 天王星, 木星, 水星, 運勢, 占い, 活用法",
  openGraph: {
    title: "六星占術で読み解く運気の流れ",
    description: "生年月日から導き出される六星占術の運気パターンと、日々の運勢の活用法をご紹介。",
    type: "article",
    url: "https://seimei.app/articles/rokuseisensei-fortune",
    siteName: "まいにち姓名判断",
    locale: "ja_JP",
  },
  authors: [{ name: "姓名判断専門家" }],
  publishedTime: "2025-06-20T00:00:00.000Z",
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "六星占術で読み解く運気の流れ",
  description: "生年月日から導き出される六星占術の運気パターンと、日々の運勢の活用法をご紹介。",
  author: {
    "@type": "Person",
    name: "姓名判断専門家",
  },
  datePublished: "2025-06-20T00:00:00.000Z",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://nameanalysis216.vercel.app/articles/rokuseisensei-fortune",
  },
}

export default function RokuseiArticlePage() {
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
            <span>六星占術で読み解く運気の流れ</span>
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
              <Badge variant="secondary">運勢</Badge>
              <Badge variant="destructive">人気記事</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">六星占術で読み解く運気の流れ</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                読了時間: 6分
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                3,156回閲覧
              </div>
              <div>公開日: 2025年6月20日</div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              六星占術は、生年月日から導き出される6つの星によって、その人の運気の流れを読み解く占術です。土星、金星、火星、天王星、木星、水星それぞれの特徴と、運気を活用する方法を詳しく解説します。
            </p>
          </header>

          {/* 目次 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">📋 この記事の内容</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <Link href="#section1" className="hover:text-primary">
                    六星占術とは？
                  </Link>
                </li>
                <li>
                  <Link href="#section2" className="hover:text-primary">
                    6つの星の特徴と性格
                  </Link>
                </li>
                <li>
                  <Link href="#section3" className="hover:text-primary">
                    運気の12年周期
                  </Link>
                </li>
                <li>
                  <Link href="#section4" className="hover:text-primary">
                    日々の運勢の活用法
                  </Link>
                </li>
                <li>
                  <Link href="#section5" className="hover:text-primary">
                    六星占術と姓名判断の組み合わせ
                  </Link>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none mb-12">
            <div id="section1" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">1. 六星占術とは？</h2>
              <p className="text-base leading-relaxed mb-4">
                六星占術は、生年月日から算出される「運命数」によって、その人を6つの星のいずれかに分類する占術です。各星には12年周期の運気の流れがあり、人生の浮き沈みを予測することができます。
              </p>
              <div className="bg-background p-4 rounded border-l-4 border-primary">
                <p className="text-sm font-medium mb-2">六星占術の特徴：</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>生年月日のみで占える手軽さ</li>
                  <li>12年周期の明確な運気パターン</li>
                  <li>具体的な行動指針が得られる</li>
                  <li>相性診断にも活用可能</li>
                </ul>
              </div>
            </div>

            <div id="section2" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">2. 6つの星の特徴と性格</h2>

              <div className="space-y-4">
                <div className="bg-background p-4 rounded border-l-4 border-yellow-500">
                  <h3 className="font-bold text-lg mb-2">🪐 土星人</h3>
                  <p className="text-sm">
                    堅実で責任感が強く、コツコツと努力を重ねるタイプ。安定を好み、信頼される存在。
                  </p>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-pink-500">
                  <h3 className="font-bold text-lg mb-2">⭐ 金星人</h3>
                  <p className="text-sm">
                    美的センスに優れ、人を惹きつける魅力を持つ。芸術的才能があり、人間関係を大切にする。
                  </p>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-red-500">
                  <h3 className="font-bold text-lg mb-2">🔥 火星人</h3>
                  <p className="text-sm">
                    情熱的で行動力があり、リーダーシップを発揮する。チャレンジ精神旺盛で、困難を乗り越える力がある。
                  </p>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-purple-500">
                  <h3 className="font-bold text-lg mb-2">🌟 天王星人</h3>
                  <p className="text-sm">
                    独創性があり、常識にとらわれない発想を持つ。変化を好み、新しいことに挑戦するのが得意。
                  </p>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-bold text-lg mb-2">🌳 木星人</h3>
                  <p className="text-sm">
                    おおらかで包容力があり、人を育てるのが上手。正義感が強く、社会貢献への意識が高い。
                  </p>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">💧 水星人</h3>
                  <p className="text-sm">
                    知的で分析力に優れ、コミュニケーション能力が高い。柔軟性があり、状況に応じて適応する。
                  </p>
                </div>
              </div>
            </div>

            <div id="section3" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">3. 運気の12年周期</h2>
              <p className="text-base leading-relaxed mb-4">
                六星占術では、12年を1つの周期として運気が循環します。各年には特定の意味があり、その年に適した行動を取ることで運気を最大限に活用できます。
              </p>

              <div className="bg-background p-4 rounded border-l-4 border-primary mb-4">
                <h3 className="font-bold mb-3">12年周期の流れ：</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>1年目：種子</strong> - 新しいスタートの年
                  </div>
                  <div>
                    <strong>2年目：緑生</strong> - 成長の基盤を作る年
                  </div>
                  <div>
                    <strong>3年目：立花</strong> - 才能が開花する年
                  </div>
                  <div>
                    <strong>4年目：健弱</strong> - 健康に注意が必要な年
                  </div>
                  <div>
                    <strong>5年目：達成</strong> - 目標達成の年
                  </div>
                  <div>
                    <strong>6年目：乱気</strong> - 変化と混乱の年
                  </div>
                  <div>
                    <strong>7年目：再会</strong> - 人との出会いが重要な年
                  </div>
                  <div>
                    <strong>8年目：財成</strong> - 金運が上昇する年
                  </div>
                  <div>
                    <strong>9年目：安定</strong> - 安定と充実の年
                  </div>
                  <div>
                    <strong>10年目：陰影</strong> - 内面を見つめ直す年
                  </div>
                  <div>
                    <strong>11年目：停止</strong> - 休息と準備の年
                  </div>
                  <div>
                    <strong>12年目：減退</strong> - 次の周期への準備の年
                  </div>
                </div>
              </div>
            </div>

            <div id="section4" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">4. 日々の運勢の活用法</h2>
              <p className="text-base leading-relaxed mb-4">
                六星占術は年単位だけでなく、月や日の運勢も読み解くことができます。日々の生活に活かす方法をご紹介します。
              </p>

              <div className="space-y-4">
                <div className="bg-background p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-bold mb-2">🌟 運気の良い日の活用法</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>重要な決断や契約を行う</li>
                    <li>新しいことにチャレンジする</li>
                    <li>人との出会いを大切にする</li>
                    <li>投資や買い物のタイミングとする</li>
                  </ul>
                </div>

                <div className="bg-background p-4 rounded border-l-4 border-yellow-500">
                  <h3 className="font-bold mb-2">⚠️ 運気の注意日の過ごし方</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>無理をせず、現状維持を心がける</li>
                    <li>健康管理に特に注意する</li>
                    <li>感情的な判断を避ける</li>
                    <li>準備や計画に時間を使う</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="section5" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">5. 六星占術と姓名判断の組み合わせ</h2>
              <p className="text-base leading-relaxed mb-4">
                六星占術と
                <Link href="/" className="text-primary hover:underline">
                  姓名判断
                </Link>
                を組み合わせることで、より詳細で正確な運勢診断が可能になります。
              </p>

              <div className="bg-background p-4 rounded border-l-4 border-primary">
                <h3 className="font-bold mb-3">組み合わせのメリット：</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>生まれ持った性質</strong>：六星占術で基本性格を把握
                  </li>
                  <li>
                    <strong>名前の影響</strong>：姓名判断で名前が与える運勢を分析
                  </li>
                  <li>
                    <strong>時期の選択</strong>：六星占術で最適なタイミングを判断
                  </li>
                  <li>
                    <strong>改名の効果</strong>：姓名判断で改名による運勢変化を予測
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg mb-8 border-l-4 border-primary">
              <blockquote className="text-lg font-medium italic">
                「六星占術は、人生の波を読み解く羅針盤のような存在です。」
                <br />
                運気の流れを理解し、適切なタイミングで行動することで、より充実した人生を送ることができるでしょう。
              </blockquote>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">まとめ</h2>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>六星占術は生年月日から6つの星に分類する占術</li>
                <li>各星には独特の性格と特徴がある</li>
                <li>12年周期で運気が循環する</li>
                <li>日々の運勢を活用して最適な行動を選択</li>
                <li>姓名判断との組み合わせでより詳細な分析が可能</li>
              </ul>
            </div>
          </article>

          {/* CTA */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">あなたの六星と運気の流れを調べてみませんか？</h3>
              <p className="text-muted-foreground mb-6">
                生年月日から導き出される六星占術と姓名判断を組み合わせた総合運勢診断
              </p>
              <Button size="lg" asChild>
                <Link href="/">無料で運勢診断を始める</Link>
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
                    理論
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">
                    <Link href="/articles/gogyo-five-elements" className="hover:text-primary">
                      五行思想と姓名判断の深い関係
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    木火土金水の五行がどのように姓名判断に影響するのか解説
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
