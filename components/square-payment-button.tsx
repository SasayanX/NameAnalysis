"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

interface Plan {
  id: string
  name: string
  price: number
}

interface SquarePaymentButtonProps {
  plan: Plan
  onSuccess?: (subscriptionId: string) => void
}

const SquarePaymentButton: React.FC<SquarePaymentButtonProps> = ({ plan, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<any>(null) // Type 'any' is used for simplicity; consider a more specific type

  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""

  const initializeCard = useCallback(async () => {
    if (!window.Square) {
      console.error("Square SDK not loaded!")
      return
    }

    const payments = window.Square.payments(applicationId, locationId)

    try {
      const card = await payments.card({
        style: {
          ".input-container": {
            border: "1px solid #ccc",
            padding: "0.5rem",
            marginBottom: "1rem",
          },
          "input::placeholder": {
            color: "#999",
          },
        },
      })
      await card.attach("#card-container")
      setCard(card)
    } catch (e) {
      console.error("Initializing Card failed", e)
      setError("カード情報の初期化に失敗しました")
    }
  }, [applicationId, locationId])

  useEffect(() => {
    if (applicationId && locationId) {
      initializeCard()
    }
  }, [applicationId, locationId, initializeCard])

  // handlePayment関数内で、Square Web Payments SDKを使用してカードをトークン化
  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Square Web Payments SDKでカードトークンを取得
      const tokenResult = await card.tokenize()

      if (tokenResult.status === "OK") {
        // サブスクリプション作成API呼び出し
        const response = await fetch("/api/subscription/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
            paymentMethod: "square",
            cardNonce: tokenResult.token,
          }),
        })

        const result = await response.json()

        if (result.success) {
          onSuccess?.(result.subscriptionId)
        } else {
          setError(result.error)
        }
      } else {
        setError("カード情報の処理に失敗しました")
      }
    } catch (error) {
      setError("決済処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div id="card-container"></div>
      <button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? "処理中..." : `申し込む (${plan.price}円)`}
      </button>
    </div>
  )
}

export default SquarePaymentButton
export { SquarePaymentButton }
