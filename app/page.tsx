import ClientPage from "./ClientPage"
import type { Metadata } from "next"

// トップページ専用のメタデータ
export const metadata: Metadata = {
  title: "まいにちAI姓名判断 - 完全旧字体対応のAI運命鑑定",
  description:
    "【今すぐ無料でAI姓名判断】完全旧字体対応とAI分析で、あなたの運命を詳しく鑑定します。毎日の運勢チェック、深層心理分析、相性診断、改名コンサルまで。次世代の開運アドバイスで、より良い人生を歩みませんか？",
  keywords: ["AI姓名判断", "姓名判断 無料", "運勢 今日", "画数計算", "AI分析", "相性診断", "名前占い", "開運", "運命鑑定"],
  openGraph: {
    title: "まいにちAI姓名判断 - 完全旧字体対応のAI運命鑑定",
    description:
      "【今すぐ無料でAI姓名判断】完全旧字体対応とAI分析で、あなたの運命を詳しく鑑定。毎日の運勢、相性診断、改名コンサルまで対応。",
  },
  twitter: {
    title: "まいにちAI姓名判断 - 完全旧字体対応のAI運命鑑定",
    description:
      "【今すぐ無料でAI姓名判断】完全旧字体対応とAI分析で、あなたの運命を詳しく鑑定。毎日の運勢、相性診断、改名コンサルまで対応。",
  },
}

export default function Home() {
  return <ClientPage />
}