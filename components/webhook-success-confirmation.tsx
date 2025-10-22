"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WebhookSuccessConfirmation() {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Square Webhook 作成完了
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Webhook名:</strong> Production Payment Notifications
          </div>
          <div>
            <strong>ステータス:</strong> <Badge className="bg-green-600">Enabled</Badge>
          </div>
          <div>
            <strong>Webhook ID:</strong> tzm7WoeGAYKPOe54Axoabg
          </div>
          <div>
            <strong>API Version:</strong> 2025-06-18
          </div>
        </div>

        <div className="space-y-2">
          <strong>URL:</strong>
          <div className="bg-white p-2 rounded border font-mono text-xs">
            https://nameanalysis216.vercel.app/api/square-webhook
          </div>
        </div>

        <div className="space-y-2">
          <strong>設定済みイベント (4個):</strong>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">payment.updated</Badge>
            <Badge variant="outline">subscription.created</Badge>
            <Badge variant="outline">subscription.updated</Badge>
            <Badge variant="outline">invoice.payment_made</Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button asChild className="w-full">
            <a href="https://developer.squareup.com/console/en/apps" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Square Developer Console で確認
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
