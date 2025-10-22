"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DeploymentStatusChecker() {
  const [webhookStatus, setWebhookStatus] = useState<"loading" | "success" | "error">("loading")
  const [webhookData, setWebhookData] = useState<any>(null)
  const [lastChecked, setLastChecked] = useState<string>("")
  const { toast } = useToast()

  const checkWebhookStatus = async () => {
    setWebhookStatus("loading")
    try {
      const response = await fetch("/api/square-webhook", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setWebhookData(data)
        setWebhookStatus("success")
        setLastChecked(new Date().toLocaleString("ja-JP"))
        toast({
          title: "成功",
          description: "Webhookエンドポイントが正常に動作しています",
        })
      } else {
        setWebhookStatus("error")
        toast({
          title: "エラー",
          description: `HTTP ${response.status} エラーが発生しました`,
          variant: "destructive",
        })
      }
    } catch (error) {
      setWebhookStatus("error")
      toast({
        title: "エラー",
        description: "接続に失敗しました",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    checkWebhookStatus()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Webhook エンドポイント状況
            <Button variant="outline" size="sm" onClick={checkWebhookStatus}>
              再チェック
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {webhookStatus === "loading" && (
                <>
                  <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                  <span className="text-blue-600">チェック中...</span>
                </>
              )}
              {webhookStatus === "success" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">正常動作中</span>
                </>
              )}
              {webhookStatus === "error" && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">エラー発生</span>
                </>
              )}
            </div>

            {lastChecked && <p className="text-sm text-gray-500">最終チェック: {lastChecked}</p>}

            {webhookData && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">エンドポイント情報:</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div>
                    <strong>URL:</strong> {webhookData.url}
                  </div>
                  <div>
                    <strong>環境:</strong> {webhookData.environment}
                  </div>
                  <div>
                    <strong>サポートメソッド:</strong> {webhookData.supportedMethods?.join(", ")}
                  </div>
                  <div>
                    <strong>対応イベント:</strong> {webhookData.events?.join(", ")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {webhookStatus === "success" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🎉 デプロイ完了！</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-blue-700">Webhookエンドポイントが正常に動作しています。次のステップに進めます。</p>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">次のステップ:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>✅ Webhookエンドポイント動作確認完了</li>
                  <li>⏳ Square Dashboard で本番Webhook作成</li>
                  <li>⏳ Signature Key取得</li>
                  <li>⏳ 環境変数設定</li>
                  <li>⏳ マネタイズ機能有効化</li>
                </ul>
              </div>
              <Button onClick={() => window.open("https://developer.squareup.com/apps", "_blank")} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Square Dashboard で本番Webhook作成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
