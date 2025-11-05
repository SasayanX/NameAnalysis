"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, User as UserIcon, Chrome, CheckCircle2 } from "lucide-react"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          // ログイン成功後、元のページに戻る
          const returnUrl = sessionStorage.getItem('returnUrl')
          if (returnUrl) {
            sessionStorage.removeItem('returnUrl')
            window.location.href = returnUrl
            return
          }
        }
      } else {
        const { data, error } = await signUp(email, password, name)
        if (error) {
          setError(error.message)
        } else if (data?.user && !data.session) {
          // メール確認が必要な場合
          setSuccessMessage("登録メールを送信しました。メールボックスを確認して認証リンクをクリックしてください。メールが届かない場合はスパムフォルダもご確認ください。")
        } else if (data?.session) {
          // メール確認がスキップされた場合（開発環境など）
          setSuccessMessage("登録が完了しました！")
          // 登録成功後、元のページに戻る
          const returnUrl = sessionStorage.getItem('returnUrl')
          if (returnUrl) {
            sessionStorage.removeItem('returnUrl')
            window.location.href = returnUrl
            return
          }
        }
      }
    } catch {
      setError("予期しないエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) setError(error.message)
    } catch {
      setError("Google認証でエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{isLogin ? "ログイン" : "新規登録"}</CardTitle>
        <CardDescription className="text-center">
          {isLogin ? "カナウポイントにアクセス" : "新しいアカウントを作成"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error.includes("404") || error.includes("接続できません") ? (
                  <div className="mt-2">
                    <a
                      href="/debug-supabase"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:no-underline"
                    >
                      Supabase接続診断ページを開く
                    </a>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "処理中..." : isLogin ? "ログイン" : "新規登録"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
              <Chrome className="mr-2 h-4 w-4" /> Googleで{isLogin ? "ログイン" : "登録"}
            </Button>
            {!isLogin && (
              <p className="text-xs text-center text-muted-foreground">
                💡 メール認証が届かない場合、Google認証がおすすめです
              </p>
            )}
          </div>

          <div className="text-center">
            <Button type="button" variant="link" className="text-sm" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "アカウント作成はこちら" : "既にアカウントをお持ちの方はこちら"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


