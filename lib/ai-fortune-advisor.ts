// AI化された開運アドバイス生成システム
// 無料で利用可能なAI機能として実装

export interface AIFortuneAdvice {
  personalizedAdvice: string
  luckyElements: string[]
  luckyColors: string[]
  luckyNumbers: number[]
  careerGuidance: string
  relationshipAdvice: string
  healthTips: string
  dailyActions: string[]
  monthlyFocus: string
  yearlyOutlook: string
}

export interface NameAnalysisData {
  name: string
  gender: "male" | "female"
  categories: Array<{
    name: string
    fortune: string
    explanation: string
    strokeCount: number
    score: number
  }>
  totalScore: number
  elements?: {
    woodCount: number
    fireCount: number
    earthCount: number
    metalCount: number
    waterCount: number
  }
}

// AI開運アドバイス生成関数
export function generateAIFortuneAdvice(analysisData: NameAnalysisData): AIFortuneAdvice {
  const { name, gender, categories, totalScore, elements } = analysisData
  
  // 各格の運勢を取得
  const tenFortune = categories.find(c => c.name === "天格")?.fortune || "普通"
  const jinFortune = categories.find(c => c.name === "人格")?.fortune || "普通"
  const chiFortune = categories.find(c => c.name === "地格")?.fortune || "普通"
  const gaiFortune = categories.find(c => c.name === "外格")?.fortune || "普通"
  const souFortune = categories.find(c => c.name === "総格")?.fortune || "普通"

  // 運勢レベルを数値化
  const getFortuneLevel = (fortune: string): number => {
    switch (fortune) {
      case "大吉": return 5
      case "吉": return 4
      case "中吉": return 3
      case "普通": return 2
      case "凶": return 1
      case "大凶": return 0
      default: return 2
    }
  }

  const fortuneLevels = {
    ten: getFortuneLevel(tenFortune),
    jin: getFortuneLevel(jinFortune),
    chi: getFortuneLevel(chiFortune),
    gai: getFortuneLevel(gaiFortune),
    sou: getFortuneLevel(souFortune)
  }

  // 総合運勢レベル
  const overallFortuneLevel = Math.round(
    (fortuneLevels.ten + fortuneLevels.jin * 2 + fortuneLevels.chi + 
     fortuneLevels.gai + fortuneLevels.sou * 2) / 7
  )

  // 五行要素の分析（名前の画数から動的に生成）
  const dynamicElements = generateElementsFromName(name, categories)
  const dominantElement = elements ? getDominantElement(elements) : getDominantElement(dynamicElements)
  const weakElement = elements ? getWeakElement(elements) : getWeakElement(dynamicElements)

  // AI生成されたパーソナライズアドバイス
  const personalizedAdvice = generatePersonalizedAdvice(
    name, gender, overallFortuneLevel, dominantElement, weakElement, fortuneLevels, categories
  )

  // ラッキー要素の生成
  const luckyElements = generateLuckyElements(dominantElement, weakElement, overallFortuneLevel)
  const luckyColors = generateLuckyColors(dominantElement, overallFortuneLevel)
  const luckyNumbers = generateLuckyNumbers(totalScore, fortuneLevels)

  // 各分野のアドバイス
  const careerGuidance = generateCareerGuidance(jinFortune, souFortune, dominantElement, gender)
  const relationshipAdvice = generateRelationshipAdvice(gaiFortune, chiFortune, gender)
  const healthTips = generateHealthTips(dominantElement, weakElement, overallFortuneLevel)
  const dailyActions = generateDailyActions(luckyElements, luckyColors, overallFortuneLevel)
  const monthlyFocus = generateMonthlyFocus(dominantElement, overallFortuneLevel)
  const yearlyOutlook = generateYearlyOutlook(souFortune, overallFortuneLevel)

  return {
    personalizedAdvice,
    luckyElements,
    luckyColors,
    luckyNumbers,
    careerGuidance,
    relationshipAdvice,
    healthTips,
    dailyActions,
    monthlyFocus,
    yearlyOutlook
  }
}

