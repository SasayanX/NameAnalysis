// ブログ記事一覧を取得するAPI（デバッグ用）
import { NextResponse } from 'next/server'
import { getLatestBlogArticles } from '@/lib/blog-article-generator'

export async function GET() {
  try {
    const articles = await getLatestBlogArticles(50)
    
    return NextResponse.json({
      success: true,
      count: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        lastName: a.lastName,
        firstName: a.firstName,
        publishedAt: a.publishedAt,
        url: `/articles/${encodeURIComponent(a.slug)}`,
      })),
    })
  } catch (error: any) {
    console.error('ブログ記事一覧取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
      },
      { status: 500 }
    )
  }
}

