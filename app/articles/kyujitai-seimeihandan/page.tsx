import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Eye, BookOpen, Share2 } from "lucide-react"

export const metadata: Metadata = {
  title: "姓名判断は「旧字体」で占うのが正しい理由 | まいにち姓名判断",
  description:
    "なぜ姓名判断では旧字体を使うのか？歴史的背景、理論的根拠、漢字の本質から詳しく解説。専門家も採用する旧字体の重要性を理解し、正確な姓名判断を体験しましょう。",
  keywords: "姓名判断, 旧字体, 新字体, 画数, 占い, 理由, 歴史, 専門家, 正確性, 運勢, 五格, 天格, 人格, 地格",
  openGraph: {
    title: "姓名判断は「旧字体」で占うのが正しい理由",
    description: "なぜ姓名判断では旧字体を使うのか？歴史的背景、理論的根拠、漢字の本質から詳しく解説。",
    type: "article",
    url: "https://seimei.app/articles/kyujitai-seimeihandan",
    siteName: "まいにち姓名判断",
    locale: "ja_JP",
    images: [
      {
        url: "/og-image-kyujitai.png",
        width: 1200,
        height: 630,
        alt: "姓名判断は旧字体で占うのが正しい理由",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "姓名判断は「旧字体」で占うのが正しい理由",
    description: "なぜ姓名判断では旧字体を使うのか？歴史的背景、理論的根拠、漢字の本質から詳しく解説。",
    images: ["/og-image-kyujitai.png"],
    creator: "@nameanalysis_jp",
    site: "@nameanalysis_jp",
  },
  authors: [{ name: "姓名判断専門家", url: "https://seimei.app" }],
  publisher: "まいにち姓名判断",
  publishedTime: "2025-06-15T00:00:00.000Z",
  modifiedTime: "2025-06-21T00:00:00.000Z",
  category: "姓名判断",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://seimei.app/articles/kyujitai-seimeihandan",
  },
}

// 構造化データ
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "姓名判断は「旧字体」で占うのが正しい理由",
  description:
    "なぜ姓名判断では旧字体を使うのか？歴史的背景、理論的根拠、漢字の本質から詳しく解説。専門家も採用する旧字体の重要性を理解しましょう。",
  image: "https://seimei.app/og-image-kyujitai.png",
  author: {
    "@type": "Person",
    name: "姓名判断専門家",
    url: "https://seimei.app",
  },
  publisher: {
    "@type": "Organization",
    name: "まいにち姓名判断",
    logo: {
      "@type": "ImageObject",
      url: "https://seimei.app/logo.png",
    },
  },
  datePublished: "2025-06-15T00:00:00.000Z",
  dateModified: "2025-06-21T00:00:00.000Z",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://seimei.app/articles/kyujitai-seimeihandan",
  },
  articleSection: "姓名判断",
  keywords: ["姓名判断", "旧字体", "新字体", "画数", "占い", "理由", "歴史", "専門家"],
  wordCount: 1200,
  inLanguage: "ja-JP",
}