// パーソナライズアドバイス生成
function generatePersonalizedAdvice(
  name: string, 
  gender: "male" | "female", 
  fortuneLevel: number, 
  dominantElement: string, 
  weakElement: string,
  fortuneLevels: any,
  categories: any[]
): string {
  const genderText = gender === "male" ? "男性" : "女性"
  const fortuneText = getFortuneText(fortuneLevel)
  
  let advice = `${name}さん（${genderText}）の姓名判断結果から、${fortuneText}の運勢をお持ちです。\n\n`
  
  // 最も優れた格と最も注意が必要な格を特定
  const bestFormat = getBestFormat(fortuneLevels, categories)
  const worstFormat = getWorstFormat(fortuneLevels, categories)
  
  // 最良の格について
  if (bestFormat.level >= 4) {
    advice += `${bestFormat.name}（${bestFormat.strokes}画・${bestFormat.fortune}）の運勢が特に良好で、${getFormatAdvice(bestFormat.name, bestFormat.strokes, bestFormat.fortune, gender)}`
  }
  
  // 注意が必要な格について
  if (worstFormat.level <= 2 && worstFormat.name !== bestFormat.name) {
    advice += `一方、${worstFormat.name}（${worstFormat.strokes}画・${worstFormat.fortune}）には注意が必要で、${getFormatImprovementAdvice(worstFormat.name, worstFormat.strokes, worstFormat.fortune, gender)}`
  }
  
  // 総合的なバランス
  if (bestFormat.level >= 4 && worstFormat.level <= 2) {
    advice += `全体的には${bestFormat.name}の強みを活かしながら、${worstFormat.name}の改善に取り組むことで、バランスの取れた運勢になります。`
  } else if (bestFormat.level >= 4) {
    advice += `全体的に良好な運勢で、特に${bestFormat.name}の才能を活かして、さらなる成長を目指しましょう。`
  } else if (worstFormat.level <= 2) {
    advice += `全体的に慎重な行動が求められますが、着実な努力で運勢の改善が期待できます。`
  } else {
    advice += `全体的に安定した運勢で、バランスの取れた成長が期待できます。`
  }

  // 五行要素のアドバイス
  advice += `\n${dominantElement}の要素が強いため、${getElementAdvice(dominantElement)}`
  
  if (weakElement !== dominantElement) {
    advice += `一方、${weakElement}の要素を補うことで、よりバランスの取れた運勢になります。`
  }

  return advice
}

// ラッキー要素生成
function generateLuckyElements(dominantElement: string, weakElement: string, fortuneLevel: number): string[] {
  const elements = []
  
  // 支配要素
  elements.push(getElementName(dominantElement))
  
  // 補完要素
  if (weakElement !== dominantElement) {
    elements.push(getElementName(weakElement))
  }
  
  // 運勢レベルに応じた追加要素
  if (fortuneLevel >= 4) {
    elements.push("水晶", "パワーストーン")
  }
  
  return [...new Set(elements)] // 重複除去
}

// ラッキーカラー生成
function generateLuckyColors(dominantElement: string, fortuneLevel: number): string[] {
  const colorMap: Record<string, string[]> = {
    木: ["緑", "青緑", "エメラルドグリーン"],
    火: ["赤", "オレンジ", "ピンク"],
    土: ["黄", "ベージュ", "ブラウン"],
    金: ["白", "シルバー", "ゴールド"],
    水: ["青", "ネイビー", "ターコイズ"]
  }
  
  const baseColors = colorMap[dominantElement] || ["白", "黒"]
  
  // 運勢レベルに応じた追加カラー
  if (fortuneLevel >= 4) {
    baseColors.push("ゴールド", "プラチナ")
  }
  
  return baseColors
}

