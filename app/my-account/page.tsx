"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, User as UserIcon, ShieldCheck, CalendarDays, Crown, LifeBuoy, LogOut, CreditCard } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanauPointsDisplay } from "@/components/kanau-points-display"
import { getOrCreatePointsSummary, type SupaPointsSummary } from "@/lib/kanau-points-supabase"
import { useSubscription } from "@/lib/subscription-manager"
import { useToast } from "@/hooks/use-toast"

function formatDate(value?: string | Date | null, withTime = false) {
  if (!value) return "記録なし"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "記録なし"
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date)
}

export default function MyAccountPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [summary, setSummary] = useState<SupaPointsSummary | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isResyncing, setIsResyncing] = useState(false)

  const { getCurrentPlan, isActive, getNextBillingDate, getCurrentAmount, syncSubscriptionFromServer } =
    useSubscription()
  const plan = useMemo(() => getCurrentPlan(), [getCurrentPlan])
  const active = useMemo(() => isActive(), [isActive])
  const nextBillingDate = useMemo(() => getNextBillingDate(), [getNextBillingDate])
  const currentAmount = useMemo(() => getCurrentAmount(), [getCurrentAmount])

  useEffect(() => {
    let cancelled = false

    const hydrateSummary = async () => {
      if (!user) return
      setIsLoadingSummary(true)
      setSummaryError(null)

      try {
        const result = await getOrCreatePointsSummary(user.id)
        if (!cancelled) {
          setSummary(result)
        }
      } catch (error) {
        console.error("Failed to load points summary:", error)
        if (!cancelled) {
          setSummaryError("ポイント情報の取得に失敗しました。ページを再読み込みしてください。")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSummary(false)
        }
      }
    }

    hydrateSummary()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleResyncSubscription = async () => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    setIsResyncing(true)
    try {
      const response = await fetch("/api/subscriptions/resync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          customerEmail: user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "サブスクリプションの再同期に失敗しました")
      }

      await syncSubscriptionFromServer()

      toast({
        title: "サブスクリプションを再同期しました",
        description: "最新の決済情報を反映しました。",
      })
    } catch (error: any) {
      console.error("サブスクリプション再同期エラー:", error)
      toast({
        title: "再同期エラー",
        description: error.message || "サブスクリプションの再同期に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsResyncing(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl py-16">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">マイアカウント</CardTitle>
            <CardDescription>ログインすると、ポイントやサブスクリプション情報を確認できます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>まだアカウントをお持ちでない場合は、新規登録して毎日のログインボーナスを受け取りましょう。</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/login">ログインする</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">新規登録</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="container mx-auto max-w-5xl py-12 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">マイアカウント</h1>
        <p className="text-muted-foreground">プロフィール、ポイント、サブスクリプション情報をまとめて確認できます。</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              プロフィール
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">表示名</p>
              <p className="font-semibold">{user.user_metadata?.name || "未設定"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                メールアドレス
              </p>
              <p className="font-semibold break-words">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">登録日</p>
              <p>{formatDate(user.created_at)}</p>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link href="/contact">プロフィール変更を依頼する</Link>
              </Button>
              <Button variant="ghost" className="text-destructive flex items-center gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              セキュリティ
            </CardTitle>
            <CardDescription>安全にご利用いただくための確認事項</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm">パスワード管理</h3>
              <p className="text-sm text-muted-foreground">
                定期的なパスワード更新をおすすめします。変更したい場合はお問い合わせフォームからご連絡ください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">メールアドレス確認</h3>
              <p className="text-sm text-muted-foreground">
                重要なお知らせはメールでお送りします。受信できる設定になっているかご確認ください。
              </p>
            </div>
            <div className="rounded-md border border-muted p-3">
              <p className="text-sm text-muted-foreground">
                近々、二段階認証に対応予定です。対応完了次第、このページから設定できるようになります。
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              カナウポイント
            </CardTitle>
            <CardDescription>ログインボーナスや購入履歴を確認できます。</CardDescription>
          </CardHeader>
          <CardContent>
            <KanauPointsDisplay userId={user.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              サブスクリプション
            </CardTitle>
            <CardDescription>現在のプランと請求状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ご利用中のプラン</p>
              <p className="text-xl font-semibold">{plan.name}</p>
              <Badge variant={active ? "default" : "secondary"} className="mt-1">
                {active ? "有効" : "無料プラン"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">月額料金</p>
              <p>{currentAmount > 0 ? `${currentAmount.toLocaleString()}円 / 月` : "0円"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                次回請求予定日
              </p>
              <p>{active ? formatDate(nextBillingDate) : "利用中の有料プランはありません"}</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" asChild>
                <Link href="/plans">プラン内容を確認</Link>
              </Button>
              <Button asChild>
                <Link href="/my-subscription">契約状況の詳細</Link>
              </Button>
              <Button
                variant="secondary"
                onClick={handleResyncSubscription}
                disabled={isResyncing}
              >
                {isResyncing ? "再確認中..." : "購入状況を再確認する"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              最近のログイン状況
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSummary && <p className="text-sm text-muted-foreground">読み込み中です...</p>}
            {summaryError && <p className="text-sm text-destructive">{summaryError}</p>}
            {summary && !isLoadingSummary && (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">最終ログイン日時</p>
                  <p>{formatDate(summary.last_login_date, true)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ログインボーナス受取日</p>
                  <p>{formatDate(summary.last_login_bonus_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">連続ログイン日数</p>
                  <p>{summary.consecutive_login_days} 日</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              サポート
            </CardTitle>
            <CardDescription>困ったときはこちらをご確認ください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="font-semibold">ヘルプ & ガイド</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  <Link href="/legal/refund-policy" className="underline hover:no-underline">
                    返金・キャンセルポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms-of-service" className="underline hover:no-underline">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/docs/kanau-points-earning-methods" className="underline hover:no-underline">
                    カナウポイント獲得方法
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">お問い合わせ</p>
              <p className="text-sm text-muted-foreground">
                返金や契約内容の確認など、お困りの際はお問い合わせページからご連絡ください。
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">お問い合わせフォームへ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}


