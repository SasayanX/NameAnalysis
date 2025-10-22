// サイトマップを強制的に再生成するスクリプト
console.log("=== サイトマップ強制更新 ===")

// Next.jsのサイトマップは通常自動更新されますが、
// 問題がある場合の対処法を提供

console.log("対処法:")
console.log("1. デプロイの確認")
console.log("   - Vercelダッシュボードで最新デプロイが成功しているか確認")
console.log("   - ビルドログにエラーがないか確認")

console.log("2. キャッシュクリア")
console.log("   - ブラウザのキャッシュをクリア")
console.log("   - CDNキャッシュをクリア（Vercelの場合は自動）")

console.log("3. 手動確認")
console.log("   - https://your-domain.com/sitemap.xml に直接アクセス")
console.log("   - https://your-domain.com/articles/tengaku-kyousuu-myouji にアクセス")

console.log("4. Google Search Console")
console.log("   - サイトマップを削除して再送信")
console.log("   - URL検査ツールで個別ページをテスト")

// 現在のサイトマップ設定を出力
import { seoConfig } from "../lib/seo-config.js"
console.log("\n現在の設定:")
console.log("サイトURL:", seoConfig.siteUrl)
console.log("期待されるサイトマップURL:", `${seoConfig.siteUrl}/sitemap.xml`)