// ラッキーナンバー生成
function generateLuckyNumbers(totalScore: number, fortuneLevels: any): number[] {
  const numbers = []
  
  // 総格の画数
  numbers.push(totalScore % 10 || 1)
  
  // 各格の画数から
  Object.values(fortuneLevels).forEach((level: any) => {
    if (level > 0) {
      numbers.push(level)
    }
  })
  
  // 運勢レベルに応じた追加
  if (fortuneLevels.jin >= 4) {
    numbers.push(8, 9) // 成功を表す数字
  }
  
  return [...new Set(numbers)].slice(0, 5) // 最大5個
}

// キャリアガイダンス生成
function generateCareerGuidance(jinFortune: string, souFortune: string, dominantElement: string, gender: string): string {
  let guidance = ""
  
  // 人格の運勢に基づく
  if (jinFortune === "大吉" || jinFortune === "吉") {
    guidance += "リーダーシップを発揮できる職業が向いています。"
  } else if (jinFortune === "凶" || jinFortune === "大凶") {
    guidance += "協調性を重視する職場環境が適しています。"
  }
  
  // 五行要素に基づく職業アドバイス
  guidance += getCareerAdviceByElement(dominantElement)
  
  return guidance
}

// 人間関係アドバイス生成
function generateRelationshipAdvice(gaiFortune: string, chiFortune: string, gender: string): string {
  let advice = ""
  
  if (gaiFortune === "大吉" || gaiFortune === "吉") {
    advice += "社交性に優れ、多くの人との良好な関係を築けます。"
  } else {
    advice += "少数の深い関係を大切にすることで、幸せな人間関係を築けます。"
  }
  
  if (chiFortune === "大吉" || chiFortune === "吉") {
    advice += "家庭運も良好で、家族との絆が深まります。"
  }
  
  return advice
}

// 健康アドバイス生成
function generateHealthTips(dominantElement: string, weakElement: string, fortuneLevel: number): string {
  let tips = ""
  
  // 支配要素に基づく健康アドバイス
  tips += getHealthAdviceByElement(dominantElement)
  
  // 弱い要素の補完
  if (weakElement !== dominantElement) {
    tips += getHealthAdviceByElement(weakElement)
  }
  
  return tips
}

// 日々のアクション生成
function generateDailyActions(luckyElements: string[], luckyColors: string[], fortuneLevel: number): string[] {
  const actions = []
  
  // ラッキー要素を活用
  if (luckyElements.includes("木")) {
    actions.push("植物を育てる", "自然の中で過ごす")
  }
  if (luckyElements.includes("火")) {
    actions.push("太陽の光を浴びる", "温かい飲み物を飲む")
  }
  if (luckyElements.includes("土")) {
    actions.push("土に触れる", "料理をする")
  }
  if (luckyElements.includes("金")) {
    actions.push("整理整頓する", "金属製品に触れる")
  }
  if (luckyElements.includes("水")) {
    actions.push("水の音を聞く", "入浴を楽しむ")
  }
  
  // ラッキーカラーを活用
  if (luckyColors.length > 0) {
    actions.push(`${luckyColors[0]}色のアイテムを身につける`)
  }
  
  return actions.slice(0, 5) // 最大5個
}

// 月間フォーカス生成
function generateMonthlyFocus(dominantElement: string, fortuneLevel: number): string {
  const focusMap: Record<string, string> = {
    木: "成長と発展の月",
    火: "情熱と行動の月", 
    土: "安定と基盤づくりの月",
    金: "整理と完成の月",
    水: "流れと変化の月"
  }
  
  return focusMap[dominantElement] || "バランスと調和の月"
}

// 年間展望生成
function generateYearlyOutlook(souFortune: string, fortuneLevel: number): string {
  if (souFortune === "大吉" || souFortune === "吉") {
    return "今年は大きな飛躍の年となるでしょう。新しい挑戦に積極的に取り組んでください。"
  } else if (souFortune === "凶" || souFortune === "大凶") {
    return "今年は慎重に行動し、基盤を固める年にしましょう。焦らず着実に進歩を重ねてください。"
  } else {
    return "今年は安定した成長の年です。バランスを保ちながら着実に目標に向かって進んでください。"
  }
}

