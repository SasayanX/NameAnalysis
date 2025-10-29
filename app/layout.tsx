import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FortuneDataProvider } from "@/contexts/fortune-data-context"
import { StrokeDataProvider } from "@/contexts/stroke-data-context"
import { UserPreferencesProvider } from "@/contexts/user-preferences-context"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { AuthProvider } from "@/components/auth/auth-provider"
import { LoginBonusNotification } from "@/components/login-bonus-notification"
import { SEOHead } from "@/components/seo-head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://seimei.kanau-kiryu.com"),
  title: {
    default: "まいにちAI姓名判断 - 完全旧字体対応のAI運命鑑定",
    template: "%s | まいにちAI姓名判断",
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  description:
    "【無料で始める本格姓名判断】旧字体による正確な画数計算で、あなたの運命を詳しく鑑定。毎日の運勢、五行思想、六星占術、相性診断まで。プロ級の開運アドバイスで人生をより良い方向へ導きます。今すぐ無料で姓名判断を体験してください。",
  keywords: ["姓名判断", "占い", "運勢", "六星占術", "陰陽五行", "相性診断", "無料占い", "旧字体", "画数", "名前占い"],
  authors: [{ name: "まいにちAI姓名判断" }],
  creator: "まいにちAI姓名判断",
  publisher: "まいにちAI姓名判断",
  alternates: {
    canonical: "https://seimei.kanau-kiryu.com",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://seimei.kanau-kiryu.com",
    siteName: "まいにちAI姓名判断",
    title: "まいにちAI姓名判断 - 旧字体による正確な画数計算で運命鑑定",
    description:
      "【無料で始める本格姓名判断】旧字体による正確な画数計算で、あなたの運命を詳しく鑑定。毎日の運勢、五行思想、六星占術、相性診断まで対応。",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "まいにちAI姓名判断",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "まいにちAI姓名判断 - 旧字体による正確な画数計算で運命鑑定",
    description:
      "【無料で始める本格姓名判断】旧字体による正確な画数計算で、あなたの運命を詳しく鑑定。毎日の運勢、五行思想、六星占術、相性診断まで対応。",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <SEOHead />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <UserPreferencesProvider>
              <FortuneDataProvider>
                <StrokeDataProvider>
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                  <Toaster />
                  <PWAInstallPrompt />
                  <LoginBonusNotification />
                </StrokeDataProvider>
              </FortuneDataProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
