import { analyzeNameFortune } from "./name-data-simple-fixed"
import { customFortuneData } from "./fortune-data-custom"

/**
 * 社名鑑定専用の分析関数
 * 社名を単一の名前として扱い、総格を社名の全画数で計算
 */
export function analyzeCompanyName(companyName: string): any {
  if (!companyName || companyName.trim() === "") {
    return null
  }

  // 社名を姓として扱い、名を空文字にして分析（カスタムデータを使用）
  const analysisResult = analyzeNameFortune(companyName, "", "male", customFortuneData)
  
  // 社名の総画数を計算（カスタムデータから直接取得）
  const totalStrokes = analysisResult.tenFormat
  const fortuneData = customFortuneData[totalStrokes?.toString()] || { 運勢: "吉", 説明: "良好な運勢です。" }
  
  console.log("社名鑑定デバッグ:", {
    companyName,
    totalStrokes,
    fortuneData,
    customFortuneData32: customFortuneData["32"]
  })
  
  // 画数に応じたビジネスアドバイスを生成
  const generateBusinessAdvice = (strokes: number, fortune: string): string => {
    if (fortune === "大吉") {
      return `【${strokes}画・大吉】この社名は非常に強運を持っています。事業運、人脈運、財運すべてに恵まれ、大きな成功を収める可能性が高いです。ただし、運の強さに頼りすぎず、謙虚な姿勢を保つことが重要です。周囲への感謝を忘れず、チームワークを大切にすることで、さらなる発展が期待できます。`
    } else if (fortune === "吉") {
      return `【${strokes}画・吉】この社名は安定した運勢を持っています。着実な成長と継続的な成功が期待できます。急激な変化よりも、堅実な経営と地道な努力を重ねることで、長期的な繁栄を築くことができるでしょう。`
    } else if (fortune === "中吉") {
      return `【${strokes}画・中吉】この社名はバランスの取れた運勢です。適度な成功と安定が期待できます。新しい挑戦や変化を取り入れながら、リスクを適切に管理することで、着実な成長を遂げることができるでしょう。`
    } else if (fortune === "凶") {
      return `【${strokes}画・凶】この社名は注意深い経営が必要です。困難な局面に直面することもありますが、逆境を乗り越えることで強い企業に成長できます。慎重な判断と継続的な努力により、成功への道筋を見つけることができるでしょう。`
    } else if (fortune === "大凶") {
      return `【${strokes}画・大凶】この社名は特に慎重な経営が求められます。大きなリスクを避け、堅実な経営方針を貫くことが重要です。小さな成功を積み重ね、信頼関係を築くことで、困難を乗り越えることができるでしょう。`
    } else {
      return `【${strokes}画】この社名の運勢は中庸です。バランスの取れた経営と継続的な努力により、着実な成長を期待できます。`
    }
  }

  // 社名鑑定用に結果を調整
  const companyResult = {
    ...analysisResult,
    // 総格を社名の全画数に調整（天格と同じ）
    totalFormat: totalStrokes, // 社名の全画数
    totalScore: analysisResult.tenScore || 50,
    // 画数に応じた詳細なビジネスアドバイス
    advice: generateBusinessAdvice(totalStrokes, fortuneData.運勢 || "吉"),
    // 会社名用の説明
    explanation: fortuneData.説明 || "社名の総格による鑑定結果です。",
    // 会社名の画数
    companyNameCount: totalStrokes,
    // 運勢（カスタムデータから直接取得）
    fortune: fortuneData.運勢 || "吉"
  }
  
  return companyResult
}
