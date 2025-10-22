"use client"

import { Shield, Lock, CreditCard, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StripeSecurityInfo() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <CardTitle>セキュリティ情報</CardTitle>
        </div>
        <CardDescription>お客様の決済情報は最高レベルのセキュリティで保護されています</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">SSL暗号化通信</h3>
              <p className="text-sm text-muted-foreground">全ての通信は256ビットSSL暗号化により保護されています</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">PCI DSS準拠</h3>
              <p className="text-sm text-muted-foreground">クレジットカード業界の最高セキュリティ基準に準拠</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">カード情報非保存</h3>
              <p className="text-sm text-muted-foreground">当サイトではクレジットカード情報を一切保存いたしません</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">決済処理</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Stripe powered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">世界中の企業に信頼される決済プラットフォーム</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>ご注意：</strong>
            決済処理はStripe社のセキュアなサーバーで行われ、
            当サイトがお客様のカード情報にアクセスすることはありません。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default StripeSecurityInfo
