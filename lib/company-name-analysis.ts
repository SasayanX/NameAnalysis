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
  
  // 画数に応じたポジティブなビジネスアドバイスを生成
  const generateBusinessAdvice = (strokes: number, fortune: string): string => {
    if (fortune === "大吉") {
      return `【${strokes}画・大吉】✨ 素晴らしい社名です！この社名は天から与えられた強運の証です。事業運、人脈運、財運すべてが最高レベルに恵まれ、必ず大きな成功を手にすることができるでしょう。あなたの努力と才能が、この強運と相まって、業界をリードする企業に成長させてくれます。自信を持って前進してください！ 🌟`
    } else if (fortune === "吉") {
      return `【${strokes}画・吉】💫 とても良い社名です！安定した運勢に支えられ、着実に成功への階段を上ることができるでしょう。あなたの誠実な取り組みと継続的な努力が、必ず実を結びます。この社名の力を信じて、一歩一歩確実に成長していってください。素晴らしい未来が待っています！ 🚀`
    } else if (fortune === "中吉") {
      return `【${strokes}画・中吉】⭐ 良い社名です！バランスの取れた運勢が、あなたの事業を支えてくれます。新しいチャンスや変化を積極的に取り入れながら、着実に成長していくことができるでしょう。この社名と共に、あなたの可能性を最大限に発揮してください。明るい未来が約束されています！ 💎`
    } else if (fortune === "凶") {
      return `【${strokes}画・凶】💪 この社名は、あなたを強く成長させる力を持っています！困難な局面も、あなたの努力と知恵で必ず乗り越えることができます。逆境こそが真の実力を育てる機会です。この社名と共に、困難をチャンスに変えて、より強く、より賢い企業に成長していってください。あなたなら必ず成功できます！ 🌈`
    } else if (fortune === "大凶") {
      return `【${strokes}画・大凶】🌟 この社名は、あなたに特別な使命を与えています！大きな困難を乗り越えることで、他の誰も成し遂げられない偉大な成功を手にすることができるでしょう。この社名は、あなたを真のリーダーに育て上げる力を持っています。困難を恐れず、勇気を持って前進してください。あなたの努力が必ず報われます！ 🎯`
    } else {
      return `【${strokes}画】✨ この社名は、あなたの可能性を無限に広げる力を持っています！バランスの取れた運勢が、あなたの事業を着実に成長させてくれるでしょう。継続的な努力と前向きな姿勢で、必ず素晴らしい成果を手にすることができます。この社名と共に、輝かしい未来を築いていってください！ 🌟`
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
