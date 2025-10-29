/**
 * X（Twitter）自動投稿ボット
 * 毎日7時と19時に人名を収集し、姓名判断を実行してXに投稿
 */

import { analyzeNameFortune } from "./name-data-simple-fixed"
import { getSupabaseClient } from "./supabase-client"
import { useFortuneData } from "@/contexts/fortune-data-context"

// 人名収集先（サンプル - 実際のサイトに合わせて調整）
const NAME_COLLECTION_SOURCES = [
  // ニュースサイトから人名を抽出する例（実装時は適切なAPIまたはスクレイピングを使用）
  "https://api.example.com/names", // 仮のAPIエンドポイント
]

interface CollectedName {
  lastName: string
  firstName: string
  source: string
  collectedAt: Date
}

/**
 * ウェブから人名を収集
 * 実際の実装では、ニュースAPI、Wikipedia、またはその他の人名データソースを使用
 */
export async function collectNamesFromWeb(): Promise<CollectedName[]> {
  const names: CollectedName[] = []
  
  // TODO: 実際の人名収集ロジックを実装
  // 例：
  // - ニュースAPIから著名人の名前を取得
  // - Wikipediaから人名を抽出
  // - 公開されている人名データベースを利用
  
  // サンプルデータ（開発用）
  const sampleNames = [
    { lastName: "山田", firstName: "太郎" },
    { lastName: "佐藤", firstName: "花子" },
    { lastName: "鈴木", firstName: "一郎" },
  ]
  
  for (const name of sampleNames) {
    names.push({
      lastName: name.lastName,
      firstName: name.firstName,
      source: "sample",
      collectedAt: new Date(),
    })
  }
  
  return names
}

/**
 * 姓名判断を実行して結果を返す
 */
export async function analyzeCollectedName(
  lastName: string,
  firstName: string,
  customFortuneData: Record<string, any>,
): Promise<{
  name: string
  result: any
  score: number
  summary: string
}> {
  try {
    const gender = "male" // デフォルトは男性
    const result = analyzeNameFortune(lastName, firstName, gender, customFortuneData)
    
    const score = result.totalScore || 0
    const summary = generateTweetSummary(lastName, firstName, result, score)
    
    return {
      name: `${lastName} ${firstName}`,
      result,
      score,
      summary,
    }
  } catch (error) {
    console.error(`姓名判断エラー: ${lastName} ${firstName}`, error)
    throw error
  }
}

/**
 * ツイート用の要約文を生成
 */
function generateTweetSummary(
  lastName: string,
  firstName: string,
  result: any,
  score: number,
): string {
  const name = `${lastName}${firstName}`
  const rank = getScoreRank(score)
  
  // 各格の運勢を取得
  const categories = result.categories || []
  const tenFortune = categories.find((c: any) => c.name === "天格")?.fortune || "不明"
  const jinFortune = categories.find((c: any) => c.name === "人格")?.fortune || "不明"
  const totalFortune = categories.find((c: any) => c.name === "総格")?.fortune || "不明"
  
  const summary = `🔮【${name}さんの姓名判断】

総合評価: ${score}点（${rank}）
天格: ${tenFortune}
人格: ${jinFortune}
総格: ${totalFortune}

#姓名判断 #名前診断 #運勢`

  return summary
}

/**
 * スコアからランクを判定
 */
function getScoreRank(score: number): string {
  if (score >= 85) return "S"
  if (score >= 75) return "A"
  if (score >= 65) return "B"
  if (score >= 55) return "C"
  if (score >= 45) return "D"
  return "E"
}

/**
 * 収集した人名を保存
 */
export async function saveCollectedNames(names: CollectedName[]): Promise<void> {
  const supabase = getSupabaseClient()
  
  // 人名データをSupabaseに保存
  for (const name of names) {
    await supabase
      .from("collected_names")
      .insert({
        last_name: name.lastName,
        first_name: name.firstName,
        source: name.source,
        collected_at: name.collectedAt.toISOString(),
      })
      .catch((error) => {
        console.error("人名保存エラー:", error)
      })
  }
}

/**
 * 過去に投稿した人名をチェック（重複防止）
 */
export async function hasBeenPosted(
  lastName: string,
  firstName: string,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("twitter_posts")
    .select("id")
    .eq("last_name", lastName)
    .eq("first_name", firstName)
    .limit(1)
  
  if (error) {
    console.error("投稿履歴チェックエラー:", error)
    return false
  }
  
  return (data?.length || 0) > 0
}

/**
 * 投稿履歴を保存
 */
export async function savePostHistory(
  lastName: string,
  firstName: string,
  tweetId: string,
  tweetContent: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  
  await supabase
    .from("twitter_posts")
    .insert({
      last_name: lastName,
      first_name: firstName,
      tweet_id: tweetId,
      tweet_content: tweetContent,
      posted_at: new Date().toISOString(),
    })
    .catch((error) => {
      console.error("投稿履歴保存エラー:", error)
    })
}

