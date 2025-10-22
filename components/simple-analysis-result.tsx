"use client"

import { useFortuneData } from "@/contexts/fortune-data-context"
import { calculateNameStrokes } from "@/lib/name-data-simple"
import { useMemo } from "react"

interface SimpleAnalysisResultProps {
  results: any
  name: string
  gender: string
}

export function SimpleAnalysisResult({ results, name, gender }: SimpleAnalysisResultProps) {
  const { fortuneData } = useFortuneData()

  // メモ化して重複計算を防ぐ
  const analysisData = useMemo(() => {
    console.log("=== SimpleAnalysisResult 計算開始 ===")
    console.log("results:", results)
    console.log("name:", name)

    // 安全性チェック
    if (!results) {
      return { error: "分析結果がありません", totalStrokes: 0 }
    }

    // 総格データを取得（修正版）
    let totalStrokes = 0
    let fortune = "不明"
    let score = 0
    let explanation = ""

    // 1. まず results.totalFormat から直接取得を試す
    if (results.totalFormat && results.totalFormat > 0) {
      totalStrokes = results.totalFormat
      console.log("✅ totalStrokes from results.totalFormat:", totalStrokes)
    }

    // 2. categories配列から確認
    if (totalStrokes === 0 && results.categories && Array.isArray(results.categories)) {
      const totalCategory = results.categories.find((cat: any) => cat.name === "総格")
      if (totalCategory && totalCategory.strokeCount && totalCategory.strokeCount > 0) {
        totalStrokes = totalCategory.strokeCount
        fortune = totalCategory.fortune || "不明"
        score = totalCategory.score || 0
        explanation = totalCategory.explanation || ""
        console.log("✅ totalStrokes from categories:", totalStrokes)
      }
    }

    // 3. results.total から確認
    if (totalStrokes === 0 && results.total) {
      fortune = results.total.運勢 || "不明"
      explanation = results.total.説明 || ""
    }

    // 4. characterDetails から実際の画数を計算（霊数除外）
    if (totalStrokes === 0 && results.characterDetails && Array.isArray(results.characterDetails)) {
      totalStrokes = results.characterDetails
        .filter((detail: any) => !detail.isReisuu) // 霊数を除外
        .reduce((sum: number, detail: any) => sum + (detail.strokes || 0), 0)
      console.log("✅ totalStrokes from characterDetails (excluding reisuu):", totalStrokes)
    }

    // 5. 名前から直接計算（最後の手段）
    if (totalStrokes === 0) {
      try {
        // 姓と名を分離
        const nameParts = name.trim().split(/\s+/)
        if (nameParts.length >= 2) {
          const lastName = nameParts[0]
          const firstName = nameParts.slice(1).join("")
          totalStrokes = calculateNameStrokes(lastName) + calculateNameStrokes(firstName)
          console.log("✅ totalStrokes calculated from name parts:", lastName, firstName, "=", totalStrokes)
        } else {
          // 全体を一つの名前として計算
          totalStrokes = calculateNameStrokes(name.replace(/\s+/g, ""))
          console.log("✅ totalStrokes calculated from full name:", totalStrokes)
        }
      } catch (error) {
        console.error("Error calculating strokes:", error)
        totalStrokes = 0
      }
    }

    console.log("Final totalStrokes:", totalStrokes)

    // データベースから運勢情報を取得
    if (totalStrokes > 0 && (fortune === "不明" || score === 0)) {
      const fortuneKey = totalStrokes.toString()
      const dbFortune = fortuneData[fortuneKey]

      console.log("Looking up fortune for key:", fortuneKey)
      console.log("Found dbFortune:", dbFortune)

      if (dbFortune) {
        fortune = dbFortune.運勢 || "不明"
        explanation = dbFortune.説明 || ""
        score = calculateScoreFromFortune(fortune)
        console.log("✅ Fortune from database:", fortune, score)
      } else {
        // データベースにない場合のフォールバック
        const fallbackFortune = getFortuneByStrokes(totalStrokes)
        fortune = fallbackFortune.fortune
        score = fallbackFortune.score
        explanation = fallbackFortune.explanation
        console.log("✅ Fortune from fallback:", fortune, score)
      }
    }

    return {
      totalStrokes,
      fortune,
      score,
      explanation,
      error: null,
    }
  }, [results, name, fortuneData]) // 依存関係を明確に指定

  // バッジカラーを取得する関数
  const getBadgeColor = (fortuneType: string): string => {
    switch (fortuneType) {
      case "大吉":
        return "bg-red-500 text-white"
      case "中吉":
        return "bg-pink-400 text-white"
      case "吉":
        return "bg-pink-200 text-gray-800"
      case "凶":
        return "bg-white text-gray-800 border border-gray-300"
      case "中凶":
        return "bg-gray-200 text-gray-800"
      case "大凶":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  // 適度な詳しさのアドバイスを生成する関数
  const generateSimpleAdvice = (fortuneType: string) => {
    switch (fortuneType) {
      case "大吉":
        return "非常に良い運勢です。持ち前の才能を活かし、積極的に行動することで大きな成功を収めることができるでしょう。リーダーシップを発揮し、大きな目標に向かって挑戦することをお勧めします。この幸運を周囲の人々と分かち合う心を持つことで、さらなる発展が期待できます。"
      case "吉":
        return "良好な運勢を示しています。努力を継続することで着実に成果を上げることができます。周囲との協調性を活かし、チームワークを重視することが成功の鍵となります。専門性を高めることで、その分野でのエキスパートを目指すことができるでしょう。"
      case "中吉":
        return "バランスの取れた運勢です。安定した歩みを続けることで、確実に目標に近づくことができるでしょう。現状を維持しながら少しずつ改善を図り、多方面に興味を持つことが成長につながります。急激な変化よりも、着実な成長を心がけることが大切です。"
      case "凶":
        return "注意が必要な数字です。困難に直面することもありますが、諦めずに努力を続けることで運勢を好転させることができます。困難を成長の機会として前向きに捉え、周囲のサポートを積極的に求めることが重要です。小さな目標から着実に達成し、自信を積み重ねていきましょう。"
      case "中凶":
        return "慎重な行動が求められる時期です。計画性を持って行動し、リスクを避けながら着実に歩みを進めることが大切です。周囲の信頼できる人からのアドバイスを参考にし、無理をせず自分のペースで進んでください。"
      case "大凶":
        return "慎重な行動が求められる数字です。計画性を持って行動し、周囲のサポートを得ることで困難を乗り越えることができるでしょう。冷静さを保ち、信頼できる人からのアドバイスを素直に受け入れることが大切です。この困難な時期は必ず過ぎ去ることを信じて、希望を失わないでください。"
      default:
        return "継続的な努力と前向きな姿勢を保つことが重要です。バランスの取れた生活を心がけ、周囲との調和を大切にしながら、自分なりのペースで成長していくことができるでしょう。"
    }
  }

  // エラーの場合
  if (analysisData.error) {
    return (
      <div className="bg-white p-6">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">計算エラー</h2>
          <p>{analysisData.error}</p>
          <p className="text-sm mt-2">デバッグ情報: {JSON.stringify({ results: !!results, name })}</p>
        </div>
      </div>
    )
  }

  // 総格が0の場合のエラー表示
  if (analysisData.totalStrokes === 0) {
    return (
      <div className="bg-white p-6">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">計算エラー</h2>
          <p>総格の計算ができませんでした。名前を確認してください。</p>
          <p className="text-sm mt-2">デバッグ情報: {JSON.stringify({ results: !!results, name })}</p>
        </div>
      </div>
    )
  }

  const simpleAdvice = generateSimpleAdvice(analysisData.fortune)
  const genderText = gender === "male" ? "男性" : gender === "female" ? "女性" : ""

  return (
    <div className="bg-white">
      {/* ヘッダー部分 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">「{name}」さんのかんたん鑑定結果</h1>
        <h2 className="text-lg text-gray-600 mb-2">「{name}」の画数占い結果</h2>
        <p className="text-sm text-gray-500">
          かんたん鑑定（総格のみ）{genderText && ` - ${genderText}`} -
          当姓名判断は、全て旧字体での鑑定となっております。
        </p>
      </div>

      {/* メイン結果表示エリア */}
      <div className="mb-8">
        {/* 総格数字と吉凶バッジ - 薄いグレー背景 */}
        <div className="bg-gray-100 p-6 rounded-lg text-center mb-4">
          <div className="text-4xl font-bold text-gray-900 mb-3">{analysisData.totalStrokes}</div>
          <span
            className={`inline-block px-3 py-1 text-lg font-bold rounded-full ${getBadgeColor(analysisData.fortune)}`}
          >
            {analysisData.fortune}
          </span>
        </div>

        {/* スコア表示部分 */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-medium text-gray-900">運勢スコア</span>
            <span className="text-base font-medium text-gray-900">{analysisData.score}点</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-black rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analysisData.score, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 総格の意味セクション */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">総格の意味</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {analysisData.explanation ||
            "「総格」は、姓名全体の画数を表し、その人の人生全体の運勢や性格の基調を示します。人生における総合的な運気や、晩年期の運勢に大きく影響するとされています。"}
        </p>

        {/* ヘアライン */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 基本的なアドバイス */}
        <h4 className="text-base font-bold text-gray-900 mb-3">アドバイス</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{simpleAdvice}</p>
      </div>
    </div>
  )
}

// calculateScoreFromFortune関数のスコアを変更
function calculateScoreFromFortune(fortune: string): number {
  switch (fortune) {
    case "大吉":
      return 100
    case "中吉":
      return 80
    case "吉":
      return 60
    case "凶":
      return 40
    case "中凶":
      return 20
    case "大凶":
      return 0
    default:
      return 50
  }
}

// getFortuneByStrokes関数内のスコアも変更
function getFortuneByStrokes(strokes: number) {
  const fortuneMap: { [key: number]: { fortune: string; score: number; explanation: string } } = {
    1: { fortune: "大吉", score: 100, explanation: "「首領、円満、財徳」男女共に実業や学問に優れ、大吉数です。" },
    2: {
      fortune: "中凶",
      score: 20,
      explanation: "「分離、不安定、破滅」協調性はあるものの、優柔不断で意志薄弱な面があります。",
    },
    3: {
      fortune: "大吉",
      score: 100,
      explanation: "「才能、行動力、希望」明るく社交的で、人を惹きつける魅力があります。",
    },
    4: {
      fortune: "中凶",
      score: 20,
      explanation: "「破滅、病弱、短命」真面目で努力家ですが、不運に見舞われやすい画数です。",
    },
    5: { fortune: "大吉", score: 100, explanation: "「福徳、調和、順調」バランス感覚に優れ、調和を重んじる性格です。" },
    6: { fortune: "大吉", score: 100, explanation: "「安泰、円満、名誉」責任感が強く、面倒見が良い性格です。" },
    7: {
      fortune: "中吉",
      score: 80,
      explanation: "「独立、意志、進取」独立心が強く、自分の道を切り開く力があります。",
    },
    8: { fortune: "中吉", score: 80, explanation: "「勤勉、努力、発達」意志が強く、困難に立ち向かう勇気があります。" },
    9: {
      fortune: "中凶",
      score: 20,
      explanation: "「薄幸、消極、孤独」頭脳明晰ですが、完璧主義すぎる傾向があります。",
    },
    10: { fortune: "中凶", score: 20, explanation: "「空虚、破滅、病弱」波乱万丈な人生を送りがちです。" },
  }

  const baseNumber = strokes % 10 === 0 ? 10 : strokes % 10
  return fortuneMap[baseNumber] || { fortune: "吉", score: 60, explanation: "バランスの取れた運勢です。" }
}
