import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "画数別吉凶一覧",
  description: "姓名判断における画数別の吉凶一覧表",
}

export default function StrokeFortuneListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
