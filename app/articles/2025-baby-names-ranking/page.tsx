import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, Baby, Heart, Sparkles } from "lucide-react"
import { generateArticleStructuredData } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "2025年赤ちゃん名前ランキング完全版｜姓名判断で選ぶ最高の名前 | まいにち姓名判断",
  description:
    "2025年最新の赤ちゃん名前ランキングを姓名判断の視点で徹底解説。男の子・女の子別TOP10と画数・運勢分析で最適な名前選びをサポート。無料姓名判断付き。",
  keywords: "赤ちゃん名前ランキング2025,姓名判断,名付け,画数,運勢,男の子名前,女の子名前,人気名前,無料診断",
  openGraph: {
    title: "2025年赤ちゃん名前ランキング完全版｜姓名判断で選ぶ最高の名前",
    description:
      "2025年最新の赤ちゃん名前ランキングを姓名判断の視点で徹底解説。男の子・女の子別TOP10と画数・運勢分析で最適な名前選びをサポート。",
    type: "article",
    url: "https://seimei.app/articles/2025-baby-names-ranking",
    siteName: "まいにち姓名判断",
    locale: "ja_JP",
    images: [
      {
        url: "https://seimei.app/images/2025-baby-names-og.png",
        width: 1200,
        height: 630,
        alt: "2025年赤ちゃん名前ランキング",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://seimei.app/articles/2025-baby-names-ranking",
  },
}

// 構造化データ
const structuredData = generateArticleStructuredData({
  title: "2025年赤ちゃん名前ランキング完全版｜姓名判断で選ぶ最高の名前",
  description:
    "2025年最新の赤ちゃん名前ランキングを姓名判断の視点で徹底解説。男の子・女の子別TOP10と画数・運勢分析で最適な名前選びをサポート。",
  url: "https://nameanalysis216.vercel.app/articles/2025-baby-names-ranking",
  publishedTime: "2025-06-26T00:00:00+09:00",
  modifiedTime: "2025-06-26T00:00:00+09:00",
  image: "/images/2025-baby-names-og.png",
})

const boyNames = [
  { rank: 1, name: "碧", reading: "あおい", strokes: 14, rating: 4, fortune: "芸術性・感受性豊か" },
  { rank: 2, name: "蓮", reading: "れん", strokes: 13, rating: 5, fortune: "清廉・精神的成長" },
  { rank: 3, name: "陽翔", reading: "はると", strokes: "12+12", rating: 4, fortune: "明朗・リーダーシップ" },
  { rank: 4, name: "湊", reading: "みなと", strokes: 12, rating: 4, fortune: "協調性・人望" },
  { rank: 5, name: "陸", reading: "りく", strokes: 11, rating: 3, fortune: "堅実・努力家" },
]

const girlNames = [
  { rank: 1, name: "葵", reading: "あおい", strokes: 12, rating: 4, fortune: "気品・芸術的才能" },
  { rank: 2, name: "陽葵", reading: "ひまり", strokes: "12+12", rating: 4, fortune: "明朗・社交性" },
  { rank: 3, name: "紬", reading: "つむぎ", strokes: 11, rating: 3, fortune: "個性・創造力" },
  { rank: 4, name: "凛", reading: "りん", strokes: 15, rating: 5, fortune: "強さ・美しさ" },
  { rank: 5, name: "美桜", reading: "みお", strokes: "9+10", rating: 4, fortune: "美的感覚・優雅さ" },
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function BabyNamesRanking2025() {
  return (
    <>
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Baby className="h-8 w-8 text-pink-500" />
              <Badge variant="secondary" className="text-lg px-4 py-2">
                2025年最新
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">赤ちゃん名前ランキング完全版</h1>
            <p className="text-xl text-muted-foreground mb-6">姓名判断で選ぶ最高の名前</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                読了時間: 8分
              </div>
              <div>更新: 2025年6月26日</div>
            </div>
          </div>

          {/* 導入文 */}
          <div className="mb-12 p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg">
            <p className="text-lg leading-relaxed">
              2025年も赤ちゃんの名付けトレンドは大きな注目を集めています。今年は「自然」「優しさ」「春」「新緑」など、時代や季節感を意識した名前が例年以上に人気となっています。
            </p>
            <p className="text-lg leading-relaxed mt-4">
              この記事では、最新の公式データをもとに
              <strong className="text-primary">姓名判断の専門的視点</strong>
              から2025年の人気名前を分析し、あなたの赤ちゃんに最適な名前選びをサポートします。
            </p>
          </div>

          {/* 男の子ランキング */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h2 className="text-3xl font-bold">男の子の人気名前ランキングTOP5</h2>
            </div>
            <div className="space-y-4">
              {boyNames.map((name) => (
                <Card key={name.rank} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 font-bold text-xl rounded-full">
                          {name.rank}
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{name.name}</CardTitle>
                          <CardDescription className="text-lg">（{name.reading}）</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">姓名判断評価</span>
                          <StarRating rating={name.rating} />
                        </div>
                        <div className="text-sm text-muted-foreground">画数: {name.strokes}画</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{name.fortune}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 女の子ランキング */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-pink-500" />
              <h2 className="text-3xl font-bold">女の子の人気名前ランキングTOP5</h2>
            </div>
            <div className="space-y-4">
              {girlNames.map((name) => (
                <Card key={name.rank} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 font-bold text-xl rounded-full">
                          {name.rank}
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{name.name}</CardTitle>
                          <CardDescription className="text-lg">（{name.reading}）</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">姓名判断評価</span>
                          <StarRating rating={name.rating} />
                        </div>
                        <div className="text-sm text-muted-foreground">画数: {name.strokes}画</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{name.fortune}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 姓名判断ポイント */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">姓名判断で最適な名前を選ぶ5つのポイント</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      1
                    </span>
                    画数の吉凶を確認
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 総格（総画数）が吉数か</li>
                    <li>• 人格・地格・外格のバランス</li>
                    <li>• 五格すべての調和</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      2
                    </span>
                    音の響きと意味
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 呼びやすく覚えやすい</li>
                    <li>• 漢字の意味が前向き</li>
                    <li>• 家族の願いを込められる</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      3
                    </span>
                    苗字との相性
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 苗字と名前の画数バランス</li>
                    <li>• 音の響きの調和</li>
                    <li>• 全体的な印象</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      4
                    </span>
                    将来性を考慮
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 大人になっても違和感がない</li>
                    <li>• 国際的にも通用する</li>
                    <li>• 職業選択に影響しない</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mb-12 p-8 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">あなたの赤ちゃんの名前を姓名判断で確認</h3>
            <p className="text-muted-foreground mb-6">
              候補の名前が決まったら、無料の姓名判断で運勢を確認してみましょう。
              <br />
              画数・五格・運勢を詳しく分析します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/">無料で姓名判断を始める</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/subscribe">詳細分析プランを見る</Link>
              </Button>
            </div>
          </div>

          {/* 関連記事 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">関連記事</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href="/articles/kyujitai-seimeihandan" className="hover:text-primary transition-colors">
                      旧字体による正確な姓名判断
                    </Link>
                  </CardTitle>
                  <CardDescription>なぜ姓名判断では旧字体を使うのか？その理由を解説</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href="/articles/gogyo-five-elements" className="hover:text-primary transition-colors">
                      五行思想と名前の相性
                    </Link>
                  </CardTitle>
                  <CardDescription>木火土金水の五行がどのように名前に影響するか</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href="/articles/tengaku-kyousuu-myouji" className="hover:text-primary transition-colors">
                      天格が凶数の苗字の対処法
                    </Link>
                  </CardTitle>
                  <CardDescription>天格が吉数にならない場合のバランスの取り方</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
