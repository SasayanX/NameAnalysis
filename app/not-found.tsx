import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-4">404</CardTitle>
          <CardDescription className="text-lg">
            ページが見つかりませんでした
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/name-analyzer">
                <Search className="h-4 w-4 mr-2" />
                姓名判断を始める
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

