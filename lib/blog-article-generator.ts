/**
 * ブログ記事自動生成システム
 * X投稿された姓名判断結果からSEO対策用のブログ記事を自動生成
 */

import { getSupabaseClient } from "./supabase-client"

export interface BlogArticle {
  id: string
  slug: string
  title: string
  description: string
  content: string
  lastName: string
  firstName: string
  analysisResult: any
  keywords: string[]
  category: string
  publishedAt: Date
  createdAt: Date
  tweetId?: string
}

/**
 * 姓名判断結果からブログ記事を生成
 */
export async function generateBlogArticleFromAnalysis(
  lastName: string,
  firstName: string,
  analysisResult: any,
  tweetId?: string,
): Promise<BlogArticle> {
  const fullName = `${lastName}${firstName}`
  
  // スコアを計算（totalScoreがない場合は計算する）
  let score = analysisResult?.totalScore
  if (score === undefined || score === null) {
    // 各格のスコアから総合スコアを計算
    const tenScore = calculateScoreFromFortune(analysisResult?.tenFortune?.運勢)
    const jinScore = calculateScoreFromFortune(analysisResult?.jinFortune?.運勢)
    const chiScore = calculateScoreFromFortune(analysisResult?.chiFortune?.運勢)
    const gaiScore = calculateScoreFromFortune(analysisResult?.gaiFortune?.運勢)
    const totalScoreValue = calculateScoreFromFortune(analysisResult?.totalFortune?.運勢)
    
    // 加重平均で計算（総格を重視）
    score = Math.round((tenScore * 0.15 + jinScore * 0.25 + chiScore * 0.20 + gaiScore * 0.15 + totalScoreValue * 0.25))
  }
  
  const rank = getScoreRank(score)
  
  // スコア計算のヘルパー関数
  function calculateScoreFromFortune(fortune: string | undefined): number {
    if (!fortune) return 50
    switch (fortune) {
      case "大吉": return 100
      case "中吉": return 80
      case "吉": return 60
      case "凶": return 40
      case "中凶": return 20
      case "大凶": return 0
      default: return 50
    }
  }
  
  const categories = analysisResult?.categories || []
  
  // categoriesから各格を取得
  const tenFortune = categories.find((c: any) => c.name === "天格")
  const jinFortune = categories.find((c: any) => c.name === "人格")
  const chiFortune = categories.find((c: any) => c.name === "地格")
  const gaiFortune = categories.find((c: any) => c.name === "外格")
  const totalFortune = categories.find((c: any) => c.name === "総格")
  
  // 画数情報が正しく取得できているか確認（デバッグ用）
  console.log('📊 ブログ記事生成時の五格情報:', {
    categories: categories.map((c: any) => ({
      name: c.name,
      strokeCount: c.strokeCount,
      fortune: c.fortune,
    })),
    tenFortune: tenFortune ? { name: tenFortune.name, strokeCount: tenFortune.strokeCount } : null,
    jinFortune: jinFortune ? { name: jinFortune.name, strokeCount: jinFortune.strokeCount } : null,
    chiFortune: chiFortune ? { name: chiFortune.name, strokeCount: chiFortune.strokeCount } : null,
    gaiFortune: gaiFortune ? { name: gaiFortune.name, strokeCount: gaiFortune.strokeCount } : null,
    totalFortune: totalFortune ? { name: totalFortune.name, strokeCount: totalFortune.strokeCount } : null,
    analysisResultFormats: {
      tenFormat: analysisResult?.tenFormat,
      jinFormat: analysisResult?.jinFormat,
      chiFormat: analysisResult?.chiFormat,
      gaiFormat: analysisResult?.gaiFormat,
      totalFormat: analysisResult?.totalFormat,
    },
  })
  
  // 画数を取得するヘルパー関数（複数のソースから取得を試みる）
  const getStrokeCount = (category: any, fallbackFormat?: number): number | string => {
    // まず、categoryから取得を試みる
    if (category) {
      // strokeCountプロパティから直接取得
      if (category.strokeCount !== undefined && category.strokeCount !== null && typeof category.strokeCount === 'number') {
        return category.strokeCount
      }
      
      // valueプロパティから取得を試みる（例: "10画"）
      if (category.value) {
        const match = String(category.value).match(/(\d+)画/)
        if (match) {
          return parseInt(match[1], 10)
        }
        // 数値のみの場合
        const numMatch = String(category.value).match(/^(\d+)$/)
        if (numMatch) {
          return parseInt(numMatch[1], 10)
        }
      }
      
      // formatプロパティから取得を試みる（例: 10）
      if (category.format !== undefined && category.format !== null && typeof category.format === 'number') {
        return category.format
      }
    }
    
    // categoryから取得できない場合は、fallbackFormatを使用
    if (fallbackFormat !== undefined && fallbackFormat !== null) {
      return fallbackFormat
    }
    
    return "不明"
  }
  
  // 画数を取得（優先順位：analysisResultの直下プロパティ > categories配列）
  // まずanalysisResultの直下プロパティから取得を試みる（これが最も確実）
  let tenStrokeCount: number | string = analysisResult?.tenFormat
  let jinStrokeCount: number | string = analysisResult?.jinFormat
  let chiStrokeCount: number | string = analysisResult?.chiFormat
  let gaiStrokeCount: number | string = analysisResult?.gaiFormat
  let totalStrokeCount: number | string = analysisResult?.totalFormat
  
  // 直下プロパティが取得できない場合のみ、categoriesから取得を試みる
  if (tenStrokeCount === undefined || tenStrokeCount === null) {
    tenStrokeCount = getStrokeCount(tenFortune)
  }
  if (jinStrokeCount === undefined || jinStrokeCount === null) {
    jinStrokeCount = getStrokeCount(jinFortune)
  }
  if (chiStrokeCount === undefined || chiStrokeCount === null) {
    chiStrokeCount = getStrokeCount(chiFortune)
  }
  if (gaiStrokeCount === undefined || gaiStrokeCount === null) {
    gaiStrokeCount = getStrokeCount(gaiFortune)
  }
  if (totalStrokeCount === undefined || totalStrokeCount === null) {
    totalStrokeCount = getStrokeCount(totalFortune)
  }
  
  // すべての方法で取得できない場合は"不明"
  if (tenStrokeCount === undefined || tenStrokeCount === null) tenStrokeCount = "不明"
  if (jinStrokeCount === undefined || jinStrokeCount === null) jinStrokeCount = "不明"
  if (chiStrokeCount === undefined || chiStrokeCount === null) chiStrokeCount = "不明"
  if (gaiStrokeCount === undefined || gaiStrokeCount === null) gaiStrokeCount = "不明"
  if (totalStrokeCount === undefined || totalStrokeCount === null) totalStrokeCount = "不明"
  
  console.log('📊 最終的な画数取得結果:', {
    source: 'analysisResult直下プロパティ優先',
    tenStrokeCount,
    jinStrokeCount,
    chiStrokeCount,
    gaiStrokeCount,
    totalStrokeCount,
    tenFormat: analysisResult?.tenFormat,
    jinFormat: analysisResult?.jinFormat,
    chiFormat: analysisResult?.chiFormat,
    gaiFormat: analysisResult?.gaiFormat,
    totalFormat: analysisResult?.totalFormat,
    categoriesStrokeCounts: categories.map((c: any) => ({
      name: c.name,
      strokeCount: c.strokeCount,
    })),
  })

  // スラッグ生成（SEOフレンドリー、重複チェック付き）
  const slug = await generateSlug(`${fullName}の姓名判断結果`, true)

  // タイトル生成
  const title = `${fullName}さんの姓名判断結果｜総合${score}点（${rank}ランク）の詳細解説`

  // 説明文生成
  const description = `${fullName}さんの姓名判断を徹底分析。天格${tenFortune?.fortune || "不明"}、人格${jinFortune?.fortune || "不明"}、総格${totalFortune?.fortune || "不明"}の運勢と、${score}点という総合評価の意味を詳しく解説します。姓名判断で運勢を改善する方法も紹介。`

  // コンテンツ生成
  const content = generateArticleContent(
    fullName,
    lastName,
    firstName,
    analysisResult,
    {
      tenFortune,
      jinFortune,
      chiFortune,
      gaiFortune,
      totalFortune,
      score,
      rank,
      tenStrokeCount,
      jinStrokeCount,
      chiStrokeCount,
      gaiStrokeCount,
      totalStrokeCount,
    },
  )

  // キーワード生成
  const keywords = [
    fullName,
    "姓名判断",
    `${fullName} 姓名判断`,
    "名前診断",
    "運勢",
    "画数",
    "五格",
    "天格",
    "人格",
    "地格",
    "外格",
    "総格",
    `${score}点`,
    `${rank}ランク`,
  ]

  return {
    id: "",
    slug,
    title,
    description,
    content,
    lastName,
    firstName,
    analysisResult,
    keywords,
    category: "姓名判断実例",
    publishedAt: new Date(),
    createdAt: new Date(),
    tweetId,
  }
}

