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

// 大吉の画数に特化したアドバイス生成
function generateDaiKichiAdvice(categories: any[], gender: "male" | "female"): string {
  const daiKichiCategories = categories.filter(c => c.fortune === "大吉")
  
  if (daiKichiCategories.length === 0) return ""
  
  // ランダムで1つの大吉を選択
  const selectedDaiKichi = daiKichiCategories[Math.floor(Math.random() * daiKichiCategories.length)]
  const { name, strokeCount, fortune } = selectedDaiKichi
  
  // 各大吉の画数に特化したアドバイス
  const daiKichiAdviceMap: Record<number, string> = {
    1: "1画の大吉は「リーダーシップ」の象徴です。先頭に立って人を導く力があり、新しいプロジェクトや事業を始めるのに最適です。",
    2: "2画の大吉は「協調性」の象徴です。パートナーシップやチームワークで成功し、人との調和を大切にすることで運気が上昇します。",
    3: "3画の大吉は「創造性」の象徴です。芸術や創作活動で才能を発揮し、新しいアイデアや発明で世の中に貢献できます。",
    4: "4画の大吉は「安定性」の象徴です。着実な努力で成功を掴み、長期的な視点で物事を進めることで大きな成果を得られます。",
    5: "5画の大吉は「変化」の象徴です。新しい環境や挑戦で運気が開花し、変化を恐れずに行動することで幸運が訪れます。",
    6: "6画の大吉は「調和」の象徴です。家庭や人間関係で幸せを掴み、周囲の人々との絆を深めることで豊かな人生を送れます。",
    7: "7画の大吉は「直感」の象徴です。第六感が鋭く、正しい判断力で困難を乗り越え、精神的な成長を遂げることができます。",
    8: "8画の大吉は「成功」の象徴です。ビジネスや金運で大成功を収め、社会的な地位や名誉を得ることができます。",
    9: "9画の大吉は「完成」の象徴です。長年の努力が実を結び、人生の目標を達成し、後世に名を残すことができます。",
    10: "10画の大吉は「完璧」の象徴です。バランスの取れた人生を送り、あらゆる面で成功と幸せを手に入れることができます。",
    11: "11画の大吉は「革新」の象徴です。既存の概念を覆す新しい発想で、業界や社会に革命をもたらすことができます。",
    12: "12画の大吉は「成長」の象徴です。継続的な学習と努力で能力を向上させ、着実にステップアップしていけます。",
    13: "13画の大吉は「統率」の象徴です。組織やチームをまとめる力があり、リーダーとして多くの人を導くことができます。",
    14: "14画の大吉は「忍耐」の象徴です。困難な状況でも諦めずに努力を続けることで、最終的に大きな成功を掴めます。",
    15: "15画の大吉は「慈愛」の象徴です。人々に愛され、信頼され、周囲の人々の幸せを願う心で豊かな人生を送れます。",
    16: "16画の大吉は「権威」の象徴です。社会的な地位や権力を持ち、多くの人々に影響を与える存在になることができます。",
    17: "17画の大吉は「独立」の象徴です。自分の力で道を切り開き、独創的なアイデアで成功を掴むことができます。",
    18: "18画の大吉は「忍耐」の象徴です。長期的な視点で物事を進め、着実な努力で大きな成果を得ることができます。",
    19: "19画の大吉は「完成」の象徴です。長年の努力が実を結び、人生の目標を達成し、後世に名を残すことができます。",
    20: "20画の大吉は「調和」の象徴です。家庭や人間関係で幸せを掴み、周囲の人々との絆を深めることで豊かな人生を送れます。",
    21: "21画の大吉は「リーダーシップ」の象徴です。先頭に立って人を導く力があり、新しいプロジェクトや事業を始めるのに最適です。",
    22: "22画の大吉は「協調性」の象徴です。パートナーシップやチームワークで成功し、人との調和を大切にすることで運気が上昇します。",
    23: "23画の大吉は「創造性」の象徴です。芸術や創作活動で才能を発揮し、新しいアイデアや発明で世の中に貢献できます。",
    24: "24画の大吉は「安定性」の象徴です。着実な努力で成功を掴み、長期的な視点で物事を進めることで大きな成果を得られます。",
    25: "25画の大吉は「変化」の象徴です。新しい環境や挑戦で運気が開花し、変化を恐れずに行動することで幸運が訪れます。",
    26: "26画の大吉は「調和」の象徴です。家庭や人間関係で幸せを掴み、周囲の人々との絆を深めることで豊かな人生を送れます。",
    27: "27画の大吉は「直感」の象徴です。第六感が鋭く、正しい判断力で困難を乗り越え、精神的な成長を遂げることができます。",
    28: "28画の大吉は「成功」の象徴です。ビジネスや金運で大成功を収め、社会的な地位や名誉を得ることができます。",
    29: "29画の大吉は「完成」の象徴です。長年の努力が実を結び、人生の目標を達成し、後世に名を残すことができます。",
    30: "30画の大吉は「完璧」の象徴です。バランスの取れた人生を送り、あらゆる面で成功と幸せを手に入れることができます。",
    31: "31画の大吉は「良縁」の象徴です。特に女性にとっては幸せな結婚運に恵まれ、仕事と家庭を両立して豊かな人生を送れます。",
    32: "32画の大吉は「革新」の象徴です。既存の概念を覆す新しい発想で、業界や社会に革命をもたらすことができます。",
    33: "33画の大吉は「成長」の象徴です。継続的な学習と努力で能力を向上させ、着実にステップアップしていけます。",
    34: "34画の大吉は「統率」の象徴です。組織やチームをまとめる力があり、リーダーとして多くの人を導くことができます。",
    35: "35画の大吉は「忍耐」の象徴です。困難な状況でも諦めずに努力を続けることで、最終的に大きな成功を掴めます。",
    36: "36画の大吉は「慈愛」の象徴です。人々に愛され、信頼され、周囲の人々の幸せを願う心で豊かな人生を送れます。",
    37: "37画の大吉は「権威」の象徴です。社会的な地位や権力を持ち、多くの人々に影響を与える存在になることができます。",
    38: "38画の大吉は「独立」の象徴です。自分の力で道を切り開き、独創的なアイデアで成功を掴むことができます。",
    39: "39画の大吉は「忍耐」の象徴です。長期的な視点で物事を進め、着実な努力で大きな成果を得ることができます。",
    40: "40画の大吉は「完成」の象徴です。長年の努力が実を結び、人生の目標を達成し、後世に名を残すことができます。",
    41: "41画の大吉は「調和」の象徴です。家庭や人間関係で幸せを掴み、周囲の人々との絆を深めることで豊かな人生を送れます。",
    42: "42画の大吉は「リーダーシップ」の象徴です。先頭に立って人を導く力があり、新しいプロジェクトや事業を始めるのに最適です。",
    43: "43画の大吉は「協調性」の象徴です。パートナーシップやチームワークで成功し、人との調和を大切にすることで運気が上昇します。",
    44: "44画の大吉は「創造性」の象徴です。芸術や創作活動で才能を発揮し、新しいアイデアや発明で世の中に貢献できます。",
    45: "45画の大吉は「安定性」の象徴です。着実な努力で成功を掴み、長期的な視点で物事を進めることで大きな成果を得られます。",
    46: "46画の大吉は「変化」の象徴です。新しい環境や挑戦で運気が開花し、変化を恐れずに行動することで幸運が訪れます。",
    47: "47画の大吉は「調和」の象徴です。家庭や人間関係で幸せを掴み、周囲の人々との絆を深めることで豊かな人生を送れます。",
    48: "48画の大吉は「コミュニケーション」の象徴です。人との繋がりを大切にし、調整役として多くの人々に愛され、信頼される存在になります。",
    49: "49画の大吉は「直感」の象徴です。第六感が鋭く、正しい判断力で困難を乗り越え、精神的な成長を遂げることができます。",
    50: "50画の大吉は「成功」の象徴です。ビジネスや金運で大成功を収め、社会的な地位や名誉を得ることができます。",
  }
  
  const advice = daiKichiAdviceMap[strokeCount] || `${strokeCount}画の大吉は「特別な運気」の象徴です。この画数を持つ${name}は、特別な才能と運気に恵まれています。`
  
  // 複数大吉の特別アドバイス
  const preDaiKichiAdvice = generatePreDaiKichiAdvice(categories, gender)
  
  return `🎉 ${name}（${strokeCount}画）の大吉運気について：${advice}${preDaiKichiAdvice}`
}

