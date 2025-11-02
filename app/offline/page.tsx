import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
            <CardTitle>オフラインです</CardTitle>
          </div>
          <CardDescription>
            インターネット接続を確認してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            現在、インターネットに接続されていません。
            接続を復旧すると、通常どおりアプリをご利用いただけます。
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              再読み込み
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">ホームへ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
