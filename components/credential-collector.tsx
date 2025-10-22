"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

interface Credential {
  key: string
  label: string
  placeholder: string
  location: string
  format: string
  sensitive: boolean
  required: boolean
}

const CREDENTIALS: Credential[] = [
  {
    key: "SQUARE_APPLICATION_ID",
    label: "本番 Application ID",
    placeholder: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
    location: "Dashboard → アプリ選択 → Production → Credentials",
    format: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
    sensitive: false,
    required: true,
  },
  {
    key: "SQUARE_ACCESS_TOKEN",
    label: "本番 Access Token",
    placeholder: "EAAAE...",
    location: "Dashboard → アプリ選択 → Production → Credentials → Show ボタン",
    format: "EAAAExxxxxxxxxxxxxxxxxx",
    sensitive: true,
    required: true,
  },
  {
    key: "SQUARE_LOCATION_ID",
    label: "本番 Location ID",
    placeholder: "LMxxxxxxxxxxxxxxxxxx",
    location: "Dashboard → アプリ選択 → Production → Locations",
    format: "LMxxxxxxxxxxxxxxxxxx",
    sensitive: false,
    required: true,
  },
  {
    key: "SQUARE_WEBHOOK_SIGNATURE_KEY",
    label: "Webhook 署名キー",
    placeholder: "32文字の英数字",
    location: "Dashboard → Webhooks → 作成したエンドポイント",
    format: "32文字のランダム文字列",
    sensitive: true,
    required: true,
  },
  {
    key: "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
    label: "フロントエンド用 Application ID",
    placeholder: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
    location: "本番 Application ID と同じ",
    format: "sq0idp- で始まる",
    sensitive: false,
    required: true,
  },
  {
    key: "NEXT_PUBLIC_SQUARE_LOCATION_ID",
    label: "フロントエンド用 Location ID",
    placeholder: "LMxxxxxxxxxxxxxxxxxx",
    location: "本番 Location ID と同じ",
    format: "LM で始まる",
    sensitive: false,
    required: true,
  },
]

export function CredentialCollector() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSensitive = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateEnvFile = () => {
    let content = "# 姓名判断アプリ - Square 本番環境変数\n"
    content += "# Vercel Dashboard → Settings → Environment Variables に設定\n\n"

    CREDENTIALS.forEach((cred) => {
      content += `# ${cred.label}\n`
      content += `# 取得場所: ${cred.location}\n`
      content += `${cred.key}=${values[cred.key] || ""}\n\n`
    })

    return content
  }

  const allRequiredFilled = CREDENTIALS.filter((c) => c.required).every((c) => values[c.key]?.trim())
  const filledCount = CREDENTIALS.filter((c) => values[c.key]?.trim()).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Square 認証情報収集
            {allRequiredFilled ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>進捗状況</span>
              <span>
                {filledCount}/{CREDENTIALS.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(filledCount / CREDENTIALS.length) * 100}%` }}
              />
            </div>
          </div>

          {allRequiredFilled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800 font-medium">✅ すべての必須情報が入力されました！</p>
              <p className="text-green-700 text-sm">下の環境変数をコピーして Vercel に設定してください。</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {CREDENTIALS.map((cred) => (
          <Card key={cred.key}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={cred.key} className="font-medium">
                    {cred.label}
                  </Label>
                  {cred.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">必須</span>}
                  {cred.sensitive && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">機密</span>
                  )}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>取得場所:</strong> Square Dashboard → {cred.location}
                  </p>
                  <p>
                    <strong>形式:</strong> {cred.format}
                  </p>
                </div>

                <div className="relative">
                  <Input
                    id={cred.key}
                    type={cred.sensitive && !showSensitive[cred.key] ? "password" : "text"}
                    placeholder={cred.placeholder}
                    value={values[cred.key] || ""}
                    onChange={(e) => updateValue(cred.key, e.target.value)}
                    className={values[cred.key] ? "border-green-300" : ""}
                  />
                  {cred.sensitive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSensitive(cred.key)}
                    >
                      {showSensitive[cred.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filledCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              環境変数ファイル
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
            <Textarea value={generateEnvFile()} readOnly className="font-mono text-sm" rows={20} />
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">次のステップ:</p>
              <ol className="text-sm text-blue-700 mt-1 space-y-1">
                <li>1. 上記の内容をコピー</li>
                <li>2. Vercel Dashboard → プロジェクト → Settings → Environment Variables</li>
                <li>3. 各環境変数を個別に追加（Production, Preview, Development すべてにチェック）</li>
                <li>4. 保存後、再デプロイを実行</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
