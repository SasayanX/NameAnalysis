"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Info, CheckCircle, ExternalLink, Smartphone, Monitor } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SquareCheckoutButtonProps {
  planId: "basic" | "premium"
  price: number
  children: React.ReactNode
  className?: string
}

/**
 * Square Payment Linksを使用した外部決済ボタン
 * Square側で作成したPayment Linkを直接使用します
 * 
 * 設定方法：
 * 環境変数 SQUARE_PAYMENT_LINK_BASIC と SQUARE_PAYMENT_LINK_PREMIUM
 * にSquare Payment LinkのURLを設定してください
 */
export function SquareCheckoutButton({
  planId,
  price,
  children,
  className,
}: SquareCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()

  // モバイル判定
  useEffect(() => {
    if (typeof window === "undefined") return
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const getPaymentLink = (): string | null => {
    // 環境変数からSquare Payment Linkを取得
    if (planId === "basic") {
      return process.env.NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC || "https://square.link/u/6sJ33DdY"
    }
    if (planId === "premium") {
      return process.env.NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM || "https://square.link/u/TjSKFJhj"
    }
    return null
  }

  const handleCheckout = () => {
    // まず情報ダイアログを表示
    setShowInfoDialog(true)
  }

  const handleConfirmCheckout = () => {
    setIsLoading(true)
    setShowInfoDialog(false)

    const paymentLink = getPaymentLink()

    if (!paymentLink) {
      toast({
        title: "エラー",
        description: "決済リンクが設定されていません",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // メールアドレスを入力してもらう（簡易版）
    // 実際の実装では、認証システムから取得するか、フォームで入力してもらう
    const customerEmail = prompt("決済完了後の確認用にメールアドレスを入力してください:\n\n例: kanaukiryu@gmail.com")
    
    if (customerEmail && customerEmail.includes("@")) {
      // メールアドレスをlocalStorageに保存（決済完了後の確認用）
      localStorage.setItem("customerEmail", customerEmail)
      toast({
        title: "メールアドレスを保存しました",
        description: "決済完了後、自動的にプランを有効化します",
      })
    }

    // Square Payment Linkに直接リダイレクト
    // 決済完了後、Square側で設定したリダイレクトURLに戻ります
    window.location.href = paymentLink
  }

  const planName = planId === "basic" ? "ベーシック" : "プレミアム"
  const returnUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/my-subscription?email=${localStorage.getItem("customerEmail") || "your@email.com"}`
    : "https://your-app.com/my-subscription?email=your@email.com"

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className={className}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            読み込み中...
          </>
        ) : (
          children
        )}
      </Button>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              決済について
            </DialogTitle>
            <DialogDescription>
              決済完了後の手順をご確認ください
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* ウェブ版の説明 */}
            {!isMobile && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  ウェブ版：決済完了後の手順
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>決済完了後、Square側の「決済が正常に完了しました」ページが表示されます</li>
                  <li>そのページから、以下のURLにアクセスしてください：</li>
                </ol>
                <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                  <div className="text-xs text-blue-600 mb-1">マイページURL:</div>
                  <div className="font-mono text-xs break-all text-blue-900">
                    {returnUrl}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(returnUrl)
                      toast({
                        title: "URLをコピーしました",
                        description: "決済完了後にこのURLにアクセスしてください",
                      })
                    }}
                  >
                    URLをコピー
                  </Button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  💡 このURLにアクセスすると、自動的にプランが有効化されます（約0.5秒）
                </p>
              </div>
            )}

            {/* モバイル版の説明 */}
            {isMobile && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  モバイル版：決済完了後の手順
                </h4>
                <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                  <li>決済完了後、Square側の「決済が正常に完了しました」ページが表示されます</li>
                  <li>アプリに戻る（ブラウザの戻るボタン、またはアプリを再起動）</li>
                  <li>アプリが自動的に決済を確認し、プランを有効化します（約1秒）</li>
                </ol>
                <div className="mt-3 p-3 bg-white rounded border border-green-300">
                  <div className="text-xs text-green-600 mb-1">💡 自動有効化について</div>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• メールアドレスは既に保存済みです</li>
                    <li>• アプリに戻ると自動的に決済が確認されます</li>
                    <li>• 手動操作は不要です</li>
                  </ul>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  ⚠️ もし自動有効化されない場合は、以下にアクセスしてください：
                </p>
                <div className="mt-2 p-2 bg-white rounded border border-green-300">
                  <div className="font-mono text-xs break-all text-green-900">
                    {returnUrl}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ 重要</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 決済は正常に完了しています</li>
                <li>• プランは自動的に有効化されます（ウェブ: 約0.5秒、モバイル: 約1秒）</li>
                <li>• 決済完了後、すぐに希望のプランが表示されます</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmCheckout} className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              決済ページへ進む
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
