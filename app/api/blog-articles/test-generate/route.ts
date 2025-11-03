// テスト用ブログ記事生成API
import { NextResponse } from 'next/server'
import { generateBlogArticleFromAnalysis, saveBlogArticle } from '@/lib/blog-article-generator'
import { analyzeNameFortune } from '@/lib/name-data-simple-fixed'

export async function GET() {
  try {
    // テスト用の姓名判断結果を生成
    const testName = {
      lastName: '大谷',
      firstName: '翔平',
    }
    
    console.log(`🧪 テストブログ記事生成開始: ${testName.lastName}${testName.firstName}さん`)
    
    // 姓名判断を実行（analyzeNameFortuneは同期関数）
    const analysisResult = analyzeNameFortune(
      testName.lastName,
      testName.firstName,
      'male'
    )
    
    console.log(`✅ 姓名判断完了: スコア${analysisResult.totalScore}点`)
    console.log(`📊 姓名判断結果の詳細:`, {
      tenFormat: analysisResult.tenFormat,
      jinFormat: analysisResult.jinFormat,
      chiFormat: analysisResult.chiFormat,
      gaiFormat: analysisResult.gaiFormat,
      totalFormat: analysisResult.totalFormat,
      categories: analysisResult.categories?.map((c: any) => ({
        name: c.name,
        strokeCount: c.strokeCount,
        fortune: c.fortune,
      })),
    })
    
    // ブログ記事を生成（async関数に変更）
    const article = await generateBlogArticleFromAnalysis(
      testName.lastName,
      testName.firstName,
      analysisResult,
      undefined // tweetIdは未設定
    )
    
    console.log(`📝 ブログ記事生成完了: ${article.slug}`)
    
    // Supabaseに保存
    const articleId = await saveBlogArticle(article)
    
    console.log(`✅ ブログ記事保存完了: ID ${articleId}`)
    
    return NextResponse.json({
      success: true,
      message: 'テストブログ記事を生成しました',
      article: {
        id: articleId,
        slug: article.slug,
        title: article.title,
        url: `/articles/${encodeURIComponent(article.slug)}`,
      },
    })
  } catch (error: any) {
    console.error('❌ テストブログ記事生成エラー:', error)
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