// 名前から五行要素を動的に生成
function generateElementsFromName(name: string, categories: any[]): any {
  // 各格の画数から五行要素を計算
  const tenStrokes = categories.find(c => c.name === "天格")?.strokeCount || 0
  const jinStrokes = categories.find(c => c.name === "人格")?.strokeCount || 0
  const chiStrokes = categories.find(c => c.name === "地格")?.strokeCount || 0
  const gaiStrokes = categories.find(c => c.name === "外格")?.strokeCount || 0
  const souStrokes = categories.find(c => c.name === "総格")?.strokeCount || 0
  
  // 画数の一の位で五行を決定
  const getElementFromStrokes = (strokes: number): string => {
    const lastDigit = strokes % 10
    if (lastDigit <= 2) return "水"
    if (lastDigit <= 4) return "木"
    if (lastDigit <= 6) return "火"
    if (lastDigit <= 8) return "土"
    return "金"
  }
  
  // 各格の要素を計算
  const elements = {
    woodCount: 0,
    fireCount: 0,
    earthCount: 0,
    metalCount: 0,
    waterCount: 0
  }
  
  // 各格の要素をカウント
  const tenElement = getElementFromStrokes(tenStrokes)
  const jinElement = getElementFromStrokes(jinStrokes)
  const chiElement = getElementFromStrokes(chiStrokes)
  const gaiElement = getElementFromStrokes(gaiStrokes)
  const souElement = getElementFromStrokes(souStrokes)
  
  // 要素をカウント（人格と総格を重視）
  const elementCounts = [tenElement, jinElement, jinElement, chiElement, gaiElement, souElement, souElement]
  
  elementCounts.forEach(element => {
    switch (element) {
      case "木": elements.woodCount++; break
      case "火": elements.fireCount++; break
      case "土": elements.earthCount++; break
      case "金": elements.metalCount++; break
      case "水": elements.waterCount++; break
    }
  })
  
  return elements
}

// ヘルパー関数群
function getDominantElement(elements: any): string {
  const counts = [
    { element: "木", count: elements.woodCount },
    { element: "火", count: elements.fireCount },
    { element: "土", count: elements.earthCount },
    { element: "金", count: elements.metalCount },
    { element: "水", count: elements.waterCount }
  ]
  
  return counts.reduce((max, current) => 
    current.count > max.count ? current : max
  ).element
}

function getWeakElement(elements: any): string {
  const counts = [
    { element: "木", count: elements.woodCount },
    { element: "火", count: elements.fireCount },
    { element: "土", count: elements.earthCount },
    { element: "金", count: elements.metalCount },
    { element: "水", count: elements.waterCount }
  ]
  
  return counts.reduce((min, current) => 
    current.count < min.count ? current : min
  ).element
}

function getFortuneText(level: number): string {
  switch (level) {
    case 5: return "大変良好"
    case 4: return "良好"
    case 3: return "やや良好"
    case 2: return "普通"
    case 1: return "やや注意が必要"
    case 0: return "注意が必要"
    default: return "普通"
  }
}

function getElementName(element: string): string {
  const nameMap: Record<string, string> = {
    木: "木の要素",
    火: "火の要素", 
    土: "土の要素",
    金: "金の要素",
    水: "水の要素"
  }
  return nameMap[element] || "土の要素"
}

function getElementAdvice(element: string): string {
  const adviceMap: Record<string, string> = {
    木: "成長と発展を重視し、新しいことに挑戦することをお勧めします。",
    火: "情熱と行動力を活かし、積極的に物事に取り組むと良いでしょう。",
    土: "安定と信頼を大切にし、着実に基盤を築いていくことが重要です。",
    金: "整理と完成を心がけ、質の高い成果を目指すと良いでしょう。",
    水: "流れと変化を活かし、柔軟性を持って対応することが大切です。"
  }
  return adviceMap[element] || "バランスを保つことが重要です。"
}

