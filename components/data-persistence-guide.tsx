"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Database, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DataPersistenceGuideProps {
  customData: any
}

export function DataPersistenceGuide({ customData }: DataPersistenceGuideProps) {
  const [showEnvVar, setShowEnvVar] = useState(false)
  const { toast } = useToast()

  const envVarValue = JSON.stringify(customData)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>重要:</strong> インポートしたデータを永続化するには、以下のいずれかの方法を選択してください。
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 方法1: 環境変数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              方法1: 環境変数で設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Vercelの環境変数にカスタムデータを設定します。</p>

            <div className="space-y-2">
              <Button onClick={() => setShowEnvVar(!showEnvVar)} variant="outline" size="sm">
                環境変数の値を表示
              </Button>

              {showEnvVar && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">環境変数名:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">CUSTOM_FORTUNE_DATA</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard("CUSTOM_FORTUNE_DATA")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm font-medium">値:</p>
                  <div className="space-y-2">
                    <Textarea value={envVarValue} readOnly className="text-xs font-mono" rows={6} />
                    <Button size="sm" onClick={() => copyToClipboard(envVarValue)}>
                      <Copy className="h-4 w-4 mr-2" />
                      値をコピー
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">設定手順:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Vercelダッシュボードを開く</li>
                <li>プロジェクト → Settings → Environment Variables</li>
                <li>上記の環境変数名と値を追加</li>
                <li>再デプロイする</li>
              </ol>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.open("https://vercel.com/dashboard", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Vercelダッシュボードを開く
            </Button>
          </CardContent>
        </Card>

        {/* 方法2: Supabase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              方法2: Supabaseデータベース
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Supabaseデータベースにデータを保存します（推奨）。</p>

            <div className="space-y-2">
              <p className="text-sm font-medium">利点:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>リアルタイムでデータ更新</li>
                <li>複数ユーザーでのデータ共有</li>
                <li>バックアップとリストア</li>
                <li>高い可用性</li>
              </ul>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.open("https://supabase.com", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Supabase統合を設定
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertDescription>
          <strong>現在の状態:</strong> データはブラウザのlocalStorageに保存されています。
          ブラウザを変更したり、データをクリアすると失われます。 永続化するには上記の方法のいずれかを実行してください。
        </AlertDescription>
      </Alert>
    </div>
  )
}
