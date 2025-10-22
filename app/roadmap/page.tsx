import { DevelopmentDashboard } from "@/components/development-dashboard"
import { BabyNamingRoadmap } from "@/components/baby-naming-roadmap"

export default function RoadmapPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">開発ロードマップ</h1>
        <p className="text-muted-foreground mt-2">姓名判断アプリの開発進捗と今後の予定を管理します</p>
      </div>

      <DevelopmentDashboard />

      {/* 命名判断機能の詳細ロードマップ */}
      <div className="mt-12">
        <BabyNamingRoadmap />
      </div>
    </div>
  )
}
