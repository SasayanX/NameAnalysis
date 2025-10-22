import { seoConfig } from "./seo-config"

// WebSite構造化データ
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
    author: {
      "@type": "Person",
      name: seoConfig.author,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    sameAs: [
      "https://twitter.com/nameanalysis216",
      // 他のSNSアカウントがあれば追加
    ],
  }
}

// WebApplication構造化データ
export function generateWebApplicationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
      description: "基本的な姓名判断は無料でご利用いただけます",
    },
    author: {
      "@type": "Person",
      name: seoConfig.author,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  }
}

// Service構造化データ
export function generateServiceStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "姓名判断サービス",
    description: "旧字体による正確な画数計算で運命を鑑定する姓名判断サービス",
    provider: {
      "@type": "Person",
      name: seoConfig.author,
    },
    areaServed: "JP",
    availableLanguage: "ja",
    serviceType: "占い・姓名判断",
    offers: [
      {
        "@type": "Offer",
        name: "基本姓名判断",
        description: "無料で基本的な姓名判断を提供",
        price: "0",
        priceCurrency: "JPY",
      },
      {
        "@type": "Offer",
        name: "詳細姓名判断",
        description: "詳細な分析と運気運行表を含む有料プラン",
        price: "500",
        priceCurrency: "JPY",
      },
    ],
  }
}

// FAQ構造化データ
export function generateFAQStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "姓名判断は無料で利用できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい、基本的な姓名判断は無料でご利用いただけます。より詳細な分析をご希望の場合は有料プランもご用意しております。",
        },
      },
      {
        "@type": "Question",
        name: "旧字体での画数計算とは何ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "旧字体での画数計算は、漢字の本来の形である旧字体（康熙字典体）を基準として画数を数える方法です。より正確な姓名判断を行うために重要です。",
        },
      },
      {
        "@type": "Question",
        name: "どのような占いができますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "姓名判断、相性診断、運勢占い、六星占術、陰陽五行による分析など、様々な占いをご提供しています。",
        },
      },
      {
        "@type": "Question",
        name: "結果の信頼性はどの程度ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "当サービスは伝統的な姓名判断の理論に基づき、旧字体による正確な画数計算を行っています。ただし、占いは参考程度にお考えください。",
        },
      },
    ],
  }
}

// BreadcrumbList構造化データ
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Article構造化データ
export function generateArticleStructuredData(article: {
  title: string
  description: string
  url: string
  publishedTime: string
  modifiedTime?: string
  image?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      "@type": "Person",
      name: seoConfig.author,
    },
    publisher: {
      "@type": "Organization",
      name: seoConfig.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${seoConfig.siteUrl}/images/logo.png`,
      },
    },
    image: article.image ? `${seoConfig.siteUrl}${article.image}` : `${seoConfig.siteUrl}/images/og-default.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  }
}
