"use client"

import React from 'react'
import { StrokeDataExpansionPanel } from '@/components/stroke-data-expansion-panel'

export default function DataExpansionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">画数データ拡充</h1>
          <p className="text-gray-600">
            人名データを自動処理して、不足している漢字の画数データを抽出・追加します。
          </p>
        </div>
        
        <StrokeDataExpansionPanel />
      </div>
    </div>
  )
}
