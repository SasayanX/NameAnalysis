import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Calendar, AlertCircle, Baby } from "lucide-react"
import {
  getChecklistByStatus,
  getProgressStats,
  getTotalEstimatedHours,
  getTotalActualHours,
  type ChecklistItem,
} from "@/lib/development-checklist"

export function DevelopmentDashboard() {
  const stats = getProgressStats()
  const completed = getChecklistByStatus("completed")
  const inProgress = getChecklistByStatus("in-progress")
  const planned = getChecklistByStatus("planned")

  const getCategoryColor = (category: ChecklistItem["category"]) => {
    switch (category) {
      case "feature":
        return "bg-blue-100 text-blue-800"
      case "technical":
        return "bg-green-100 text-green-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      case "quality":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: ChecklistItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: ChecklistItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "planned":
        return <Calendar className="h-4 w-4 text-gray-600" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 進捗概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">全体進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed}/{stats.total} 項目完了
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">完了済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">予定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>
      </div>

      {/* 時間統計 */}
      <Card>
        <CardHeader>
          <CardTitle>時間統計</CardTitle>
          <CardDescription>見積もり時間と実績時間の比較</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">見積もり総時間</p>
              <p className="text-2xl font-bold">{getTotalEstimatedHours()}h</p>
            </div>
            <div>
              <p className="text-sm font-medium">実績時間</p>
              <p className="text-2xl font-bold">{getTotalActualHours()}h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 進行中の項目 */}
      {inProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚧 進行中の項目</CardTitle>
            <CardDescription>現在作業中の機能・改善項目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgress.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 次の予定 */}
      <Card>
        <CardHeader>
          <CardTitle>📅 次の予定</CardTitle>
          <CardDescription>今後実装予定の機能・改善項目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planned.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.dependencies && (
                      <p className="text-xs text-orange-600 mt-1">依存: {item.dependencies.join(", ")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                  <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                  <span className="text-sm text-muted-foreground">{item.estimatedHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 完了済み項目（最新5件） */}
      <Card>
        <CardHeader>
          <CardTitle>✅ 最近完了した項目</CardTitle>
          <CardDescription>最近完了した機能・改善項目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completed.slice(-5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                  {item.actualHours && <span className="text-sm text-muted-foreground">{item.actualHours}h</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 命名判断機能の進捗 */}
      <Card className="border-2 border-pink-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Baby className="h-5 w-5 text-pink-600" />
            <CardTitle className="text-pink-800">🍼 命名判断機能</CardTitle>
          </div>
          <CardDescription>赤ちゃん名付け機能の開発進捗</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">計画中</div>
            <p className="text-muted-foreground mb-4">総開発時間: 175時間見積もり</p>
            <div className="text-sm text-left space-y-1">
              <div>• Phase 1: 命名エンジン基盤 (45h)</div>
              <div>• Phase 2: UI/UX設計 (25h)</div>
              <div>• Phase 3: 高度な条件設定 (30h)</div>
              <div>• Phase 4: データベース強化 (35h)</div>
              <div>• Phase 5: プレミアム機能 (40h)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