function getCareerAdviceByElement(element: string): string {
  const careerMap: Record<string, string> = {
    木: "教育、農業、環境関連の仕事が向いています。",
    火: "エンターテイメント、販売、サービス業が適しています。",
    土: "不動産、建設、金融業が向いています。",
    金: "IT、精密機械、宝石関連の仕事が適しています。",
    水: "貿易、物流、医療関連の仕事が向いています。"
  }
  return careerMap[element] || "様々な分野で活躍できます。"
}

function getHealthAdviceByElement(element: string): string {
  const healthMap: Record<string, string> = {
    木: "肝臓や胆のうの健康に注意し、緑の野菜を多く摂りましょう。",
    火: "心臓や小腸の健康に注意し、適度な運動を心がけましょう。",
    土: "胃や脾臓の健康に注意し、規則正しい食事を心がけましょう。",
    金: "肺や大腸の健康に注意し、深呼吸や呼吸法を実践しましょう。",
    水: "腎臓や膀胱の健康に注意し、十分な水分補給を心がけましょう。"
  }
  return healthMap[element] || "全体的な健康管理を心がけましょう。"
}

// 人格別の詳細アドバイス生成
function getPersonalityAdvice(strokes: number, fortune: string, gender: string): string {
  const genderText = gender === "male" ? "男性" : "女性"
  
  // 画数に基づく特徴
  if (strokes <= 5) {
    return `少ない画数から、シンプルで直感的な判断力に優れた${genderText}です。リーダーシップよりも、サポート役として活躍できる素質があります。`
  } else if (strokes <= 10) {
    return `バランスの取れた画数から、協調性と個性を兼ね備えた${genderText}です。チームワークを大切にしながら、適度なリーダーシップを発揮できます。`
  } else if (strokes <= 15) {
    return `中程度の画数から、安定感と行動力を併せ持つ${genderText}です。着実な判断力で、周囲から信頼されるリーダーになれる素質があります。`
  } else if (strokes <= 20) {
    return `多い画数から、複雑で深い思考力を持つ${genderText}です。戦略的な視点で、大きなプロジェクトを成功に導くリーダーシップがあります。`
  } else {
    return `非常に多い画数から、多面的な才能を持つ${genderText}です。創造性と実行力を兼ね備え、革新的なリーダーシップを発揮できます。`
  }
}

function getPersonalityImprovementAdvice(strokes: number, fortune: string, gender: string): string {
  const genderText = gender === "male" ? "男性" : "女性"
  
  if (strokes <= 5) {
    return `少ない画数から、協調性を大切にし、周囲との調和を心がけることで、${genderText}としての魅力が向上します。`
  } else if (strokes <= 10) {
    return `バランスの取れた画数から、自己表現を控えめにし、相手の立場を理解することで、${genderText}としての信頼が深まります。`
  } else if (strokes <= 15) {
    return `中程度の画数から、謙虚さを保ちながら、着実に努力を重ねることで、${genderText}としての評価が高まります。`
  } else {
    return `多い画数から、複雑な思考をシンプルに表現し、相手に分かりやすく伝えることで、${genderText}としての影響力が増します。`
  }
}

function getPersonalityStableAdvice(strokes: number, fortune: string, gender: string): string {
  const genderText = gender === "male" ? "男性" : "女性"
  
  if (strokes <= 5) {
    return `少ない画数から、シンプルで安定した性格の${genderText}です。継続的な努力で着実に成長できます。`
  } else if (strokes <= 10) {
    return `バランスの取れた画数から、安定感のある${genderText}です。周囲との調和を保ちながら、着実に目標を達成できます。`
  } else if (strokes <= 15) {
    return `中程度の画数から、安定した判断力を持つ${genderText}です。慎重な行動で、確実な成果を上げることができます。`
  } else {
    return `多い画数から、深い思考力を持つ安定した${genderText}です。複雑な状況でも、冷静に判断し、着実に前進できます。`
  }
}

