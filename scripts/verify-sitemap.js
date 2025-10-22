// サイトマップの内容を確認するスクリプト
console.log("=== サイトマップ検証スクリプト ===")

// 1. サイトマップファイルの存在確認
import fs from "fs"
import path from "path"

const sitemapPath = path.join(process.cwd(), "app", "sitemap.ts")
console.log("sitemap.tsファイル存在:", fs.existsSync(sitemapPath))

// 2. 新しい記事ページの存在確認
const articlePath = path.join(process.cwd(), "app", "articles", "tengaku-kyousuu-myouji", "page.tsx")
console.log("新記事ページ存在:", fs.existsSync(articlePath))

// 3. サイトマップの内容を読み込み
try {
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8")
  const tengakuIncluded = sitemapContent.includes("tengaku-kyousuu-myouji")
  console.log("サイトマップに新記事含まれている:", tengakuIncluded)

  // URLの数をカウント
  const urlMatches = sitemapContent.match(/url: `?\${?baseUrl}?`?/g)
  console.log("サイトマップ内のURL数:", urlMatches ? urlMatches.length : 0)
} catch (error) {
  console.error("サイトマップ読み込みエラー:", error)
}

// 4. 実際のサイトマップXMLを確認（本番環境の場合）
console.log("\n=== 確認すべき項目 ===")
console.log("1. https://your-domain.com/sitemap.xml に直接アクセス")
console.log("2. 新記事URL: /articles/tengaku-kyousuu-myouji が含まれているか")
console.log("3. 総URL数が正しいか")
console.log("4. デプロイが完了しているか")