// 複数大吉の特別アドバイス生成
function generatePreDaiKichiAdvice(categories: any[], gender: "male" | "female"): string {
  const daiKichiCategories = categories.filter(c => c.fortune === "大吉")
  
  if (daiKichiCategories.length < 2) return ""
  
  // 全部大吉の特別処理
  if (daiKichiCategories.length === 5) {
    return `\n\n🌟 全部大吉の究極運気について：天格・人格・地格・外格・総格の全てで大吉を獲得している${gender === "male" ? "男性" : "女性"}は、数百年に一人の究極の運気の持ち主です！この運気は、あらゆる面で最高レベルの成功と幸せを約束する特別な運気です。人生のあらゆる分野で輝き、後世に名を残す偉大な人物になる可能性を秘めています。しかし、究極の運勢であっても、その光を維持するためには日々の小さな導きが必要です。この究極の運勢を最大限に活かす方法を、まいにちAI姓名判断でお確かめください。`
  }
  
  // 複数大吉の組み合わせパターン
  const preDaiKichiPatterns = [
    {
      condition: (cats: any[]) => cats.some(c => c.name === "外格" && c.fortune === "大吉") && cats.some(c => c.name === "総格" && c.fortune === "大吉"),
      advice: "🌟 外格・総格の複数大吉は「最強の運気」の象徴です！この組み合わせは、人間関係と人生全体の運気が最高レベルに達していることを示します。良縁と社会的成功の両方を手に入れることができる特別な運気です。"
    },
    {
      condition: (cats: any[]) => cats.some(c => c.name === "天格" && c.fortune === "大吉") && cats.some(c => c.name === "人格" && c.fortune === "大吉"),
      advice: "🌟 天格・人格の複数大吉は「リーダーシップ」の象徴です！この組み合わせは、生まれ持った才能と人格の両方が最高レベルに達していることを示します。事業や組織で大きな成功を収めることができる特別な運気です。"
    },
    {
      condition: (cats: any[]) => cats.some(c => c.name === "地格" && c.fortune === "大吉") && cats.some(c => c.name === "総格" && c.fortune === "大吉"),
      advice: "🌟 地格・総格の複数大吉は「家庭運」の象徴です！この組み合わせは、家庭生活と人生全体の運気が最高レベルに達していることを示します。家庭と仕事の両方で幸せを掴むことができる特別な運気です。"
    },
    {
      condition: (cats: any[]) => cats.some(c => c.name === "天格" && c.fortune === "大吉") && cats.some(c => c.name === "総格" && c.fortune === "大吉"),
      advice: "🌟 天格・総格の複数大吉は「完璧な運気」の象徴です！この組み合わせは、生まれ持った運気と人生全体の運気が最高レベルに達していることを示します。あらゆる面で成功と幸せを手に入れることができる特別な運気です。"
    },
    {
      condition: (cats: any[]) => cats.some(c => c.name === "人格" && c.fortune === "大吉") && cats.some(c => c.name === "地格" && c.fortune === "大吉"),
      advice: "🌟 人格・地格の複数大吉は「バランス」の象徴です！この組み合わせは、人格と家庭生活の運気が最高レベルに達していることを示します。仕事と家庭の両方で成功を収めることができる特別な運気です。"
    },
    {
      condition: (cats: any[]) => cats.some(c => c.name === "外格" && c.fortune === "大吉") && cats.some(c => c.name === "地格" && c.fortune === "大吉"),
      advice: "🌟 外格・地格の複数大吉は「人間関係」の象徴です！この組み合わせは、人間関係と家庭生活の運気が最高レベルに達していることを示します。良縁と家庭の幸せの両方を手に入れることができる特別な運気です。"
    }
  ]
  
  // 該当するパターンを探す
  for (const pattern of preDaiKichiPatterns) {
    if (pattern.condition(daiKichiCategories)) {
      return `\n\n${pattern.advice}`
    }
  }
  
  // デフォルトの複数大吉アドバイス
  return `\n\n🌟 複数大吉の特別な運気について：複数の格で大吉を獲得している${gender === "male" ? "男性" : "女性"}は、非常に稀で特別な運気の持ち主です。この運気を最大限に活かすためには、自信を持って行動し、周囲の人々との調和を大切にすることが重要です。`
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

  // 五行要素の分析（実際のグラフの値から直接計算）
  // elementsが存在する場合はそれを使用、存在しない場合は動的に生成
  const dynamicElements = generateElementsFromName(name, categories)
  const actualElements = elements || dynamicElements
  
  // 実際のグラフの値から最大値と最小値を計算（グラフの表示と一致させるため）
  const elementArray = [
    { element: "木" as const, count: actualElements.woodCount || 0 },
    { element: "火" as const, count: actualElements.fireCount || 0 },
    { element: "土" as const, count: actualElements.earthCount || 0 },
    { element: "金" as const, count: actualElements.metalCount || 0 },
    { element: "水" as const, count: actualElements.waterCount || 0 },
  ]
  elementArray.sort((a, b) => b.count - a.count)
  const dominantElement = elementArray[0].element
  const weakElement = elementArray[elementArray.length - 1].element

  // AI生成されたパーソナライズアドバイス
  const personalizedAdvice = generatePersonalizedAdvice(
    name, gender, overallFortuneLevel, dominantElement, weakElement, fortuneLevels, categories
  )
  
  // 大吉特化アドバイスを追加
  const daiKichiAdvice = generateDaiKichiAdvice(categories, gender)
  const enhancedPersonalizedAdvice = personalizedAdvice + (daiKichiAdvice ? `\n\n${daiKichiAdvice}` : "")

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
    personalizedAdvice: enhancedPersonalizedAdvice,
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
  const fortuneLevel = (jinFortune === "大吉" ? 5 : jinFortune === "吉" ? 4 : jinFortune === "中吉" ? 3 : jinFortune === "凶" ? 1 : 2)
  const souLevel = (souFortune === "大吉" ? 5 : souFortune === "吉" ? 4 : souFortune === "中吉" ? 3 : souFortune === "凶" ? 1 : 2)
  const combinedLevel = (fortuneLevel + souLevel) / 2
  
  // 人格と総格の組み合わせに基づくアドバイス
  const careerPatterns: Array<{ condition: () => boolean, advice: string }> = [
    {
      condition: () => jinFortune === "大吉" && souFortune === "大吉",
      advice: "リーダーシップと総合的な成功運に恵まれています。経営者やプロジェクトリーダーとして活躍できる素質があります。"
    },
    {
      condition: () => jinFortune === "大吉" && souFortune === "吉",
      advice: "リーダーシップを活かし、管理職や専門職で成功を収められます。"
    },
    {
      condition: () => jinFortune === "吉" && souFortune === "大吉",
      advice: "協調性と成功運を兼ね備え、チームワークを活かした職場で力を発揮できます。"
    },
    {
      condition: () => jinFortune === "大吉" || jinFortune === "吉",
      advice: "リーダーシップや創造性を活かせる職業が向いています。"
    },
    {
      condition: () => jinFortune === "凶" || jinFortune === "大凶",
      advice: "協調性を重視する職場環境や、サポート役として活躍できる職種が適しています。"
    },
    {
      condition: () => combinedLevel >= 4,
      advice: "積極的に挑戦できる環境で、才能を最大限に発揮できます。"
    },
    {
      condition: () => combinedLevel <= 2,
      advice: "着実にスキルを積み上げ、安定した職場で経験を重ねることが成功への道です。"
    },
    {
      condition: () => true,
      advice: "バランスの取れた職場環境で、着実に成長していけます。"
    }
  ]
  
  // 条件に合う最初のパターンを返す
  for (const pattern of careerPatterns) {
    if (pattern.condition()) {
      return pattern.advice + " " + getCareerAdviceByElement(dominantElement)
    }
  }
  
  return getCareerAdviceByElement(dominantElement)
}

