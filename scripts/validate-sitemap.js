// サイトマップの検証スクリプト
const siteUrl = "https://nameanalysis216.vercel.app"

const urlsToCheck = [
  "/",
  "/name-analyzer",
  "/articles",
  "/articles/kyujitai-seimeihandan",
  "/articles/gogyo-five-elements",
  "/articles/rokuseisensei-fortune",
  "/fortune-flow",
  "/fortune-comprehensive",
  "/stroke-fortune-list",
  "/roadmap",
  "/privacy",
  "/legal",
  "/security",
  "/data-policy",
]

async function validateUrls() {
  console.log("🔍 サイトマップURLの検証を開始...")

  for (const path of urlsToCheck) {
    const url = `${siteUrl}${path}`
    try {
      const response = await fetch(url)
      const status = response.status

      if (status === 200) {
        console.log(`✅ ${url} - OK (${status})`)
      } else if (status === 404) {
        console.log(`❌ ${url} - Not Found (${status})`)
      } else {
        console.log(`⚠️  ${url} - ${status}`)
      }
    } catch (error) {
      console.log(`💥 ${url} - Error: ${error.message}`)
    }
  }

  console.log("\n📋 検証完了！")
  console.log("❌ マークのURLはサイトマップから除外してください。")
}

validateUrls()
