export const seoConfig = {
  siteName: "まいにち姓名判断",
  siteUrl: "https://seimei.kanau-kiryu.com", // 正しいドメインに修正
  description:
    "毎日の運勢もわかる本格姓名判断アプリ。旧字体による正確な画数計算で、あなたの運命を詳しく鑑定します。無料で基本鑑定、有料で詳細分析や運気運行表も利用可能。",
  keywords: [
    "姓名判断",
    "占い",
    "運勢",
    "六星占術",
    "陰陽五行",
    "相性診断",
    "無料占い",
    "旧字体",
    "画数",
    "名前占い",
    "運気",
    "吉凶",
    "命名",
    "改名",
    "赤ちゃん名前",
    "会社名占い",
    "商品名占い",
  ],
  author: "金雨輝龍",
  twitterHandle: "@nameanalysis216",
  facebookAppId: "your-facebook-app-id",
  defaultImage: "/images/og-default.png",
  favicon: "/favicon.ico",
  themeColor: "#4f46e5",
}

export const generateMetadata = (page: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}) => {
  const title = page.title ? `${page.title} | ${seoConfig.siteName}` : seoConfig.siteName

  const description = page.description || seoConfig.description
  const keywords = page.keywords ? [...seoConfig.keywords, ...page.keywords] : seoConfig.keywords
  const image = page.image || seoConfig.defaultImage
  const url = page.url ? `${seoConfig.siteUrl}${page.url}` : seoConfig.siteUrl

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seoConfig.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "ja_JP",
      type: page.type || "website",
      ...(page.type === "article" && {
        publishedTime: page.publishedTime,
        modifiedTime: page.modifiedTime,
        section: page.section,
        tags: page.tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: seoConfig.twitterHandle,
      site: seoConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
  }
}
