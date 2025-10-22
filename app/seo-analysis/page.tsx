import type { Metadata } from "next"
import { SEOAnalysisDashboard } from "@/components/seo-analysis-dashboard"

export const metadata: Metadata = {
  title: "SEO分析 - まいにち姓名判断",
  description: "サイトのSEO状況を総合的に分析し、検索エンジン最適化の改善提案を提供します。",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SEOAnalysisPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <SEOAnalysisDashboard />
    </div>
  )
}
