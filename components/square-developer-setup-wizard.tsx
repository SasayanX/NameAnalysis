"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Circle, ExternalLink, Copy, AlertTriangle } from "lucide-react"

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  details: string[]
  links?: { text: string; url: string }[]
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "account",
    title: "Square アカウント作成",
    description: "Square Developer Console にアクセスしてアカウントを作成",
    completed: false,
    details: [
      "https://developer.squareup.com/ にアクセス",
      "「Get Started」ボタンをクリック",
      "Square アカウントでログイン（なければ新規作成）",
      "開発者利用規約に同意",
    ],
    links: [{ text: "Square Developer Console", url: "https://developer.squareup.com/" }],
  },
  {
    id: "application",
    title: "アプリケーション作成",
    description: "新しいアプリケーションを作成して基本設定を行う",
    completed: false,
    details: [
      "Dashboard で「Create your first application」をクリック",
      "アプリケーション名: 「姓名判断アプリ」を入力",
      "「Create Application」をクリック",
      "アプリケーションが作成されたことを確認",
    ],
  },
  {
    id: "sandbox-credentials",
    title: "サンドボックス認証情報取得",
    description: "テスト用の認証情報を取得",
    completed: false,
    details: [
      "作成したアプリケーションをクリック",
      "「Sandbox」タブを選択",
      "Application ID をコピー（sandbox-sq0idb- で始まる）",
      "Access Token をコピー（EAAAEで始まる）",
      "Location ID をコピー（LHで始まる）",
    ],
  },
  {
    id: "production-credentials",
    title: "本番環境認証情報取得",
    description: "本番用の認証情報を取得",
    completed: false,
    details: [
      "「Production」タブを選択",
      "Application ID をコピー（sq0idp- で始まる）",
      "Access Token をコピー（本番用）",
      "Location ID をコピー（LMで始まる）",
      "⚠️ 本番用トークンは絶対に公開しないこと",
    ],
  },
  {
    id: "webhook",
    title: "Webhook エンドポイント設定",
    description: "決済イベントを受信するWebhookを設定",
    completed: false,
    details: [
      "左メニューから「Webhooks」を選択",
      "「Add Endpoint」をクリック",
      "URL: https://your-domain.vercel.app/api/square-webhook を入力",
      "Events で以下を選択:",
      "  - subscription.created",
      "  - subscription.updated",
      "  - subscription.canceled",
      "「Save」をクリック",
      "生成された署名キーをコピー",
    ],
  },
  {
    id: "subscription-plans",
    title: "サブスクリプションプラン作成",
    description: "ベーシックとプレミアムプランを作成",
    completed: false,
    details: [
      "左メニューから「Subscriptions」→「Plans」を選択",
      "「Create Plan」をクリック",
      "ベーシックプラン:",
      "  - Plan Name: Basic Plan",
      "  - Price: ¥220",
      "  - Billing Frequency: Monthly",
      "  - Plan ID: basic-plan",
      "プレミアムプラン:",
      "  - Plan Name: Premium Plan",
      "  - Price: ¥440",
      "  - Billing Frequency: Monthly",
      "  - Plan ID: premium-plan",
    ],
  },
]

const REQUIRED_CREDENTIALS = {
  sandbox: {
    applicationId: {
      location: "Dashboard → アプリ選択 → Sandbox → Credentials",
      format: "sandbox-sq0idb-xxxxxxxxxx",
      example: "sandbox-sq0idb-wGVapF8sNt9PLrdj5znuKA",
    },
    accessToken: {
      location: "Dashboard → アプリ選択 → Sandbox → Credentials",
      format: "EAAAExxxxxxxxxxxxxxxxxx",
      note: "「Show」ボタンをクリックして表示",
    },
    locationId: {
      location: "Dashboard → アプリ選択 → Sandbox → Locations",
      format: "LHxxxxxxxxxxxxxxxxxx",
      note: "Default Test Account の Location ID",
    },
  },
  production: {
    applicationId: {
      location: "Dashboard → アプリ選択 → Production → Credentials",
      format: "sq0idp-xxxxxxxxxxxxxxxxxx",
      example: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
    },
    accessToken: {
      location: "Dashboard → アプリ選択 → Production → Credentials",
      format: "EAAAExxxxxxxxxxxxxxxxxx",
      note: "本番用トークン - 絶対に公開禁止",
    },
    locationId: {
      location: "Dashboard → アプリ選択 → Production → Locations",
      format: "LMxxxxxxxxxxxxxxxxxx",
      note: "実際の店舗・事業所の Location ID",
    },
  },
  webhook: {
    signatureKey: {
      location: "Dashboard → Webhooks → エンドポイント作成後",
      format: "32文字の英数字",
      note: "エンドポイント作成時に自動生成される",
    },
  },
}