// 人間関係アドバイス生成
function generateRelationshipAdvice(gaiFortune: string, chiFortune: string, gender: string): string {
  const gaiLevel = (gaiFortune === "大吉" ? 5 : gaiFortune === "吉" ? 4 : gaiFortune === "中吉" ? 3 : gaiFortune === "凶" ? 1 : 2)
  const chiLevel = (chiFortune === "大吉" ? 5 : chiFortune === "吉" ? 4 : chiFortune === "中吉" ? 3 : chiFortune === "凶" ? 1 : 2)
  
  const relationshipPatterns: Array<{ condition: () => boolean, advice: string }> = [
    {
      condition: () => gaiFortune === "大吉" && chiFortune === "大吉",
      advice: "社交性と家庭運の両方に恵まれ、広い人脈と深い家族の絆を同時に築けます。"
    },
    {
      condition: () => gaiFortune === "大吉" && chiFortune === "吉",
      advice: "社交性に優れ、多くの人との良好な関係を築けます。家庭運も良好です。"
    },
    {
      condition: () => gaiFortune === "吉" && chiFortune === "大吉",
      advice: "家庭運が特に良好で、家族との絆が深まります。外での人間関係も良好です。"
    },
    {
      condition: () => gaiFortune === "大吉" || gaiFortune === "吉",
      advice: "社交性に優れ、多くの人との良好な関係を築けます。"
    },
    {
      condition: () => chiFortune === "大吉" || chiFortune === "吉",
      advice: "家庭運が良好で、家族との絆が深まります。"
    },
    {
      condition: () => gaiFortune === "凶" || gaiFortune === "大凶",
      advice: "少数の深い関係を大切にすることで、幸せな人間関係を築けます。"
    },
    {
      condition: () => chiFortune === "凶" || chiFortune === "大凶",
      advice: "家族とのコミュニケーションを大切にし、時間をかけて絆を深めましょう。"
    },
    {
      condition: () => gaiLevel >= 3 && chiLevel >= 3,
      advice: "バランスの取れた人間関係を築き、周囲との調和を大切にしましょう。"
    },
    {
      condition: () => true,
      advice: "相手の立場を理解し、思いやりを持って接することで、良好な人間関係を築けます。"
    }
  ]
  
  // 条件に合う最初のパターンを返す
  for (const pattern of relationshipPatterns) {
    if (pattern.condition()) {
      return pattern.advice
    }
  }
  
  return "相手の立場を理解し、思いやりを持って接することで、良好な人間関係を築けます。"
}

