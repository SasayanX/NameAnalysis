"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Eye, EyeOff } from "lucide-react"

interface EnvVariable {
  name: string
  description: string
  required: boolean
  sensitive: boolean
  example?: string
}

const ENV_VARIABLES: EnvVariable[] = [
  {
    name: "SQUARE_APPLICATION_ID",
    description: "Square アプリケーション ID（本番環境）",
    required: true,
    sensitive: false,
    example: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
  },
  {
    name: "SQUARE_ACCESS_TOKEN",
    description: "Square アクセストークン（本番環境）",
    required: true,
    sensitive: true,
    example: "EAAAExxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    name: "SQUARE_LOCATION_ID",
    description: "Square ロケーション ID",
    required: true,
    sensitive: false,
    example: "LMxxxxxxxxxxxxxx",
  },
  {
    name: "SQUARE_WEBHOOK_SIGNATURE_KEY",
    description: "Webhook 署名検証キー",
    required: true,
    sensitive: true,
    example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    name: "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
    description: "フロントエンド用 Square アプリケーション ID",
    required: true,
    sensitive: false,
    example: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
  },
  {
    name: "NEXT_PUBLIC_SQUARE_LOCATION_ID",
    description: "フロントエンド用 Square ロケーション ID",
    required: true,
    sensitive: false,
    example: "LMxxxxxxxxxxxxxx",
  },
  {
    name: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    description: "Google Analytics 4 の測定ID（公開可能）",
    required: false,
    sensitive: false,
    example: "G-XXXXXXXXXX",
  },
  {
    name: "NEXT_PUBLIC_CLARITY_PROJECT_ID",
    description: "Microsoft Clarity のプロジェクトID（公開可能）",
    required: false,
    sensitive: false,
    example: "clarity-project-id",
  },
]

export function EnvironmentVariablesGuide() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})

  const updateValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const toggleSensitive = (name: string) => {
    setShowSensitive((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const generateEnvFile = () => {
    let content = "# 姓名判断アプリ - 本番環境変数\n\n"
    ENV_VARIABLES.forEach((envVar) => {
      content += `# ${envVar.description}\n`
      content += `${envVar.name}=${values[envVar.name] || ""}\n\n`
    })
    return content
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const allRequiredFilled = ENV_VARIABLES.filter((env) => env.required).every((env) => values[env.name])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>環境変数設定ガイド</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            以下の環境変数を Vercel Dashboard で設定してください。すべての必須項目を入力すると、.env
            ファイルを生成できます。
          </p>

          <div className="space-y-4">
            {ENV_VARIABLES.map((envVar) => (
              <div key={envVar.name} className="space-y-2">
                <Label htmlFor={envVar.name} className="flex items-center gap-2">
                  {envVar.name}
                  {envVar.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">必須</span>}
                  {envVar.sensitive && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">機密</span>
                  )}
                </Label>
                <p className="text-xs text-gray-500">{envVar.description}</p>
                <div className="relative">
                  <Input
                    id={envVar.name}
                    type={envVar.sensitive && !showSensitive[envVar.name] ? "password" : "text"}
                    placeholder={envVar.example}
                    value={values[envVar.name] || ""}
                    onChange={(e) => updateValue(envVar.name, e.target.value)}
                  />
                  {envVar.sensitive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSensitive(envVar.name)}
                    >
                      {showSensitive[envVar.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {allRequiredFilled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              生成された .env ファイル
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateEnvFile())}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                コピー
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generateEnvFile()}
              readOnly
              className="font-mono text-sm"
              rows={ENV_VARIABLES.length * 3}
            />
            <p className="text-xs text-gray-500 mt-2">
              このファイルの内容を Vercel Dashboard の Environment Variables に設定してください。
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vercel での設定手順</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Vercel Dashboard にログイン</li>
            <li>プロジェクトを選択</li>
            <li>Settings タブをクリック</li>
            <li>Environment Variables を選択</li>
            <li>上記の環境変数を一つずつ追加</li>
            <li>Production, Preview, Development すべてにチェック</li>
            <li>Save をクリック</li>
            <li>再デプロイを実行</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
