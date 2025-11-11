"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PlansIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/plans/features")
  }, [router])

  return null
}