/**
 * 記事本文を生成
 */
function generateArticleContent(
  fullName: string,
  lastName: string,
  firstName: string,
  analysisResult: any,
  fortunes: {
    tenFortune: any
    jinFortune: any
    chiFortune: any
    gaiFortune: any
    totalFortune: any
    score: number
    rank: string
    tenStrokeCount: number | string
    jinStrokeCount: number | string
    chiStrokeCount: number | string
    gaiStrokeCount: number | string
    totalStrokeCount: number | string
  },
): string {
  const { tenFortune, jinFortune, chiFortune, gaiFortune, totalFortune, score, rank, tenStrokeCount, jinStrokeCount, chiStrokeCount, gaiStrokeCount, totalStrokeCount } = fortunes

  return `
# ${fullName}さんの姓名判断結果｜総合${score}点（${rank}ランク）の詳細解説

## はじめに

本記事では、**${fullName}**さんの姓名判断結果を徹底分析いたします。姓名判断は、名前の画数から五格（天格・人格・地格・外格・総格）を算出し、それぞれの運勢から総合的な運命を読み解く占術です。

## 総合評価

**${fullName}**さんの総合評価は**${score}点（${rank}ランク）**です。

${getRankDescription(score, rank)}

## 五格の詳細分析

### 天格（${tenStrokeCount}画）：${tenFortune?.fortune || "不明"}

天格は、**社会的な成功や対外的な印象**を表します。${lastName}という苗字の画数が天格を形成しています。

**${tenFortune?.fortune || "不明"}**の運勢を持つ天格は、${tenFortune?.explanation || "社会的な評価を高める可能性を示しています"}。

${tenFortune?.description || ""}

### 人格（${jinStrokeCount}画）：${jinFortune?.fortune || "不明"}

人格は、**性格や才能、人生の中心的な運勢**を表します。苗字の最後の文字と名前の最初の文字の画数の合計が人格となります。

**${jinFortune?.fortune || "不明"}**の運勢を持つ人格は、${jinFortune?.explanation || "性格面での特徴を示しています"}。

${jinFortune?.description || ""}

### 地格（${chiStrokeCount}画）：${chiFortune?.fortune || "不明"}

地格は、**家庭環境や若年期の運勢**を表します。${firstName}という名前の画数が地格を形成しています。

**${chiFortune?.fortune || "不明"}**の運勢を持つ地格は、${chiFortune?.explanation || "家庭や若年期の運勢を示しています"}。

${chiFortune?.description || ""}

### 外格（${gaiStrokeCount}画）：${gaiFortune?.fortune || "不明"}

外格は、**社会的な人間関係や外部からの影響**を表します。

**${gaiFortune?.fortune || "不明"}**の運勢を持つ外格は、${gaiFortune?.explanation || "人間関係や社会的影響を示しています"}。

${gaiFortune?.description || ""}

### 総格（${totalStrokeCount}画）：${totalFortune?.fortune || "不明"}

総格は、**全体的な人生の運勢**を表します。全ての文字の画数の合計が総格となります。

**${totalFortune?.fortune || "不明"}**の運勢を持つ総格は、${totalFortune?.explanation || "人生全体の運勢を示しています"}。

${totalFortune?.description || ""}

## 姓名判断のポイント

### 運勢を改善するには

姓名判断で運勢が良くない結果が出た場合、以下の方法で改善できます：

1. **通称名を使用する**: 日常的に使用する名前を変えることで運勢が変わる可能性があります
2. **画数を調整する**: 改名や通称名で画数を調整することで、より良い運勢を目指せます
3. **五格のバランスを取る**: 一つ一つの格の運勢だけでなく、全体のバランスも重要です

### 姓名判断の信頼性

姓名判断は、古来より伝わる統計学的な占術です。ただし、姓名判断は**運勢の可能性を示すもの**であり、絶対的な運命を決定するものではありません。大切なのは、良い結果を活かし、悪い結果があれば改善策を考える積極的な姿勢です。

## まとめ

${fullName}さんの姓名判断結果は、総合評価${score}点（${rank}ランク）でした。五格のそれぞれが異なる運勢を示していますが、全体として${getOverallSummary(score)}という評価になります。

姓名判断は継続的に自分を向上させるためのツールとして活用することで、より良い人生を歩むことができます。

---

**関連記事**
- [姓名判断の基本と使い方](/articles/gakusuu-seimeihandan-kihon)
- [旧字体で行う本格姓名判断の理由](/articles/kyujitai-seimeihandan)
- [五格の意味と読み方](/articles/gakusuu-seimeihandan-kihon)

**タグ**: #姓名判断 #名前診断 #${fullName} #運勢 #画数 #五格
`
}

