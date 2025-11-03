// ブログ記事の縦書き名前画像を生成するAPI
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'
import { generateNameResultImage } from '@/lib/name-result-image-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: 'idまたはslugパラメータが必要です' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // 記事を取得
    let query = supabase
      .from('blog_articles')
      .select('last_name, first_name, analysis_result')
      .single()

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', slug!)
    }

    const { data: article, error: fetchError } = await query

    if (fetchError || !article) {
      return NextResponse.json(
        { success: false, error: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // 画像を生成
    const imageBuffer = await generateNameResultImage(
      article.last_name,
      article.first_name,
      article.analysis_result || {}
    )

    // PNG画像として返す
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('❌ 画像生成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '画像生成に失敗しました',
      },
      { status: 500 }
    )
  }
}

