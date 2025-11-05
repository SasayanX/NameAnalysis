"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { getSupabaseClient, isSupabaseAvailable } from "@/lib/supabase-client"

export default function DebugSupabasePage() {
  const [checks, setChecks] = useState<{
    envVars: "checking" | "ok" | "error"
    urlValid: "checking" | "ok" | "error"
    connection: "checking" | "ok" | "error"
    auth: "checking" | "ok" | "error"
  }>({
    envVars: "checking",
    urlValid: "checking",
    connection: "checking",
    auth: "checking",
  })
  const [messages, setMessages] = useState<string[]>([])
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const newMessages: string[] = []
    const newDetails: any = {}

    // 1. 環境変数のチェック
    setChecks((prev) => ({ ...prev, envVars: "checking" }))
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setChecks((prev) => ({ ...prev, envVars: "error" }))
      newMessages.push("❌ 環境変数が設定されていません")
      newDetails.envVars = {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "設定済み" : "未設定",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "設定済み" : "未設定",
      }
      setMessages(newMessages)
      setDetails(newDetails)
      return
    }
    setChecks((prev) => ({ ...prev, envVars: "ok" }))
    newMessages.push("✅ 環境変数は設定されています")
    newDetails.envVars = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl.substring(0, 30) + "...",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey.substring(0, 20) + "...",
    }

    // 2. URLの妥当性チェック
    setChecks((prev) => ({ ...prev, urlValid: "checking" }))
    try {
      const url = new URL(supabaseUrl)
      if (!url.hostname || url.hostname.length === 0) {
        throw new Error("ホスト名が無効です")
      }
      if (!url.protocol || !url.protocol.startsWith("https")) {
        newMessages.push("⚠️ URLがHTTPSではありません（開発環境では問題ありません）")
      }
      setChecks((prev) => ({ ...prev, urlValid: "ok" }))
      newMessages.push("✅ Supabase URLは有効です")
      newDetails.urlValid = {
        hostname: url.hostname,
        protocol: url.protocol,
        pathname: url.pathname,
      }
    } catch (e: any) {
      setChecks((prev) => ({ ...prev, urlValid: "error" }))
      newMessages.push(`❌ Supabase URLが無効です: ${e.message}`)
      newDetails.urlValid = { error: e.message }
    }

    // 3. 接続テスト
    setChecks((prev) => ({ ...prev, connection: "checking" }))
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントを作成できませんでした")
      }

      // ヘルスチェックAPIを呼び出し
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })

      if (response.status === 404) {
        setChecks((prev) => ({ ...prev, connection: "error" }))
        newMessages.push(`❌ Supabase 404エラー: サーバーが見つかりません`)
        newDetails.connection = {
          status: response.status,
          statusText: response.statusText,
          url: supabaseUrl,
        }
      } else if (response.ok || response.status === 200) {
        setChecks((prev) => ({ ...prev, connection: "ok" }))
        newMessages.push("✅ Supabaseサーバーに接続できました")
        newDetails.connection = {
          status: response.status,
          statusText: response.statusText,
        }
      } else {
        setChecks((prev) => ({ ...prev, connection: "error" }))
        newMessages.push(`⚠️ Supabase接続エラー: ${response.status} ${response.statusText}`)
        newDetails.connection = {
          status: response.status,
          statusText: response.statusText,
        }
      }
    } catch (e: any) {
      setChecks((prev) => ({ ...prev, connection: "error" }))
      newMessages.push(`❌ 接続エラー: ${e.message}`)
      newDetails.connection = { error: e.message }
    }

    // 4. 認証テスト
    setChecks((prev) => ({ ...prev, auth: "checking" }))
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabaseクライアントが利用できません")
      }

      const { data: session, error } = await supabase.auth.getSession()
      if (error) {
        setChecks((prev) => ({ ...prev, auth: "error" }))
        newMessages.push(`❌ 認証エラー: ${error.message}`)
        if (error.message?.includes("404") || error.status === 404) {
          newMessages.push("   → Supabase URLが正しく設定されているか確認してください")
        }
        newDetails.auth = {
          error: error.message,
          status: error.status,
        }
      } else {
        setChecks((prev) => ({ ...prev, auth: "ok" }))
        newMessages.push("✅ 認証機能は正常です")
        newDetails.auth = {
          hasSession: !!session?.session,
          userId: session?.session?.user?.id || "なし",
        }
      }
    } catch (e: any) {
      setChecks((prev) => ({ ...prev, auth: "error" }))
      newMessages.push(`❌ 認証テストエラー: ${e.message}`)
      newDetails.auth = { error: e.message }
    }

    setMessages(newMessages)
    setDetails(newDetails)
  }

  const getStatusIcon = (status: "checking" | "ok" | "error") => {
    if (status === "checking") return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Supabase接続診断
          </CardTitle>
          <CardDescription>
            Supabaseの接続状態を確認し、404エラーなどの問題を診断します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 診断結果 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(checks.envVars)}
                  環境変数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {checks.envVars === "ok"
                    ? "環境変数は正しく設定されています"
                    : checks.envVars === "error"
                      ? "環境変数が設定されていません"
                      : "確認中..."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(checks.urlValid)}
                  URL妥当性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {checks.urlValid === "ok"
                    ? "URLは有効です"
                    : checks.urlValid === "error"
                      ? "URLが無効です"
                      : "確認中..."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(checks.connection)}
                  サーバー接続
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {checks.connection === "ok"
                    ? "サーバーに接続できました"
                    : checks.connection === "error"
                      ? "サーバーに接続できません"
                      : "確認中..."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(checks.auth)}
                  認証機能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {checks.auth === "ok"
                    ? "認証機能は正常です"
                    : checks.auth === "error"
                      ? "認証エラーが発生しました"
                      : "確認中..."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* メッセージ */}
          <div className="space-y-2">
            <h3 className="font-semibold">診断結果</h3>
            {messages.map((msg, i) => (
              <Alert key={i} variant={msg.startsWith("❌") ? "destructive" : msg.startsWith("⚠️") ? "default" : "default"}>
                <AlertDescription>{msg}</AlertDescription>
              </Alert>
            ))}
          </div>

          {/* 詳細情報 */}
          {details && (
            <div className="space-y-2">
              <h3 className="font-semibold">詳細情報</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          {/* 再診断ボタン */}
          <Button onClick={runDiagnostics} className="w-full">
            再診断
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

