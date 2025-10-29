/**
 * 自動ツイートAPIエンドポイント
 * Vercel Cron Jobsから呼び出される
 */

import { NextRequest, NextResponse } from "next/server"
import {
  collectNamesFromWeb,
  analyzeCollectedName,
  saveCollectedNames,
  hasBeenPosted,
  savePostHistory,
} from "@/lib/automated-twitter-bot"
import { postToTwitter } from "@/lib/twitter-api"

// 運勢データを取得（簡易版 - 実際は適切な方法で取得）
function getFortuneData() {
  // TODO: 実際の運勢データを取得
  // これは通常、contextやデータベースから取得
  return {}
}

/**
 * POST /api/automated-tweet
 * スケジューラーから呼び出される
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック（Cron Secretを使用）
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. 人名を収集
    console.log("人名収集を開始...")
    const collectedNames = await collectNamesFromWeb()
    console.log(`${collectedNames.length}件の人名を収集しました`)

    // 2. 収集した人名を保存
    await saveCollectedNames(collectedNames)

    // 3. 各人名で姓名判断を実行
    const fortuneData = getFortuneData()
    const analysisResults = []

    for (const nameData of collectedNames) {
      // 重複チェック
      const alreadyPosted = await hasBeenPosted(nameData.lastName, nameData.firstName)
      if (alreadyPosted) {
        console.log(`既に投稿済み: ${nameData.lastName} ${nameData.firstName}`)
        continue
      }

      try {
        const result = await analyzeCollectedName(
          nameData.lastName,
          nameData.firstName,
          fortuneData,
        )
        analysisResults.push({
          nameData,
          result,
        })
      } catch (error) {
        console.error(`分析エラー: ${nameData.lastName} ${nameData.firstName}`, error)
      }
    }

    // 4. 分析結果から1つをランダムに選択
    if (analysisResults.length === 0) {
      return NextResponse.json({
        success: false,
        message: "投稿可能な分析結果がありません",
      })
    }

    const selected = analysisResults[Math.floor(Math.random() * analysisResults.length)]
    const tweetContent = selected.result.summary

    // 5. Xに投稿
    console.log("Xに投稿中...")
    const tweetId = await postToTwitter(tweetContent)

    // 6. 投稿履歴を保存
    await savePostHistory(
      selected.nameData.lastName,
      selected.nameData.firstName,
      tweetId,
      tweetContent,
    )

    return NextResponse.json({
      success: true,
      name: selected.result.name,
      score: selected.result.score,
      tweetId,
      message: "ツイートが成功しました",
    })
  } catch (error: any) {
    console.error("自動ツイートエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "自動ツイート処理中にエラーが発生しました",
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/automated-tweet（テスト用）
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "自動ツイートAPIエンドポイント",
    usage: "POSTリクエストで実行",
  })
}