export default function KyujitaiArticlePage() {
  return (
    <>
      {/* 構造化データ */}
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
            <span>姓名判断は「旧字体」で占うのが正しい理由</span>
          </nav>

          {/* 戻るボタン */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事一覧に戻る
            </Link>
          </Button>

          {/* 記事ヘッダー */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">基礎知識</Badge>
              <Badge variant="destructive">人気記事</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">姓名判断は「旧字体」で占うのが正しい理由</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                読了時間: 5分
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                2,847回閲覧
              </div>
              <div>公開日: 2025年6月15日</div>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                シェア
              </Button>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              姓名判断に興味を持つ方なら、「旧字体で占うべき」という言葉を耳にしたことがあるかもしれません。なぜ、現代の新字体ではなく、旧字体が重視されるのでしょうか？その理由をわかりやすく解説します。
            </p>
          </header>

          {/* 目次 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">📋 この記事の内容</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <Link href="#section1" className="hover:text-primary">
                    姓名判断のルーツは旧字体にあり
                  </Link>
                </li>
                <li>
                  <Link href="#section2" className="hover:text-primary">
                    画数のズレが運勢判断に影響する
                  </Link>
                </li>
                <li>
                  <Link href="#section3" className="hover:text-primary">
                    旧字体は「本来の意味」と「エネルギー」を持つ
                  </Link>
                </li>
                <li>
                  <Link href="#section4" className="hover:text-primary">
                    多くの専門家や流派が旧字体を採用
                  </Link>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none mb-12">
            <div id="section1" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">1. 姓名判断のルーツは旧字体にあり</h2>
              <p className="text-base leading-relaxed">
                <Link href="/" className="text-primary hover:underline">
                  姓名判断
                </Link>
                は明治時代から大正・昭和初期にかけて体系化されました。当時使われていた漢字は、今の「新字体」ではなく、画数の多い「旧字体」が主流です。姓名判断の基本理論や吉凶判断の法則は、この旧字体の画数をもとに作られているのです。
              </p>
            </div>

            <div id="section2" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">2. 画数のズレが運勢判断に影響する</h2>
              <p className="text-base leading-relaxed mb-4">例えば「斉藤」という名字を例に挙げましょう。</p>
              <div className="bg-background p-4 rounded border-l-4 border-primary mb-4">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>旧字体「齊藤」</strong>…「齊」は17画、「藤」は18画
                  </li>
                  <li>
                    <strong>新字体「斉藤」</strong>…「斉」は8画、「藤」は18画
                  </li>
                </ul>
              </div>
              <p className="text-base leading-relaxed">
                このように、旧字体と新字体では画数が大きく異なります。姓名判断は画数のバランスや
                <Link href="/" className="text-primary hover:underline">
                  五格（天格・人格・地格・外格・総格）
                </Link>
                で運勢を読み解くため、1画でもズレると全く違う結果になることがあります。つまり、旧字体を使わないと、本来の運命を正しく読み解けなくなってしまうのです。
              </p>
            </div>

            <div id="section3" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">3. 旧字体は「本来の意味」と「エネルギー」を持つ</h2>
              <p className="text-base leading-relaxed">
                漢字は、本来の形にその意味や力が込められていると考えられています。旧字体は長い歴史の中で受け継がれてきた「本来の漢字の姿」です。新字体は戦後の簡略化で生まれたもので、画数も意味合いも異なる場合があります。
                <Link href="/" className="text-primary hover:underline">
                  姓名判断
                </Link>
                では「その人が持つ本質や運命」を読み解くため、漢字本来のエネルギーを重視し、旧字体で占うのが正しいとされているのです。
              </p>
            </div>

            <div id="section4" className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">4. 多くの専門家や流派が旧字体を採用</h2>
              <p className="text-base leading-relaxed">
                実際に有名な姓名判断の流派や専門家は、ほとんどが旧字体での鑑定を採用しています。これは「本来の姓名判断の理論に忠実であること」「より正確な運勢判断ができること」が理由です。当サイトでも、この伝統的な手法を採用し、
                <Link href="/" className="text-primary hover:underline">
                  正確な姓名判断
                </Link>
                を提供しています。
              </p>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg mb-8 border-l-4 border-primary">
              <blockquote className="text-lg font-medium italic">
                「姓名判断は旧字体で占うのが正しい」
                <br />
                それは、歴史的背景・理論的根拠・漢字の本質という3つの理由から、誰もが納得できる事実なのです。
              </blockquote>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">まとめ</h2>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>姓名判断の理論は旧字体で作られている</li>
                <li>画数の違いが運勢判断に大きく影響する</li>
                <li>旧字体には漢字本来の意味と力が込められている</li>
                <li>専門家・流派も旧字体を採用</li>
              </ul>
              <p className="text-base leading-relaxed mt-4">
                だからこそ、「姓名判断は旧字体で占うのが正しい」のです。「そうか！」と納得できた方は、ぜひご自身の名前も旧字体で調べてみてください。きっと新たな発見があるはずです。
              </p>
            </div>
          </article>

          {/* 内部リンク強化 */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold mb-4">関連する姓名判断の知識</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/articles/tengaku-kyousuu-myouji"
                className="block p-4 bg-white rounded border hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-blue-600 mb-2">天格が吉数にならない苗字の対処法</h4>
                <p className="text-sm text-gray-600">苗字の画数が凶数でも、他の格数でバランスを取る方法を解説</p>
              </Link>
              <Link
                href="/articles/gogyo-five-elements"
                className="block p-4 bg-white rounded border hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-blue-600 mb-2">五行思想と姓名判断の関係</h4>
                <p className="text-sm text-gray-600">木火土金水の五行が姓名判断にどう影響するかを詳しく解説</p>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">あなたの名前を旧字体で鑑定してみませんか？</h3>
              <p className="text-muted-foreground mb-6">
                この記事で学んだ知識を活かして、正確な姓名判断を体験してください
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