/**
 * スラッグを生成（SEOフレンドリーなURL）
 * 日本語を含む場合はURLエンコードが必要になるため、ローマ字変換も検討可能
 * 重複を避けるため、必要に応じてタイムスタンプを追加
 */
async function generateSlug(title: string, checkDuplicate: boolean = true): Promise<string> {
  // まず、基本的なクリーニング
  let baseSlug = title
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80) // タイムスタンプ用の余裕を残す
  
  // 重複チェックが必要な場合
  if (checkDuplicate) {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase-client')
      const supabase = getSupabaseClient()
      if (supabase) {
        // 既存のスラッグをチェック
        const { data } = await supabase
          .from('blog_articles')
          .select('slug')
          .eq('slug', baseSlug)
          .limit(1)
        
        // 重複がある場合はタイムスタンプを追加
        if (data && data.length > 0) {
          const timestamp = Date.now().toString().slice(-8) // 最後の8桁
          baseSlug = `${baseSlug}-${timestamp}`
        }
      }
    } catch (error) {
      // エラー時はタイムスタンプを追加して重複を回避
      const timestamp = Date.now().toString().slice(-8)
      baseSlug = `${baseSlug}-${timestamp}`
    }
  }
  
  return baseSlug
}

/**
 * スコアからランクを判定
 */
