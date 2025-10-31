// サイトマップの状態を確認するスクリプト
console.log("=== サイトマップ状態確認 ===")

const siteUrl = "https://seimei.kanau-kiryu.com" // 実際のドメインに修正

async function checkSitemapStatus() {
  try {
    console.log("1. サイトマップXMLの確認...")
    const sitemapUrl = `${siteUrl}/sitemap.xml`

    const response = await fetch(sitemapUrl)
    if (response.ok) {
      const sitemapXML = await response.text()

      // URLの数をカウント
      const urlMatches = sitemapXML.match(/<url>/g)
      const urlCount = urlMatches ? urlMatches.length : 0

      console.log(`✅ サイトマップアクセス成功`)
      console.log(`📊 含まれるURL数: ${urlCount}`)

      // 特定のページが含まれているかチェック
      const checkPages = [
        "/articles/tengaku-kyousuu-myouji",
        "/articles/2025-baby-names-ranking",
        "/",
        "/pricing",
      ]

      console.log("\n2. 重要ページの確認:")
      checkPages.forEach((page) => {
        const included = sitemapXML.includes(`${siteUrl}${page}`)
        console.log(`${included ? "✅" : "❌"} ${page}`)
      })

      // 最終更新日の確認
      const lastModMatches = sitemapXML.match(/<lastmod>([^<]+)<\/lastmod>/g)
      if (lastModMatches && lastModMatches.length > 0) {
        const latestDate = lastModMatches[0].replace(/<\/?lastmod>/g, "")
        console.log(`\n📅 最新更新日: ${latestDate}`)
      }
    } else {
      console.log(`❌ サイトマップアクセス失敗: ${response.status}`)
    }
  } catch (error) {
    console.error("❌ エラー:", error.message)
  }
}

// Google Search Console用の確認項目
console.log("\n=== Google Search Console確認項目 ===")
console.log("1. サイトマップURL:", `${siteUrl}/sitemap.xml`)
console.log("2. 送信方法: Search Console > サイトマップ > 新しいサイトマップの追加")
console.log("3. 確認事項:")
console.log("   - サイトマップが「成功」ステータスか")
console.log("   - 検出されたURLの数が正しいか")
console.log("   - エラーがないか")

console.log("\n=== 対処法 ===")
console.log("1. 既存サイトマップを削除して再送信")
console.log("2. 個別URLをURL検査ツールでテスト")
console.log("3. robots.txtでサイトマップが正しく指定されているか確認")
console.log("4. 24-48時間待ってから再確認")

// 実際にチェックを実行
checkSitemapStatus()
