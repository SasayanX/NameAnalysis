import { analyzeNameFortune } from "./name-data-simple-fixed"

/**
 * 社名鑑定専用の分析関数
 * 社名を単一の名前として扱い、総格を社名の全画数で計算
 */
export function analyzeCompanyName(companyName: string): any {
  if (!companyName || companyName.trim() === "") {
    return null
  }

  // 社名を姓として扱い、名を空文字にして分析
  const analysisResult = analyzeNameFortune(companyName, "", "male")
  
  // 社名鑑定用に結果を調整
  const companyResult = {
    ...analysisResult,
    // 総格を社名の全画数に調整（天格と同じ）
    totalFormat: analysisResult.tenFormat, // 社名の全画数
    totalScore: analysisResult.tenScore || 50,
    // ビジネスアドバイスを簡潔に
    advice: "ビジネスでの成功を祈願しています。",
    // 会社名用の説明
    explanation: "社名の総格による鑑定結果です。",
    // 会社名の画数
    companyNameCount: analysisResult.tenFormat,
    // 運勢
    fortune: analysisResult.ten?.運勢 || "吉"
  }
  
  return companyResult
}
