import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogArticleBySlug } from "@/lib/blog-article-generator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Twitter } from "lucide-react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { generateBreadcrumbStructuredData, generateArticleStructuredData } from "@/lib/structured-data"
import { seoConfig } from "@/lib/seo-config"

function getScoreRank(score: number): string {
  if (score >= 90) return "S"
  if (score >= 80) return "A"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  if (score >= 50) return "D"
  return "E"
}

interface PageProps {
  params: Promise<{
    slug: string
  }> | {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Next.js 15対応: paramsがPromiseの場合に対応
  const resolvedParams = await Promise.resolve(params)
  const slug = decodeURIComponent(resolvedParams.slug)
  
  const article = await getBlogArticleBySlug(slug)

  if (!article) {
    return {
      title: "記事が見つかりません",
    }
  }

  const articleUrl = `${seoConfig.siteUrl}/articles/${encodeURIComponent(slug)}`

  return {
    title: `${article.title} | まいにち姓名判断`,
    description: article.description,
    keywords: article.keywords.join(", "),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: articleUrl,
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
  // Next.js 15対応: paramsがPromiseの場合に対応
  const resolvedParams = await Promise.resolve(params)
  const slug = decodeURIComponent(resolvedParams.slug)
  
  const article = await getBlogArticleBySlug(slug)

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

  // パンくずリストの構造化データ
  const breadcrumbItems = [
    { name: "ホーム", url: `${seoConfig.siteUrl}/` },
    { name: "記事一覧", url: `${seoConfig.siteUrl}/articles` },
    { name: article.title, url: `${seoConfig.siteUrl}/articles/${encodeURIComponent(slug)}` },
  ]
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbItems)

  // 記事の構造化データ
  const articleUrl = `${seoConfig.siteUrl}/articles/${encodeURIComponent(slug)}`
  const articleStructuredData = generateArticleStructuredData({
    title: article.title,
    description: article.description,
    url: articleUrl,
    publishedTime: article.publishedAt.toISOString(),
    image: `/api/blog-articles/image?slug=${encodeURIComponent(slug)}`,
  })

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{article.description}</p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
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
              className="flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              <Twitter className="h-4 w-4" />
              <span>Xで共有</span>
            </a>
          )}
        </div>

        {/* 縦書き名前画像 */}
        <div className="mb-8 bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-amber-900/20 dark:via-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-shrink-0">
              <img
                src={`/api/blog-articles/image?slug=${encodeURIComponent(article.slug)}`}
                alt={`${article.lastName}${article.firstName}さんの縦書き名前`}
                className="h-64 md:h-80 w-auto object-contain drop-shadow-lg"
                loading="eager"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                {article.lastName} {article.firstName}さん
              </h2>
              {article.analysisResult?.totalScore !== undefined && (
                <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  <span className="font-semibold">総合評価: </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {article.analysisResult.totalScore}点
                  </span>
                  <span className="ml-2 text-sm">
                    ({getScoreRank(article.analysisResult.totalScore)}ランク)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* キーワード */}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.keywords.slice(0, 10).map((keyword) => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* 記事本文 */}
      <Card className="shadow-lg">
        <CardContent className="prose prose-lg prose-slate max-w-none pt-8 pb-12 px-6 md:px-12">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-7 text-gray-700 dark:text-gray-300">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-7 text-gray-700 dark:text-gray-300">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900 dark:text-gray-100">
                  {children}
                </strong>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <div className="mt-12">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">関連記事</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/articles/gakusuu-seimeihandan-kihon" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors flex items-center gap-2"
                >
                  <span>→</span>
                  <span>画数でわかる姓名判断の基本と使い方</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/articles/kyujitai-seimeihandan" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors flex items-center gap-2"
                >
                  <span>→</span>
                  <span>旧字体で行う本格姓名判断の理由</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/articles" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors flex items-center gap-2 font-semibold"
                >
                  <span>→</span>
                  <span>記事一覧へ戻る</span>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}