// 健康アドバイス生成
function generateHealthTips(dominantElement: string, weakElement: string, fortuneLevel: number): string {
  const healthPatterns: Array<{ condition: () => boolean, advice: string }> = [
    {
      condition: () => fortuneLevel >= 4 && weakElement !== dominantElement,
      advice: getHealthAdviceByElement(dominantElement) + " また、" + getHealthAdviceByElement(weakElement).replace(/^[^。]+。/, "").replace(/^[^。]+。/, "")
    },
    {
      condition: () => fortuneLevel >= 4,
      advice: getHealthAdviceByElement(dominantElement) + " 全体的に健康運が良好なので、この調子を維持しましょう。"
    },
    {
      condition: () => fortuneLevel <= 2,
      advice: getHealthAdviceByElement(dominantElement) + " 体調管理に注意し、規則正しい生活を心がけましょう。"
    },
    {
      condition: () => weakElement !== dominantElement,
      advice: getHealthAdviceByElement(dominantElement) + " さらに、" + getHealthAdviceByElement(weakElement).replace(/^[^。]+。/, "").replace(/^[^。]+。/, "")
    },
    {
      condition: () => true,
      advice: getHealthAdviceByElement(dominantElement)
    }
  ]
  
  // 条件に合う最初のパターンを返す
  for (const pattern of healthPatterns) {
    if (pattern.condition()) {
      return pattern.advice
    }
  }
  
  return getHealthAdviceByElement(dominantElement)
}

