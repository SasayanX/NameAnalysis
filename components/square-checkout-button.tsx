"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

declare global {
  interface Window {
    Square: any
  }
}

interface SquareCheckoutButtonProps {
  planId: "basic" | "premium"
  price: number
  children: React.ReactNode
  className?: string
}

/**
 * Square Web Payments SDKを使用した決済ボタン
 * アプリ内でカード情報を入力して決済を完了します
 */
export function SquareCheckoutButton({
  planId,
  price,
  children,
  className,
}: SquareCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [card, setCard] = useState<any>(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const { toast } = useToast()

  // Square SDKの読み込みと初期化
  useEffect(() => {
    if (!showPaymentDialog) {
      return
    }

    const loadSquareSDK = async () => {
      try {
        // Square SDKが既に読み込まれているかチェック
        if (window.Square) {
          await initializeSquare()
          return
        }

        // 環境に応じたSDK URL
        const envAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
        const isSandbox = envAppId?.startsWith("sandbox-sq0idb-") || 
                         (!envAppId && process.env.NODE_ENV !== "production")
        const sdkUrl = isSandbox
          ? "https://sandbox.web.squarecdn.com/v1/square.js"
          : "https://web.squarecdn.com/v1/square.js"

        const script = document.createElement("script")
        script.src = sdkUrl
        script.async = true
        script.defer = true
        
        script.onload = async () => {
          if (!window.Square) {
            throw new Error('Square.js failed to load properly')
          }
          await initializeSquare()
        }
        
        script.onerror = () => {
          throw new Error('Failed to load Square SDK')
        }
        
        document.head.appendChild(script)
      } catch (error) {
        console.error("Square SDK loading error:", error)
        toast({
          title: "エラー",
          description: "決済システムの読み込みに失敗しました",
          variant: "destructive",
        })
      }
    }

    const initializeSquare = async () => {
      try {
        const cardContainer = document.getElementById("card-container")
        if (!cardContainer) {
          throw new Error('Card container element not found')
        }

        const envAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
        const envLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
        
        const isSandbox = envAppId?.startsWith("sandbox-sq0idb-") || 
                         (!envAppId && process.env.NODE_ENV !== "production")
        
        const applicationId = envAppId || (isSandbox 
          ? "sandbox-sq0idb--5njRFbXokY3Fyr9vp9Wxw" 
          : "sq0idp-CbbdF82IxFWDSqf8D2S0Pw")
        const locationId = envLocationId || (isSandbox 
          ? "LYGVDVHKBNYZC"
          : "L0YH3ASTVNNMA8999")
        
        const payments = window.Square.payments(applicationId, locationId)
        const cardElement = await payments.card()
        await cardElement.attach("#card-container")
        
        setCard(cardElement)
        setSquareLoaded(true)
      } catch (error) {
        console.error("Square initialization error:", error)
        toast({
          title: "エラー",
          description: "決済フォームの初期化に失敗しました",
          variant: "destructive",
        })
      }
    }

    const timer = setTimeout(() => {
      loadSquareSDK()
    }, 100)

    return () => {
      clearTimeout(timer)
      // クリーンアップ: カード要素を削除
      if (card) {
        card.destroy?.()
        setCard(null)
      }
    }
  }, [showPaymentDialog, toast])

  // メールアドレスの初期化（localStorageから取得）
  useEffect(() => {
    if (showPaymentDialog) {
      const savedEmail = localStorage.getItem("customerEmail") || ""
      setCustomerEmail(savedEmail)
    }
  }, [showPaymentDialog])

  const handleCheckout = () => {
    setShowPaymentDialog(true)
  }

  const handlePayment = async () => {
    if (!card || !customerEmail || !customerEmail.includes("@")) {
      toast({
        title: "エラー",
        description: "カード情報とメールアドレスを入力してください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Step 1: カードをトークン化
      const tokenResult = await card.tokenize()
      if (tokenResult.status !== "OK") {
        throw new Error("カード情報の処理に失敗しました")
      }

      // Step 2: 顧客を作成または取得
      const customerResponse = await fetch("/api/square-customers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
        }),
      })

      const customerData = await customerResponse.json()
      if (!customerData.success) {
        throw new Error(customerData.error || "顧客作成に失敗しました")
      }

      // Step 3: カードを登録
      const cardResponse = await fetch("/api/square-cards/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardNonce: tokenResult.token,
          customerId: customerData.customerId,
        }),
      })

      const cardData = await cardResponse.json()
      if (!cardData.success) {
        throw new Error(cardData.error || "カード登録に失敗しました")
      }

      // Step 4: サブスクリプションを作成
      const subscriptionResponse = await fetch("/api/square-subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId,
          cardId: cardData.cardId,
          customerId: customerData.customerId,
          customerEmail: customerEmail,
        }),
      })

      const subscriptionData = await subscriptionResponse.json()

      if (subscriptionResponse.ok && subscriptionData.success) {
        // メールアドレスを保存
        localStorage.setItem("customerEmail", customerEmail)
        
        toast({
          title: "決済完了",
          description: "サブスクリプションが正常に作成されました",
        })
        
        const subscriptionId = subscriptionData.subscription?.squareSubscriptionId || ""
        window.location.href = `/subscription-success?plan=${planId}&amount=${price}&subscriptionId=${subscriptionId}`
      } else {
        throw new Error(subscriptionData.error || "サブスクリプション作成に失敗しました")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "決済エラー",
        description: error instanceof Error ? error.message : "決済処理中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const planName = planId === "basic" ? "ベーシック" : "プレミアム"

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
            処理中...
          </>
        ) : (
          children
        )}
      </Button>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {planName}プラン - 決済
            </DialogTitle>
            <DialogDescription>
              カード情報を入力して決済を完了してください
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* メールアドレス入力 */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            {/* カード情報入力 */}
            <div className="space-y-2">
              <Label>カード情報</Label>
              <div id="card-container" className="min-h-[50px] border rounded-md p-3" />
              {!squareLoaded && (
                <p className="text-sm text-gray-500">読み込み中...</p>
              )}
            </div>

            {/* 金額表示 */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">月額料金</span>
                <span className="text-lg font-bold">¥{price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isLoading || !squareLoaded || !customerEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  決済を完了
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
