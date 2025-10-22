export interface SEOAnalysisResult {
  score: number
  issues: SEOIssue[]
  recommendations: string[]
  categories: {
    robots: SEOCategoryResult
    metadata: SEOCategoryResult
    sitemap: SEOCategoryResult
    performance: SEOCategoryResult
    indexing: SEOCategoryResult
  }
}

export interface SEOIssue {
  category: "robots" | "metadata" | "sitemap" | "performance" | "indexing"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  solution: string
}

export interface SEOCategoryResult {
  score: number
  issues: SEOIssue[]
  status: "good" | "warning" | "error"
}

export class SEOAnalyzer {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
  }

  async analyzeWebsite(): Promise<SEOAnalysisResult> {
    const results = await Promise.allSettled([
      this.analyzeRobotsTxt(),
      this.analyzeMetadata(),
      this.analyzeSitemap(),
      this.analyzePerformance(),
      this.analyzeIndexing(),
    ])

    const [robotsResult, metadataResult, sitemapResult, performanceResult, indexingResult] = results.map((result) =>
      result.status === "fulfilled" ? result.value : this.getErrorResult(),
    )

    const allIssues = [
      ...robotsResult.issues,
      ...metadataResult.issues,
      ...sitemapResult.issues,
      ...performanceResult.issues,
      ...indexingResult.issues,
    ]

    const totalScore = Math.round(
      (robotsResult.score +
        metadataResult.score +
        sitemapResult.score +
        performanceResult.score +
        indexingResult.score) /
        5,
    )

    return {
      score: totalScore,
      issues: allIssues,
      recommendations: this.generateRecommendations(allIssues),
      categories: {
        robots: robotsResult,
        metadata: metadataResult,
        sitemap: sitemapResult,
        performance: performanceResult,
        indexing: indexingResult,
      },
    }
  }

  private async analyzeRobotsTxt(): Promise<SEOCategoryResult> {
    const issues: SEOIssue[] = []
    let score = 100

    try {
      const response = await fetch(`${this.baseUrl}/robots.txt`)
      const robotsContent = await response.text()

      // User-agent指定の確認
      if (!robotsContent.includes("User-agent:") && !robotsContent.includes("user-agent:")) {
        issues.push({
          category: "robots",
          severity: "high",
          title: "User-agentの指定がありません",
          description: "robots.txtにUser-agentの指定が見つかりません",
          solution: "User-agent: * を追加してください",
        })
        score -= 30
      }

      // Sitemap指定の確認
      if (!robotsContent.includes("Sitemap:") && !robotsContent.includes("sitemap:")) {
        issues.push({
          category: "robots",
          severity: "medium",
          title: "Sitemapの指定がありません",
          description: "robots.txtにサイトマップのURLが指定されていません",
          solution: "Sitemap: https://your-domain.com/sitemap.xml を追加してください",
        })
        score -= 20
      }

      // AIクローラーのブロック確認
      const aiCrawlers = ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"]
      const hasAIBlocking = aiCrawlers.some((bot) => robotsContent.includes(bot))

      if (!hasAIBlocking) {
        issues.push({
          category: "robots",
          severity: "low",
          title: "AIクローラーのブロック設定なし",
          description: "AIクローラーに対する制御設定がありません",
          solution: "必要に応じてAIクローラーをブロックする設定を追加してください",
        })
        score -= 10
      }
    } catch (error) {
      issues.push({
        category: "robots",
        severity: "high",
        title: "robots.txtが見つかりません",
        description: "robots.txtファイルにアクセスできません",
        solution: "robots.txtファイルを作成してください",
      })
      score = 0
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? "good" : score >= 50 ? "warning" : "error",
    }
  }

  private async analyzeMetadata(): Promise<SEOCategoryResult> {
    const issues: SEOIssue[] = []
    let score = 100

    if (typeof window !== "undefined") {
      // タイトルタグの確認
      const title = document.title
      if (!title) {
        issues.push({
          category: "metadata",
          severity: "high",
          title: "タイトルタグがありません",
          description: "ページにタイトルタグが設定されていません",
          solution: "<title>タグを追加してください",
        })
        score -= 30
      } else if (title.length < 30 || title.length > 60) {
        issues.push({
          category: "metadata",
          severity: "medium",
          title: "タイトルタグの長さが不適切です",
          description: `現在の長さ: ${title.length}文字（推奨: 30-60文字）`,
          solution: "タイトルを30-60文字に調整してください",
        })
        score -= 15
      }

      // メタディスクリプションの確認
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content")
      if (!metaDescription) {
        issues.push({
          category: "metadata",
          severity: "high",
          title: "メタディスクリプションがありません",
          description: "ページにメタディスクリプションが設定されていません",
          solution: '<meta name="description" content="...">を追加してください',
        })
        score -= 30
      } else if (metaDescription.length < 120 || metaDescription.length > 160) {
        issues.push({
          category: "metadata",
          severity: "medium",
          title: "メタディスクリプションが短すぎます",
          description: `現在の長さ: ${metaDescription.length}文字（推奨: 120-160文字）`,
          solution: "120-160文字で設定してください",
        })
        score -= 20
      }

      // OGタグの確認
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content")
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute("content")
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content")

      if (!ogTitle || !ogDescription || !ogImage) {
        issues.push({
          category: "metadata",
          severity: "medium",
          title: "OGタグが不完全です",
          description: "SNS共有用のOGタグが不足しています",
          solution: "og:title, og:description, og:imageを設定してください",
        })
        score -= 15
      }

      // 構造化データの確認
      const structuredData = document.querySelector('script[type="application/ld+json"]')
      if (!structuredData) {
        issues.push({
          category: "metadata",
          severity: "low",
          title: "構造化データがありません",
          description: "JSON-LD形式の構造化データが設定されていません",
          solution: "構造化データを追加して検索結果を豊かにしてください",
        })
        score -= 10
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? "good" : score >= 50 ? "warning" : "error",
    }
  }

  private async analyzeSitemap(): Promise<SEOCategoryResult> {
    const issues: SEOIssue[] = []
    let score = 100

    try {
      const response = await fetch(`${this.baseUrl}/sitemap.xml`)
      if (!response.ok) {
        issues.push({
          category: "sitemap",
          severity: "high",
          title: "サイトマップが見つかりません",
          description: "sitemap.xmlにアクセスできません",
          solution: "サイトマップを生成してください",
        })
        score = 0
      } else {
        const sitemapContent = await response.text()

        // URLの数をチェック
        const urlCount = (sitemapContent.match(/<url>/g) || []).length
        if (urlCount === 0) {
          issues.push({
            category: "sitemap",
            severity: "high",
            title: "サイトマップにURLがありません",
            description: "サイトマップにページのURLが含まれていません",
            solution: "ページのURLをサイトマップに追加してください",
          })
          score -= 50
        } else if (urlCount < 5) {
          issues.push({
            category: "sitemap",
            severity: "medium",
            title: "サイトマップのURL数が少ないです",
            description: `現在のURL数: ${urlCount}個`,
            solution: "重要なページをサイトマップに追加してください",
          })
          score -= 20
        }

        // 最終更新日の確認
        if (!sitemapContent.includes("<lastmod>")) {
          issues.push({
            category: "sitemap",
            severity: "low",
            title: "最終更新日が設定されていません",
            description: "サイトマップに最終更新日が含まれていません",
            solution: "<lastmod>タグを追加してください",
          })
          score -= 10
        }
      }
    } catch (error) {
      issues.push({
        category: "sitemap",
        severity: "high",
        title: "サイトマップの取得に失敗しました",
        description: "サイトマップの分析中にエラーが発生しました",
        solution: "サイトマップの設定を確認してください",
      })
      score = 0
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? "good" : score >= 50 ? "warning" : "error",
    }
  }

  private async analyzePerformance(): Promise<SEOCategoryResult> {
    const issues: SEOIssue[] = []
    let score = 100

    if (typeof window !== "undefined") {
      // ページ読み込み時間の確認
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        if (loadTime > 3000) {
          issues.push({
            category: "performance",
            severity: "high",
            title: "ページ読み込みが遅いです",
            description: `読み込み時間: ${Math.round(loadTime)}ms`,
            solution: "画像の最適化、コードの圧縮を検討してください",
          })
          score -= 30
        } else if (loadTime > 2000) {
          issues.push({
            category: "performance",
            severity: "medium",
            title: "ページ読み込み時間を改善できます",
            description: `読み込み時間: ${Math.round(loadTime)}ms`,
            solution: "パフォーマンスの最適化を検討してください",
          })
          score -= 15
        }
      }

      // 画像の最適化確認
      const images = document.querySelectorAll("img")
      let unoptimizedImages = 0
      images.forEach((img) => {
        if (!img.getAttribute("alt")) {
          unoptimizedImages++
        }
      })

      if (unoptimizedImages > 0) {
        issues.push({
          category: "performance",
          severity: "medium",
          title: "alt属性のない画像があります",
          description: `${unoptimizedImages}個の画像にalt属性がありません`,
          solution: "すべての画像にalt属性を追加してください",
        })
        score -= 20
      }

      // モバイル対応の確認
      const viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        issues.push({
          category: "performance",
          severity: "high",
          title: "ビューポートが設定されていません",
          description: "モバイル対応のためのビューポート設定がありません",
          solution: '<meta name="viewport" content="width=device-width, initial-scale=1">を追加してください',
        })
        score -= 25
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? "good" : score >= 50 ? "warning" : "error",
    }
  }

  private async analyzeIndexing(): Promise<SEOCategoryResult> {
    const issues: SEOIssue[] = []
    let score = 100

    if (typeof window !== "undefined") {
      // canonical URLの確認
      const canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        issues.push({
          category: "indexing",
          severity: "medium",
          title: "canonical URLが設定されていません",
          description: "重複コンテンツ対策のためのcanonical URLがありません",
          solution: '<link rel="canonical" href="...">を追加してください',
        })
        score -= 20
      }

      // hreflangの確認（多言語サイトの場合）
      const hreflang = document.querySelector('link[rel="alternate"][hreflang]')
      // 日本語サイトなので、hreflangがなくても問題なし

      // robots metaタグの確認
      const robotsMeta = document.querySelector('meta[name="robots"]')
      if (robotsMeta) {
        const content = robotsMeta.getAttribute("content")
        if (content && (content.includes("noindex") || content.includes("nofollow"))) {
          issues.push({
            category: "indexing",
            severity: "high",
            title: "インデックスがブロックされています",
            description: "robots metaタグでインデックスがブロックされています",
            solution: "robots metaタグの設定を確認してください",
          })
          score -= 40
        }
      }

      // SSL証明書の確認
      if (window.location.protocol !== "https:") {
        issues.push({
          category: "indexing",
          severity: "high",
          title: "HTTPS化されていません",
          description: "サイトがHTTPS化されていません",
          solution: "SSL証明書を導入してHTTPS化してください",
        })
        score -= 30
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? "good" : score >= 50 ? "warning" : "error",
    }
  }

  private getErrorResult(): SEOCategoryResult {
    return {
      score: 0,
      issues: [
        {
          category: "metadata",
          severity: "high",
          title: "分析エラー",
          description: "分析中にエラーが発生しました",
          solution: "再度分析を実行してください",
        },
      ],
      status: "error",
    }
  }

  private generateRecommendations(issues: SEOIssue[]): string[] {
    const recommendations: string[] = []

    const highIssues = issues.filter((issue) => issue.severity === "high")
    const mediumIssues = issues.filter((issue) => issue.severity === "medium")

    if (highIssues.length > 0) {
      recommendations.push("🚨 高優先度の問題を最初に解決してください")
      recommendations.push("📝 robots.txtとメタデータの設定を確認してください")
    }

    if (mediumIssues.length > 0) {
      recommendations.push("⚠️ 中優先度の問題も順次対応してください")
      recommendations.push("🔍 SEOスコア向上のため継続的な改善を行ってください")
    }

    recommendations.push("📊 Google Search Consoleでインデックス状況を確認してください")
    recommendations.push("🔄 定期的にSEO分析を実行して改善状況を監視してください")

    return recommendations
  }
}