// 日々のアクション生成（ワンポイントアドバイスに変更）
function generateDailyActions(luckyElements: string[], luckyColors: string[], fortuneLevel: number): string[] {
  const actions: string[] = []
  const dominantElement = luckyElements[0] || "土"
  
  // 運勢レベルとラッキー要素に基づくワンポイントアドバイス
  const actionPatterns: Array<{ condition: () => boolean, advice: string }> = [
    {
      condition: () => fortuneLevel >= 4 && dominantElement === "木",
      advice: "朝の散歩で自然のエネルギーを取り入れ、新しい一日をスタートしましょう。"
    },
    {
      condition: () => fortuneLevel >= 4 && dominantElement === "火",
      advice: "太陽の光を浴びながら、温かい飲み物で心身をリフレッシュしましょう。"
    },
    {
      condition: () => fortuneLevel >= 4 && dominantElement === "土",
      advice: "料理やガーデニングなど、手を動かす活動で運気を高めましょう。"
    },
    {
      condition: () => fortuneLevel >= 4 && dominantElement === "金",
      advice: "整理整頓や計画を立てることで、運気を整えましょう。"
    },
    {
      condition: () => fortuneLevel >= 4 && dominantElement === "水",
      advice: "入浴や水の音を聞くことで、心を落ち着かせ運気を整えましょう。"
    },
    {
      condition: () => fortuneLevel <= 2 && dominantElement === "木",
      advice: "室内に観葉植物を置き、自然のエネルギーを取り入れて運気を改善しましょう。"
    },
    {
      condition: () => fortuneLevel <= 2 && dominantElement === "火",
      advice: "温かい飲み物を飲み、心を温めることで運気を向上させましょう。"
    },
    {
      condition: () => fortuneLevel <= 2 && dominantElement === "土",
      advice: "規則正しい食事と生活リズムを心がけ、運気の基盤を整えましょう。"
    },
    {
      condition: () => fortuneLevel <= 2 && dominantElement === "金",
      advice: "身の回りを整理し、不要なものを手放すことで運気を改善しましょう。"
    },
    {
      condition: () => fortuneLevel <= 2 && dominantElement === "水",
      advice: "十分な水分補給と休息を心がけ、運気の流れを整えましょう。"
    },
    {
      condition: () => dominantElement === "木",
      advice: "植物を育てる、自然の中で過ごすなど、木のエネルギーを取り入れましょう。"
    },
    {
      condition: () => dominantElement === "火",
      advice: "太陽の光を浴びる、温かい飲み物を飲むなど、火のエネルギーを活用しましょう。"
    },
    {
      condition: () => dominantElement === "土",
      advice: "土に触れる、料理をするなど、土のエネルギーを感じましょう。"
    },
    {
      condition: () => dominantElement === "金",
      advice: "整理整頓する、金属製品に触れるなど、金のエネルギーを整えましょう。"
    },
    {
      condition: () => dominantElement === "水",
      advice: "水の音を聞く、入浴を楽しむなど、水のエネルギーでリフレッシュしましょう。"
    },
    {
      condition: () => true,
      advice: `${luckyColors[0] || "ラッキー"}色のアイテムを身につけ、運気を高めましょう。`
    }
  ]
  
  // 条件に合う最初のパターンを返す
  for (const pattern of actionPatterns) {
    if (pattern.condition()) {
      actions.push(pattern.advice)
      break
    }
  }
  
  // 追加のアクション（最大3個まで）
  if (luckyColors.length > 0 && actions.length < 3) {
    actions.push(`${luckyColors[0]}色のアイテムを身につける`)
  }
  
  return actions.slice(0, 3) // 最大3個
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

// 言霊あつめ用のラッキーカラー取得
function getElementColorForKotodama(element: string): string {
  const colorMap: Record<string, string> = {
    木: "緑や青緑",
    火: "赤やオレンジ",
    土: "黄やベージュ",
    金: "白やシルバー",
    水: "青やネイビー"
  }
  return colorMap[element] || "緑や青緑"
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
