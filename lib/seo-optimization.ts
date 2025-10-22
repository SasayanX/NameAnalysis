// SEO最適化のためのユーティリティ関数

export interface SEOAnalysis {
  title: {
    length: number
    isOptimal: boolean
    suggestions: string[]
  }
  description: {
    length: number
    isOptimal: boolean
    suggestions: string[]
  }
  keywords: {
    density: number
    suggestions: string[]
  }
  headings: {
    h1Count: number
    structure: string[]
    suggestions: string[]
  }
}

export function analyzeSEO(content: {
  title: string
  description: string
  body: string
  headings: string[]
}): SEOAnalysis {
  const titleLength = content.title.length
  const descriptionLength = content.description.length

  return {
    title: {
      length: titleLength,
      isOptimal: titleLength >= 30 && titleLength <= 60,
      suggestions: [
        titleLength < 30 ? "タイトルをもう少し長くしてください（30-60文字推奨）" : "",
        titleLength > 60 ? "タイトルが長すぎます（30-60文字推奨）" : "",
        !content.title.includes("姓名判断") ? "メインキーワード「姓名判断」を含めてください" : "",
      ].filter(Boolean),
    },
    description: {
      length: descriptionLength,
      isOptimal: descriptionLength >= 120 && descriptionLength <= 160,
      suggestions: [
        descriptionLength < 120 ? "説明文をもう少し長くしてください（120-160文字推奨）" : "",
        descriptionLength > 160 ? "説明文が長すぎます（120-160文字推奨）" : "",
      ].filter(Boolean),
    },
    keywords: {
      density: calculateKeywordDensity(content.body, "姓名判断"),
      suggestions: [
        "関連キーワード（占い、運勢、画数）を自然に含めてください",
        "キーワードの詰め込みすぎに注意してください",
      ],
    },
    headings: {
      h1Count: content.headings.filter((h) => h.startsWith("h1")).length,
      structure: content.headings,
      suggestions: [
        content.headings.filter((h) => h.startsWith("h1")).length !== 1 ? "H1タグは1つだけにしてください" : "",
        "見出しの階層構造を適切に設定してください",
      ].filter(Boolean),
    },
  }
}

function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.split(/\s+/).length
  const keywordCount = (text.match(new RegExp(keyword, "gi")) || []).length
  return (keywordCount / words) * 100
}

// 内部リンク最適化
export function generateInternalLinks() {
  return [
    {
      text: "姓名判断を始める",
      url: "/name-analyzer",
      description: "無料で姓名判断を体験",
    },
    {
      text: "旧字体について学ぶ",
      url: "/articles/kyujitai-seimeihandan",
      description: "正確な画数計算の重要性",
    },
    {
      text: "五行思想を理解する",
      url: "/articles/gogyo-five-elements",
      description: "陰陽五行の基礎知識",
    },
    {
      text: "六星占術との関係",
      url: "/articles/rokuseisensei-fortune",
      description: "総合的な運勢判断",
    },
    {
      text: "運気の流れを見る",
      url: "/fortune-flow",
      description: "年間の運気変動",
    },
  ]
}

// ページ速度最適化のチェックリスト
export const performanceOptimization = {
  images: ["WebP形式の使用", "適切なサイズでの配信", "lazy loading の実装", "alt属性の設定"],
  css: ["未使用CSSの削除", "クリティカルCSSのインライン化", "CSS minification"],
  javascript: ["不要なJavaScriptの削除", "コード分割の実装", "JavaScript minification"],
  fonts: ["フォントの事前読み込み", "font-display: swap の使用", "Web Fontsの最適化"],
}
