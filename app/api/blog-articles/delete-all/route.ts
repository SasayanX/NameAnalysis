// すべてのブログ記事を削除するAPI（GET/POST/DELETE対応）
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  return await deleteAllArticles()
}

export async function POST(request: NextRequest) {
  return await deleteAllArticles()
}

export async function DELETE(request: NextRequest) {
  return await deleteAllArticles()
}

async function deleteAllArticles() {
  try {
    const supabase = getSupabaseClient()

    // まずすべての記事を取得
    const { data: articles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, slug, title')

    if (fetchError) {
      console.error('❌ 記事取得エラー:', fetchError)
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '削除する記事がありません',
        deletedCount: 0,
      })
    }

    // すべての記事を削除（1件ずつ削除して確実に削除する）
    let deletedCount = 0
    const errors: string[] = []

    for (const article of articles) {
      const { error: deleteError } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', article.id)

      if (deleteError) {
        console.error(`❌ 記事削除エラー (${article.id}):`, deleteError)
        errors.push(`${article.title}: ${deleteError.message}`)
      } else {
        deletedCount++
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: deletedCount > 0,
        message: `${deletedCount}件の記事を削除しましたが、${errors.length}件でエラーが発生しました`,
        deletedCount,
        errors,
      })
    }

    return NextResponse.json({
      success: true,
      message: `すべてのブログ記事（${deletedCount}件）を削除しました`,
      deletedCount,
      deletedArticles: articles.map(a => ({ id: a.id, slug: a.slug, title: a.title })),
    })
  } catch (error: any) {
    console.error('❌ 記事削除エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
      },
      { status: 500 }
    )
  }
}
