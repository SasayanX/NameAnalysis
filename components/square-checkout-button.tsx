"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

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
    setIsLoading(true)

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

    // Square Payment Linkに直接リダイレクト
    // 決済完了後、Square側で設定したリダイレクトURLに戻ります
    window.location.href = paymentLink
  }

  return (
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
  )
}
