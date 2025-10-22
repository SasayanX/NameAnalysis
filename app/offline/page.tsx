"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <WifiOff className="h-16 w-16 text-gray-400" />
            </div>
            <CardTitle className="text-xl">オフラインです</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              インターネット接続を確認してください。 一部の機能はオフラインでもご利用いただけます。
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