function getScoreRank(score: number): string {
  if (score >= 85) return "S"
  if (score >= 75) return "A"
  if (score >= 65) return "B"
  if (score >= 55) return "C"
  if (score >= 45) return "D"
  return "E"
}

/**
 * ランクの説明を取得
 */
function getRankDescription(score: number, rank: string): string {
  if (rank === "S") return `${score}点は非常に高い評価です。五格のバランスが優れており、総合的に運勢が良好であることを示しています。`
  if (rank === "A") return `${score}点は高い評価です。全体的に運勢が良い傾向にあり、人生を豊かにする可能性を示しています。`
  if (rank === "B") return `${score}点は良好な評価です。一部の格で改善の余地はありますが、全体として安定した運勢を示しています。`
  if (rank === "C") return `${score}点は平均的な評価です。五格のバランスを整えることで、より良い運勢を目指すことができます。`
  if (rank === "D") return `${score}点はやや低い評価です。通称名の使用や画数の調整を検討することで、運勢の改善が期待できます。`
  return `${score}点は低い評価です。改名や画数の調整を検討し、より良い運勢を目指すことをおすすめします。`
}

/**
 * 総合評価のまとめを取得
 */
function getOverallSummary(score: number): string {
  if (score >= 85) return "非常に優れた運勢"
  if (score >= 75) return "優れた運勢"
  if (score >= 65) return "良好な運勢"
  if (score >= 55) return "平均的な運勢"
  if (score >= 45) return "やや低い運勢"
  return "改善の余地がある運勢"
}

/**
 * ブログ記事をSupabaseに保存
 */
export async function saveBlogArticle(article: BlogArticle): Promise<string> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  const { data, error } = await supabase
    .from("blog_articles")
    .insert({
      slug: article.slug,
      title: article.title,
      description: article.description,
      content: article.content,
      last_name: article.lastName,
      first_name: article.firstName,
      analysis_result: article.analysisResult,
      keywords: article.keywords,
      category: article.category,
      tweet_id: article.tweetId,
      published_at: article.publishedAt.toISOString(),
      created_at: article.createdAt.toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    console.error("ブログ記事保存エラー:", error)
    throw error
  }

  return data.id
}

/**
 * ブログ記事を取得
 */
export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
    lastName: data.last_name,
    firstName: data.first_name,
    analysisResult: data.analysis_result,
    keywords: data.keywords,
    category: data.category,
    publishedAt: new Date(data.published_at),
    createdAt: new Date(data.created_at),
    tweetId: data.tweet_id,
  }
}

/**
 * 最新のブログ記事を取得
 */
export async function getLatestBlogArticles(limit = 10): Promise<BlogArticle[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    content: item.content,
    lastName: item.last_name,
    firstName: item.first_name,
    analysisResult: item.analysis_result,
    keywords: item.keywords,
    category: item.category,
    publishedAt: new Date(item.published_at),
    createdAt: new Date(item.created_at),
    tweetId: item.tweet_id,
  }))
}

