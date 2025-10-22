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
  
  // 社名鑑定用に結果を調整
  const companyResult = {
    ...analysisResult,
    // 総格を社名の全画数に調整（天格と同じ）
    totalFormat: totalStrokes, // 社名の全画数
    totalScore: analysisResult.tenScore || 50,
    // ビジネスアドバイスを簡潔に
    advice: "ビジネスでの成功を祈願しています。",
    // 会社名用の説明
    explanation: fortuneData.説明 || "社名の総格による鑑定結果です。",
    // 会社名の画数
    companyNameCount: totalStrokes,
    // 運勢（カスタムデータから直接取得）
    fortune: fortuneData.運勢 || "吉"
  }
  
  return companyResult
}
