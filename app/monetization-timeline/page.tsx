import type { Metadata } from "next"
import MonetizationReadinessDashboard from "@/components/monetization-readiness-dashboard"

export const metadata: Metadata = {
  title: "課金実装タイムライン | 姓名判断アプリ",
  description: "課金機能実装の準備状況と開始タイムラインを確認",
}

export default function MonetizationTimelinePage() {
  return <MonetizationReadinessDashboard />
}
