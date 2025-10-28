"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PointDisplay } from '@/components/point-display'

export default function PointsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">運命ポイント</h1>
          <p className="text-gray-600">
            毎日ログインしてポイントを貯め、お守りを購入しましょう！
          </p>
        </div>
        
        <PointDisplay />
      </div>
    </div>
  )
}
