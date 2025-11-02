"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ShopPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push("/shop/talisman")
  }, [router])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  )
}

