import Link from "next/link"
import { Mail, Home, Car } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container space-y-6">
        {/* メインフッターコンテンツ */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="flex items-center space-x-1">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">監修:</span>{" "}
                <Link href="/supervisor" className="hover:underline">
                  占い師 金雨輝龍
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <div className="text-sm text-muted-foreground font-semibold">姉妹サイト:</div>
              <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
                <Link
                  href="https://ie-unsei.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-muted-foreground hover:underline"
                >
                  <Home className="h-3 w-3" />
                  <span>住まい運勢診断</span>
                </Link>
                <Link
                  href="https://car-unsei.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-muted-foreground hover:underline"
                >
                  <Car className="h-3 w-3" />
                  <span>愛車運勢診断</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <Link href="/legal" className="text-sm text-muted-foreground hover:underline">
                特定商取引法に基づく表記
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                プライバシーポリシー
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>

        {/* コピーライト（中央揃え・最下部） */}
        <div className="border-t pt-4">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} まいにち姓名判断. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
