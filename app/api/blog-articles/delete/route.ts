// ブログ記事の削除API（GET/POST/DELETE対応）
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  return await deleteArticle(request)
}

export async function POST(request: NextRequest) {
  return await deleteArticle(request)
}

export async function DELETE(request: NextRequest) {
  return await deleteArticle(request)
}

async function deleteArticle(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    console.log('🗑️ 記事削除リクエスト:', { slug, id })

    if (!slug && !id) {
      return NextResponse.json(
        { success: false, error: 'slugまたはidパラメータが必要です' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // まず削除対象の記事を確認
    let checkResult
    if (slug) {
      checkResult = await supabase
        .from('blog_articles')
        .select('id, slug, title')
        .eq('slug', slug)
        .single()
    } else if (id) {
      checkResult = await supabase
        .from('blog_articles')
        .select('id, slug, title')
        .eq('id', id)
        .single()
    }

    if (checkResult.error) {
      console.error('❌ 記事取得エラー:', checkResult.error)
      return NextResponse.json(
        { success: false, error: `記事が見つかりません: ${checkResult.error.message}` },
        { status: 404 }
      )
    }

    console.log('📋 削除対象記事:', checkResult.data)

    // 削除実行
    let result
    if (slug) {
      // slugで削除
      result = await supabase
        .from('blog_articles')
        .delete()
        .eq('slug', slug)
    } else if (id) {
      // idで削除
      result = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id)
    }

    console.log('🗑️ 削除結果:', { 
      error: result.error, 
      data: result.data,
      status: result.status,
      statusText: result.statusText 
    })

    if (result.error) {
      console.error('❌ 記事削除エラー:', result.error)
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.message,
          details: result.error,
        },
        { status: 500 }
      )
    }

    // 削除が成功したか確認（削除後はデータが返らない場合がある）
    const verifyResult = await supabase
      .from('blog_articles')
      .select('id')
      .eq(slug ? 'slug' : 'id', slug || id || '')
      .single()

    if (verifyResult.data) {
      console.warn('⚠️ 記事がまだ存在します（RLSポリシーの可能性）')
      return NextResponse.json({
        success: false,
        error: '記事の削除に失敗しました。RLSポリシーを確認してください。',
        details: verifyResult.error,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'ブログ記事を削除しました',
      deletedCount: 1,
      deletedArticle: checkResult.data,
    })
  } catch (error: any) {
    console.error('❌ 記事削除エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

