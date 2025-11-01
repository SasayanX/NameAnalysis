"use client"

import Link from "next/link"
import Image from "next/image"
import { BookOpen, CreditCard, Gift, ShoppingBag } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            {/* モバイル時はサイトアイコンのみ */}
            <Image src="/images/mainichi.png" alt="まいにち姓名判断" width={48} height={48} className="sm:hidden" />
            {/* デスクトップ時はフルタイトル */}
            <span className="hidden sm:inline-block font-bold text-lg">まいにちの運勢もわかる姓名判断アプリ</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/articles"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">コラム</span>
              <span className="sm:hidden">記事</span>
            </Link>
            <Link
              href="/amulets-exchange"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">お守り交換所</span>
              <span className="sm:hidden">お守り</span>
            </Link>
            <Link
              href="/point-shop"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">ポイントショップ</span>
              <span className="sm:hidden">ショップ</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">料金プラン</span>
              <span className="sm:hidden">料金</span>
            </Link>
          </nav>
        </div>
        <div />
      </div>
    </header>
  )
}
