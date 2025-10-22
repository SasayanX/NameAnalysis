"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// NameAnalyzerを動的インポートでクライアントサイドでのみ読み込み
const NameAnalyzer = dynamic(
  () => import("@/components/name-analyzer").then((mod) => ({ default: mod.NameAnalyzer })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    ),
  },
)

export default function NameAnalyzerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">名前分析ツール</h1>
      <NameAnalyzer />
    </div>
  )
}
