"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NameAnalyzerPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/")
  }, [router])
  return null
}
