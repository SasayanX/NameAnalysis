// blog_articlesテーブル作成用API（注意：通常はSupabase SQL Editorから実行）
import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function POST() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase環境変数が設定されていません' },
        { status: 500 }
      )
    }

    // 注意: Supabaseクライアントから直接テーブル作成は通常できないため、
    // このエンドポイントは参考用です。実際にはSupabase SQL Editorから実行してください。

    return NextResponse.json({
      success: false,
      message: 'このエンドポイントは使用できません。Supabase SQL Editorからテーブルを作成してください。',
      instructions: 'scripts/create-blog-articles-table.sql の内容をSupabase SQL Editorで実行してください。',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '不明なエラー',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'blog_articlesテーブルを作成するには、Supabase SQL Editorで実行してください。',
    sqlFile: 'scripts/create-blog-articles-table.sql',
    instructions: [
      '1. Supabase Dashboard → SQL Editor',
      '2. scripts/create-blog-articles-table.sql の内容をコピー',
      '3. SQL Editorに貼り付けて実行',
    ],
  })
}

