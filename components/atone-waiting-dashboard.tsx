"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ExternalLink, Zap, TrendingUp } from "lucide-react"
import { ATONE_WAITING_TASKS } from "@/lib/atone-integration-prep"

export function AtoneWaitingDashboard() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [waitingDays, setWaitingDays] = useState(0)

  useEffect(() => {
    // 申し込み日からの経過日数を計算（実際の実装では申し込み日を保存）
    const applicationDate = new Date() // 今日を申し込み日として仮定
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - applicationDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setWaitingDays(diffDays)
  }, [])

  const toggleTask = (taskName: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskName) ? prev.filter((name) => name !== taskName) : [...prev, taskName],
    )
  }

  const getProgress = () => {
    const totalTasks = ATONE_WAITING_TASKS.immediate_tasks.length
    const completed = completedTasks.length
    return (completed / totalTasks) * 100
  }

  const getWaitingStatus = () => {
    if (waitingDays === 0) return { status: "申し込み完了", color: "blue", message: "お疲れ様でした！" }
    if (waitingDays <= 1) return { status: "審査中", color: "yellow", message: "通常1-3営業日で連絡があります" }
    if (waitingDays <= 3) return { status: "審査中", color: "yellow", message: "もうすぐ連絡があるはずです" }
    return { status: "要確認", color: "red", message: "サポートに問い合わせを検討してください" }
  }

  const waitingStatus = getWaitingStatus()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 申し込み状況 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            atone申し込み完了！
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700">申し込みから {waitingDays} 日経過</p>
              <p className="text-sm text-green-600">{waitingStatus.message}</p>
            </div>
            <Badge className={`bg-${waitingStatus.color}-600`}>{waitingStatus.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 待機中の準備タスク */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              連絡待ちの間にできること
            </CardTitle>
            <Badge variant="outline">{Math.round(getProgress())}% 完了</Badge>
          </div>
          <Progress value={getProgress()} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ATONE_WAITING_TASKS.immediate_tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTask(task.task)}
              >
                {completedTasks.includes(task.task) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${completedTasks.includes(task.task) ? "line-through text-gray-500" : ""}`}
                  >
                    {task.task}
                  </h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`mb-1 ${task.priority === "高" ? "border-red-500 text-red-600" : ""}`}
                  >
                    {task.priority}
                  </Badge>
                  <p className="text-xs text-gray-500">{task.estimated_time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Square並行準備 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-5 w-5" />
            Square並行準備（推奨）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">atone承認を待つ間に、Squareの準備も進めておくと効率的です。</p>
          <div className="space-y-3">
            {Object.entries(ATONE_WAITING_TASKS.square_parallel_prep).map(([key, step]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {key.slice(-1)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.action}</p>
                  <p className="text-xs text-blue-600">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => window.open("https://squareup.com/jp/ja/developers", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Square開発者サイトを開く
          </Button>
        </CardContent>
      </Card>

      {/* 収益予測 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            収益予測
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">atoneのみ（現在）</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>保守的予測:</span>
                  <span className="font-semibold">月2万円</span>
                </div>
                <div className="flex justify-between">
                  <span>現実的予測:</span>
                  <span className="font-semibold">月5万円</span>
                </div>
                <div className="flex justify-between">
                  <span>楽観的予測:</span>
                  <span className="font-semibold">月10万円</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h3 className="font-semibold text-yellow-600 mb-2">atone + Square（将来）</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>保守的予測:</span>
                  <span className="font-semibold">月4万円</span>
                </div>
                <div className="flex justify-between">
                  <span>現実的予測:</span>
                  <span className="font-semibold">月8万円</span>
                </div>
                <div className="flex justify-between">
                  <span>楽観的予測:</span>
                  <span className="font-semibold">月15万円</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 次のステップ */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">🎯 atone承認後の予定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ATONE_WAITING_TASKS.post_approval_tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-white rounded">
                <div className="h-6 w-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className="font-semibold">{task.task}</span>
                  <span className="text-sm text-gray-600 ml-2">({task.estimated_time})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