export function SquareDeveloperSetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>(SETUP_STEPS)
  const [credentials, setCredentials] = useState({
    sandboxAppId: "",
    sandboxAccessToken: "",
    sandboxLocationId: "",
    productionAppId: "",
    productionAccessToken: "",
    productionLocationId: "",
    webhookSignatureKey: "",
    webhookUrl: "",
  })

  const toggleStep = (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: !step.completed } : step)))
  }

  const updateCredential = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const completedSteps = steps.filter((step) => step.completed).length
  const progressPercentage = Math.round((completedSteps / steps.length) * 100)

  const generateEnvVariables = () => {
    return `# Square 認証情報（本番環境）
SQUARE_APPLICATION_ID=${credentials.productionAppId}
SQUARE_ACCESS_TOKEN=${credentials.productionAccessToken}
SQUARE_LOCATION_ID=${credentials.productionLocationId}
SQUARE_WEBHOOK_SIGNATURE_KEY=${credentials.webhookSignatureKey}

# フロントエンド用（Public）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=${credentials.productionAppId}
NEXT_PUBLIC_SQUARE_LOCATION_ID=${credentials.productionLocationId}

# サンドボックス用（開発・テスト）
SQUARE_SANDBOX_APPLICATION_ID=${credentials.sandboxAppId}
SQUARE_SANDBOX_ACCESS_TOKEN=${credentials.sandboxAccessToken}
SQUARE_SANDBOX_LOCATION_ID=${credentials.sandboxLocationId}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Square Developer セットアップ進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>進捗状況</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {progressPercentage === 100 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎉 Square Developer 設定完了！</p>
                <p className="text-green-700 text-sm">
                  すべての設定が完了しました。次は環境変数の設定に進んでください。
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {steps.map((step, index) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => toggleStep(step.id)} className="p-0 h-auto">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </Button>
              <span className="text-lg">
                {index + 1}. {step.title}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{step.description}</p>

            {step.links && (
              <div className="mb-4">
                {step.links.map((link, linkIndex) => (
                  <Button key={linkIndex} variant="outline" asChild className="mr-2 bg-transparent">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {link.text}
                    </a>
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">手順:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className={detail.startsWith("⚠️") ? "text-red-600 font-medium" : ""}>
                    {detail}
                  </li>
                ))}
              </ol>
            </div>

            {step.id === "sandbox-credentials" && (
              <div className="mt-4 space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800">サンドボックス認証情報</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="sandboxAppId">Application ID (sandbox)</Label>
                    <Input
                      id="sandboxAppId"
                      placeholder="sandbox-sq0idb-..."
                      value={credentials.sandboxAppId}
                      onChange={(e) => updateCredential("sandboxAppId", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.sandbox.applicationId.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.sandbox.applicationId.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.applicationId.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.sandbox.applicationId.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.applicationId.example && (
                      <p className="text-xs text-gray-500 mt-1">
                        例: {REQUIRED_CREDENTIALS.sandbox.applicationId.example}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sandboxAccessToken">Access Token (sandbox)</Label>
                    <Input
                      id="sandboxAccessToken"
                      type="password"
                      placeholder="EAAAE..."
                      value={credentials.sandboxAccessToken}
                      onChange={(e) => updateCredential("sandboxAccessToken", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.sandbox.accessToken.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.sandbox.accessToken.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.accessToken.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.sandbox.accessToken.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.accessToken.note && (
                      <p className="text-xs text-gray-500 mt-1">注: {REQUIRED_CREDENTIALS.sandbox.accessToken.note}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sandboxLocationId">Location ID (sandbox)</Label>
                    <Input
                      id="sandboxLocationId"
                      placeholder="LH..."
                      value={credentials.sandboxLocationId}
                      onChange={(e) => updateCredential("sandboxLocationId", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.sandbox.locationId.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.sandbox.locationId.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.locationId.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.sandbox.locationId.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.sandbox.locationId.note && (
                      <p className="text-xs text-gray-500 mt-1">注: {REQUIRED_CREDENTIALS.sandbox.locationId.note}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step.id === "production-credentials" && (
              <div className="mt-4 space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h5 className="font-medium text-red-800">本番環境認証情報（機密情報）</h5>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="productionAppId">Application ID (production)</Label>
                    <Input
                      id="productionAppId"
                      placeholder="sq0idp-..."
                      value={credentials.productionAppId}
                      onChange={(e) => updateCredential("productionAppId", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.production.applicationId.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.production.applicationId.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.applicationId.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.production.applicationId.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.applicationId.example && (
                      <p className="text-xs text-gray-500 mt-1">
                        例: {REQUIRED_CREDENTIALS.production.applicationId.example}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="productionAccessToken">Access Token (production)</Label>
                    <Input
                      id="productionAccessToken"
                      type="password"
                      placeholder="EAAAE..."
                      value={credentials.productionAccessToken}
                      onChange={(e) => updateCredential("productionAccessToken", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.production.accessToken.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.production.accessToken.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.accessToken.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.production.accessToken.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.accessToken.note && (
                      <p className="text-xs text-gray-500 mt-1">
                        注: {REQUIRED_CREDENTIALS.production.accessToken.note}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="productionLocationId">Location ID (production)</Label>
                    <Input
                      id="productionLocationId"
                      placeholder="LM..."
                      value={credentials.productionLocationId}
                      onChange={(e) => updateCredential("productionLocationId", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.production.locationId.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.production.locationId.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.locationId.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.production.locationId.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.production.locationId.note && (
                      <p className="text-xs text-gray-500 mt-1">
                        注: {REQUIRED_CREDENTIALS.production.locationId.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step.id === "webhook" && (
              <div className="mt-4 space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800">Webhook 設定</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-domain.vercel.app/api/square-webhook"
                      value={credentials.webhookUrl}
                      onChange={(e) => updateCredential("webhookUrl", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">デプロイ後に実際のドメインに更新してください</p>
                  </div>
                  <div>
                    <Label htmlFor="webhookSignatureKey">Webhook 署名キー</Label>
                    <Input
                      id="webhookSignatureKey"
                      type="password"
                      placeholder="署名キーを入力"
                      value={credentials.webhookSignatureKey}
                      onChange={(e) => updateCredential("webhookSignatureKey", e.target.value)}
                    />
                    {REQUIRED_CREDENTIALS.webhook.signatureKey.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        場所: {REQUIRED_CREDENTIALS.webhook.signatureKey.location}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.webhook.signatureKey.format && (
                      <p className="text-xs text-gray-500 mt-1">
                        形式: {REQUIRED_CREDENTIALS.webhook.signatureKey.format}
                      </p>
                    )}
                    {REQUIRED_CREDENTIALS.webhook.signatureKey.note && (
                      <p className="text-xs text-gray-500 mt-1">注: {REQUIRED_CREDENTIALS.webhook.signatureKey.note}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {completedSteps >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              環境変数設定用コード
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateEnvVariables())}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                コピー
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={generateEnvVariables()} readOnly className="font-mono text-sm" rows={12} />
            <p className="text-xs text-gray-500 mt-2">この内容を Vercel の環境変数に設定してください。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
