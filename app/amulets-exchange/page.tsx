"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AmuletsExchangePage() {
  const router = useRouter()
  
  useEffect(() => {
    // お守りショップへリダイレクト
    router.replace("/shop/talisman")
  }, [router])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">お守りショップへ移動しています...</p>
      </div>
    </div>
  )
}

