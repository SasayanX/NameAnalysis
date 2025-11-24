import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react"

export const metadata: Metadata = {
  title: "天格が吉数にならない苗字のとき、どう考える？ | 姓名判断の対処法 | まいにち姓名判断",
  description:
    "姓名判断で天格が凶数になってしまう苗字の場合、どのように対処すべきか？他の格数でバランスを取る方法を詳しく解説します。",
  keywords: "天格, 苗字, 姓名判断, 五格, 凶数, 対処法, バランス, 総格, 人格, 家系運",
  openGraph: {
    title: "天格が吉数にならない苗字のとき、どう考える？",
    description: "姓名判断で天格が凶数になってしまう苗字の場合の対処法を詳しく解説します。",
    type: "article",
    url: "https://seimei.app/articles/tengaku-kyousuu-myouji",
    siteName: "まいにち姓名判断",
    locale: "ja_JP",
    publishedTime: "2025-06-26T00:00:00.000Z",
    section: "基礎知識",
    tags: ["天格", "苗字", "五格", "バランス", "対処法"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://seimei.app/articles/tengaku-kyousuu-myouji",
  },
}

// 構造化データ
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "天格が吉数にならない苗字のとき、どう考える？",
  description:
    "姓名判断で天格が凶数になってしまう苗字の場合、どのように対処すべきか？他の格数でバランスを取る方法を詳しく解説します。",
  url: "https://nameanalysis216.vercel.app/articles/tengaku-kyousuu-myouji",
  datePublished: "2025-06-26T00:00:00.000Z",
  dateModified: "2025-06-26T00:00:00.000Z",
  author: {
    "@type": "Person",
    name: "金雨輝龍",
  },
  publisher: {
    "@type": "Organization",
    name: "まいにち姓名判断",
    logo: {
      "@type": "ImageObject",
      url: "https://seimei.app/images/logo.png",
    },
  },
  image: "https://seimei.app/images/og-tengaku.png",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://nameanalysis216.vercel.app/articles/tengaku-kyousuu-myouji",
  },
  articleSection: "基礎知識",
  keywords: ["天格", "苗字", "姓名判断", "五格", "凶数", "対処法", "バランス"],
}

export default function TengakuKyousuuMyoujiPage() {
  return (
    <>
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* パンくずナビ */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">
              ホーム
            </Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-primary">
              コラム・記事
            </Link>
            <span>/</span>
            <span className="text-foreground">天格が吉数にならない苗字のとき、どう考える？</span>
          </nav>

          {/* 戻るボタン */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            記事一覧に戻る
          </Link>

          {/* 記事ヘッダー */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">基礎知識</Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  2025年6月26日
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  6分で読める
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">天格が吉数にならない苗字のとき、どう考える？</h1>
            <p className="text-xl text-muted-foreground">
              姓名判断で天格が凶数になってしまう苗字の場合、どのように対処すべきか？他の格数でバランスを取る方法を詳しく解説します。
            </p>
          </header>

          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none">
            <p>
              姓名判断では、名字と名前の画数から「天格」「人格」「地格」「外格」「総格」の五格を算出し、それぞれの吉凶を見て運勢を判断します。このうち「天格」は名字の合計画数で決まり、家系や先祖から受け継がれた運勢、いわば"生まれ持った基盤"を表します。
            </p>

            <h2>天格は変えられない運命</h2>
            <p>
              天格は自分の意志や努力で変えることができません。名字は先祖代々受け継がれてきたものであり、個人が自由に選べるものではないため、「どうしても天格が吉数にならない苗字」も存在します。
            </p>

            <h2>天格の吉凶はどこまで気にするべきか</h2>
            <p>
              姓名判断の世界では「天格は個人の運勢に直接影響しない」とする考え方が主流です。天格は家系運・先天的な運勢を示しますが、人格や地格、総格など他の格がその人自身の性格や人生により大きく影響します。特に「人格」はその人の主運として最も重視される格です。
            </p>

            <h2>どうしても天格が吉数にならない場合は？</h2>

            <h3>他の格数でバランスをとる</h3>
            <p>
              天格が凶数でも、名前の付け方で「人格」「地格」「外格」などを吉数に調整することで、全体の運勢バランスを良くすることができます。
            </p>

            <h3>総格は大吉をめざしましょう</h3>
            <p>
              総格は人生全体の運勢を左右する重要な格です。天格が吉数でなくても、総格を大吉数に整えることで、全体の運勢を大きく底上げできます。
            </p>

            <h3>家系の流れを大切にする</h3>
            <p>
              天格は家系の流れそのもの。吉凶に一喜一憂せず、「ご先祖から受け継いだもの」として前向きに受け止める姿勢も大切です。
            </p>

            <h3>姓名判断は総合的に判断する</h3>
            <p>
              五格のうち一つが凶数でも、他の格でカバーできれば問題ありません。むしろ全体のバランスや、名前全体の響き・意味を重視するのが現代の主流です。
            </p>

            <h2>まとめ</h2>
            <p>
              天格は変えられない家系の運命を示すものであり、個人の努力や名付けでコントロールできるものではありません。どうしても吉数にならない場合は、他の格数を吉数に整え、
              <strong>特に総格は大吉をめざす</strong>
              ことが大切です。姓名判断は「運勢の参考」として活用し、前向きな気持ちで自分の名前と向き合いましょう。
            </p>

            <div className="bg-muted p-4 rounded-lg mt-8">
              <p className="text-sm text-muted-foreground mb-0">
                この記事は姓名判断の基礎知識として参考程度にお読みください。実際の名付けや改名については、専門家にご相談されることをおすすめします。
              </p>
            </div>
          </article>

          {/* タグ */}
          <div className="flex items-center gap-2 mt-8 mb-8">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {["天格", "苗字", "五格", "バランス", "対処法"].map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* 関連記事 */}
          <section className="mt-12">
            <h3 className="text-2xl font-bold mb-6">関連記事</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    基礎知識
                  </Badge>
                  <CardTitle className="text-lg">
                    <Link href="/articles/kyujitai-seimeihandan" className="hover:text-primary transition-colors">
                      姓名判断は「旧字体」で占うのが正しい理由
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    なぜ姓名判断では旧字体を使うのか？その歴史的背景と理論的根拠を詳しく解説します。
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    理論
                  </Badge>
                  <CardTitle className="text-lg">
                    <Link href="/articles/gogyo-five-elements" className="hover:text-primary transition-colors">
                      五行思想と姓名判断の深い関係
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    木火土金水の五行がどのように姓名判断に影響するのか、その奥深い世界を探ります。
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mt-12 p-8 bg-muted rounded-lg">
            <h3 className="text-2xl font-bold mb-4">あなたの名前の五格バランスを確認してみませんか？</h3>
            <p className="text-muted-foreground mb-6">
              天格が凶数でも、他の格数でバランスを取ることができます。まずは無料で姓名判断をお試しください。
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              無料で姓名判断を始める
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