// 最良の格を特定
function getBestFormat(fortuneLevels: any, categories: any[]): any {
  const formats = [
    { name: "天格", level: fortuneLevels.ten, category: categories.find(c => c.name === "天格") },
    { name: "人格", level: fortuneLevels.jin, category: categories.find(c => c.name === "人格") },
    { name: "地格", level: fortuneLevels.chi, category: categories.find(c => c.name === "地格") },
    { name: "外格", level: fortuneLevels.gai, category: categories.find(c => c.name === "外格") },
    { name: "総格", level: fortuneLevels.sou, category: categories.find(c => c.name === "総格") }
  ]
  
  const best = formats.reduce((max, current) => 
    current.level > max.level ? current : max
  )
  
  return {
    name: best.name,
    level: best.level,
    strokes: best.category?.strokeCount || 0,
    fortune: best.category?.fortune || "普通"
  }
}

// 最悪の格を特定
function getWorstFormat(fortuneLevels: any, categories: any[]): any {
  const formats = [
    { name: "天格", level: fortuneLevels.ten, category: categories.find(c => c.name === "天格") },
    { name: "人格", level: fortuneLevels.jin, category: categories.find(c => c.name === "人格") },
    { name: "地格", level: fortuneLevels.chi, category: categories.find(c => c.name === "地格") },
    { name: "外格", level: fortuneLevels.gai, category: categories.find(c => c.name === "外格") },
    { name: "総格", level: fortuneLevels.sou, category: categories.find(c => c.name === "総格") }
  ]
  
  const worst = formats.reduce((min, current) => 
    current.level < min.level ? current : min
  )
  
  return {
    name: worst.name,
    level: worst.level,
    strokes: worst.category?.strokeCount || 0,
    fortune: worst.category?.fortune || "普通"
  }
}

// 格別のアドバイス生成
function getFormatAdvice(formatName: string, strokes: number, fortune: string, gender: string): string {
  const genderText = gender === "male" ? "男性" : "女性"
  
  switch (formatName) {
    case "天格":
      return `社会的な印象や対外的な評価が良好な${genderText}です。人脈作りや社会活動で活躍できます。`
    case "人格":
      return `性格や才能の運勢が良好な${genderText}です。リーダーシップや創造性を発揮できます。`
    case "地格":
      return `家庭運や基礎的な運勢が良好な${genderText}です。家族関係や若年期の運勢に恵まれます。`
    case "外格":
      return `対人関係や社会性の運勢が良好な${genderText}です。コミュニケーション能力に優れています。`
    case "総格":
      return `人生全体の運勢が良好な${genderText}です。総合的な成功と充実した人生が期待できます。`
    default:
      return `運勢が良好な${genderText}です。`
  }
}

// 格別の改善アドバイス生成
function getFormatImprovementAdvice(formatName: string, strokes: number, fortune: string, gender: string): string {
  const genderText = gender === "male" ? "男性" : "女性"
  
  switch (formatName) {
    case "天格":
      return `社会的な印象を向上させるため、礼儀正しさと誠実さを心がけましょう。`
    case "人格":
      return `性格面での成長のため、自己分析と内省を深め、協調性を大切にしましょう。`
    case "地格":
      return `家庭運の向上のため、家族とのコミュニケーションを密にし、基礎を固めましょう。`
    case "外格":
      return `対人関係の改善のため、相手の立場を理解し、思いやりを持って接しましょう。`
    case "総格":
      return `人生全体の運勢向上のため、バランスの取れた生活と着実な努力を心がけましょう。`
    default:
      return `運勢の改善のため、着実な努力を重ねましょう。`
  }
}
