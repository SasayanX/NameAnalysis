import {
  generateWebsiteStructuredData,
  generateWebApplicationStructuredData,
  generateFAQStructuredData,
} from "@/lib/structured-data"

interface SEOHeadProps {
  structuredData?: object[]
  noIndex?: boolean
}

export function SEOHead({ structuredData = [], noIndex = false }: SEOHeadProps) {
  const defaultStructuredData = [
    generateWebsiteStructuredData(),
    generateWebApplicationStructuredData(),
    generateFAQStructuredData(),
  ]

  const allStructuredData = [...defaultStructuredData, ...structuredData]

  return (
    <>
      {/* 構造化データ */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      {/* noindex指定 */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* プリロード重要リソース */}
      {/* KSW闘龍フォントのプリロード */}
      <link
        rel="preload"
        href="/fonts/KswTouryu.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />

      {/* DNS プリフェッチ */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* プリコネクト */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="96x96" href="/icon-96x96.png" />
      <link rel="apple-touch-icon" sizes="128x128" href="/icon-128x128.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="384x384" href="/icon-384x384.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />

      {/* PWA関連 */}
      <meta name="theme-color" content="#4f46e5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="まいにち姓名判断" />
    </>
  )
}
