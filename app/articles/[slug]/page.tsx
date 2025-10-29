import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogArticleBySlug } from "@/lib/blog-article-generator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Twitter } from "lucide-react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getBlogArticleBySlug(params.slug)

  if (!article) {
    return {
      title: "記事が見つかりません",
    }
  }

  return {
    title: `${article.title} | まいにち姓名判断`,
    description: article.description,
    keywords: article.keywords.join(", "),
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const article = await getBlogArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const fullName = `${article.lastName}${article.firstName}`
  const publishedDate = new Date(article.publishedAt)
  const formattedDate = publishedDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* パンくずリスト */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">ホーム</Link>
        {" > "}
        <Link href="/articles" className="hover:text-foreground">記事一覧</Link>
        {" > "}
        <span className="text-foreground">{article.title}</span>
      </nav>

      {/* 記事ヘッダー */}
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          {article.category}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{article.description}</p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>約{Math.ceil(article.content.length / 500)}分で読めます</span>
          </div>
          {article.tweetId && (
            <a
              href={`https://twitter.com/i/web/status/${article.tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              <Twitter className="h-4 w-4" />
              <span>Xで共有</span>
            </a>
          )}
        </div>

        {/* キーワード */}
        <div className="flex flex-wrap gap-2 mt-4">
          {article.keywords.slice(0, 10).map((keyword) => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* 記事本文 */}
      <Card>
        <CardContent className="prose prose-lg max-w-none pt-6">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <div className="mt-12">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">関連記事</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/articles/gakusuu-seimeihandan-kihon" className="text-blue-600 hover:underline">
                  画数でわかる姓名判断の基本と使い方
                </Link>
              </li>
              <li>
                <Link href="/articles/kyujitai-seimeihandan" className="text-blue-600 hover:underline">
                  旧字体で行う本格姓名判断の理由
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-blue-600 hover:underline">
                  記事一覧へ戻る
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

