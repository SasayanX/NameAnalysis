import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-lg text-muted-foreground">
            ページが見つかりませんでした
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
            >
              ホームに戻る
            </Link>
            <Link
              href="/name-analyzer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              姓名判断を始める
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

