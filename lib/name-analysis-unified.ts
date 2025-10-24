"use client"

import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"

// 定数定義
const REGEX_PATTERNS = {
  english: /[a-zA-Z]/,
  number: /[0-9]/,
  hiragana: /[\u3040-\u309F]/,
  katakana: /[\u30A0-\u30FF]/,
  kanji: /[\u4E00-\u9FAF]/,
} as const

// 最適化された画数データ（Map構造で高速検索）
const strokeCountData = new Map<string, number>([
  ...Object.entries(basicNumbersData),
  ...Object.entries(surnamesData),
  ...Object.entries(givenNamesData),
  ...Object.entries(commonKanjiData),
  ...Object.entries(hiraganaData),
  ...Object.entries(katakanaData),
  ...Object.entries(extendedKanjiData),
  ...Object.entries(csvImportedData),
])

// "々"を削除
strokeCountData.delete("々")

/**
 * 統一された姓名判断計算クラス
 */
export class UnifiedNameAnalyzer {
  // 定数定義
  private static readonly REISUU_THRESHOLD = 1
  private static readonly DEFAULT_STROKES = {
    english: 1,
    number: 1,
    hiragana: 3,
    katakana: 3,
    kanji: 8,
  } as const

  /**
   * 文字の画数を取得（繰り返し文字対応版）
   */
  private static getCharStroke(char: string, context?: { fullText: string; position: number }): number {
    // 々の特別処理
    if (char === "々") {
      if (context && context.position > 0) {
        const prevChar = context.fullText.charAt(context.position - 1)
        const prevStroke = strokeCountData.get(prevChar)
        if (process.env.NODE_ENV === "development") {
          console.log(`🔍 々の処理: 前の文字="${prevChar}", 画数=${prevStroke}`)
        }
        if (prevStroke !== undefined) {
          return prevStroke
        }
        // 前の文字の画数が不明な場合はデフォルト値
        if (process.env.NODE_ENV === "development") {
          console.log(`⚠️ 々の前の文字"${prevChar}"の画数が不明 → デフォルト${this.DEFAULT_STROKES.kanji}画`)
        }
        return this.DEFAULT_STROKES.kanji
      }
      // 先頭にある場合はデフォルト値
      if (process.env.NODE_ENV === "development") {
        console.log(`⚠️ 々が先頭にある → デフォルト${this.DEFAULT_STROKES.kanji}画`)
      }
      return this.DEFAULT_STROKES.kanji
    }

    const stroke = strokeCountData.get(char)
    if (stroke !== undefined) {
      if (process.env.NODE_ENV === "development" && ["佐", "々", "木", "靖", "隆"].includes(char)) {
        console.log(`✅ "${char}" → ${stroke}画 (データあり)`)
      }
      return stroke
    }
    
    if (process.env.NODE_ENV === "development" && ["佐", "々", "木", "靖", "隆"].includes(char)) {
      console.log(`❌ "${char}"の画数データなし`)
    }

    // フォールバック：文字種別によるデフォルト値
    if (REGEX_PATTERNS.english.test(char)) {
      return this.DEFAULT_STROKES.english
    }
    if (REGEX_PATTERNS.number.test(char)) {
      return this.DEFAULT_STROKES.number
    }
    if (REGEX_PATTERNS.hiragana.test(char)) {
      return this.DEFAULT_STROKES.hiragana
    }
    if (REGEX_PATTERNS.katakana.test(char)) {
      return this.DEFAULT_STROKES.katakana
    }
    if (REGEX_PATTERNS.kanji.test(char)) {
      return this.DEFAULT_STROKES.kanji
    }

    return 0
  }

  /**
   * 名前の画数を計算（繰り返し文字対応版）
   */
  private static calculateNameStrokes(name: string): number {
    const chars = Array.from(name)
    let total = 0
    
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 名前の画数計算: "${name}"`)
    }
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]
      const context = { fullText: name, position: i }
      const stroke = this.getCharStroke(char, context)
      total += stroke
      
      if (process.env.NODE_ENV === "development") {
        console.log(`  ${i + 1}文字目 "${char}": ${stroke}画 (累計: ${total}画)`)
      }
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ "${name}"の総画数: ${total}画`)
    }
    
    return total
  }

  /**
   * 霊数の判定（最適化版）
   */
  private static hasReisuu(name: string): boolean {
    return name.length === this.REISUU_THRESHOLD
  }

  /**
   * 各格の計算（統一ロジック）
   */
  private static calculateFormats(
    lastName: string,
    firstName: string,
  ): {
    tenFormat: number
    jinFormat: number
    chiFormat: number
    gaiFormat: number
    totalFormat: number
    hasReisuuInLastName: boolean
    hasReisuuInFirstName: boolean
  } {
    const hasReisuuInLastName = this.hasReisuu(lastName)
    const hasReisuuInFirstName = this.hasReisuu(firstName)

    // 基本画数計算
    const lastNameCount = this.calculateNameStrokes(lastName)
    const firstNameCount = this.calculateNameStrokes(firstName)
    
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 五格計算デバッグ: 姓="${lastName}", 名="${firstName}"`)
      console.log(`姓の総画数: ${lastNameCount}画`)
      console.log(`名の総画数: ${firstNameCount}画`)
    }

    // 天格 = 姓の画数の合計（霊数含む）
    const tenFormat = hasReisuuInLastName ? lastNameCount + 1 : lastNameCount

    // 地格 = 名の画数の合計（霊数含む）
    const chiFormat = hasReisuuInFirstName ? firstNameCount + 1 : firstNameCount
    
    if (process.env.NODE_ENV === "development") {
      console.log(`霊数チェック: 姓="${lastName}"(${lastName.length}文字) → ${hasReisuuInLastName ? '霊数あり' : '霊数なし'}`)
      console.log(`霊数チェック: 名="${firstName}"(${firstName.length}文字) → ${hasReisuuInFirstName ? '霊数あり' : '霊数なし'}`)
      console.log(`天格計算: ${lastNameCount}画 + ${hasReisuuInLastName ? '1' : '0'} = ${tenFormat}画`)
      console.log(`地格計算: ${firstNameCount}画 + ${hasReisuuInFirstName ? '1' : '0'} = ${chiFormat}画`)
    }

    // 総格 = 実際の文字の画数のみ（霊数除外）
    const totalFormat = lastNameCount + firstNameCount

    // 人格 = 姓の最後の文字と名の最初の文字の画数の合計（霊数除外）
    const lastCharOfLastName = lastName.charAt(lastName.length - 1)
    const firstCharOfFirstName = firstName.charAt(0)
    const lastCharContext = { fullText: lastName, position: lastName.length - 1 }
    const firstCharContext = { fullText: firstName, position: 0 }
    const lastCharStroke = this.getCharStroke(lastCharOfLastName, lastCharContext)
    const firstCharStroke = this.getCharStroke(firstCharOfFirstName, firstCharContext)
    const jinFormat = lastCharStroke + firstCharStroke
    
    if (process.env.NODE_ENV === "development") {
      console.log(`人格計算: 姓の最後"${lastCharOfLastName}"(${lastCharStroke}画) + 名の最初"${firstCharOfFirstName}"(${firstCharStroke}画) = ${jinFormat}画`)
    }

    // 外格 = 総格 - 人格
    const gaiFormat = totalFormat - jinFormat
    
    if (process.env.NODE_ENV === "development") {
      console.log(`外格計算: 総格(${totalFormat}画) - 人格(${jinFormat}画) = ${gaiFormat}画`)
      console.log(`=== 五格計算結果 ===`)
      console.log(`天格: ${tenFormat}画`)
      console.log(`人格: ${jinFormat}画`)
      console.log(`地格: ${chiFormat}画`)
      console.log(`外格: ${gaiFormat}画`)
      console.log(`総格: ${totalFormat}画`)
      console.log(`=== 問題の特定 ===`)
      if (gaiFormat === 2) {
        console.log(`🚨 外格が2画になっています！`)
        console.log(`総格(${totalFormat}) - 人格(${jinFormat}) = ${gaiFormat}`)
        console.log(`これは明らかに間違っています。`)
        console.log(`正しい計算: 総格(48) - 人格(17) = 31画`)
      }
    }

    return {
      tenFormat,
      jinFormat,
      chiFormat,
      gaiFormat,
      totalFormat,
      hasReisuuInLastName,
      hasReisuuInFirstName,
    }
  }

  /**
   * 吉凶判定（詳細説明版）
   */
  private static getFortune(strokeCount: number): {
    fortune: string
    score: number
    description: string
  } {
    // 詳細な吉凶判定表
    const fortuneTable = new Map<number, { fortune: string; score: number; description: string }>([
      [1, { fortune: "大吉", score: 100, description: "万物の始まりを表す大吉数。新しいスタートを切る力に満ちており、あらゆる困難に打ち勝つ強い意志を持っています。リーダーシップに優れ、周囲を引っ張っていく力があります。独立心が旺盛で、自分の道を切り開く才能に恵まれています。" }],
      [2, { fortune: "凶", score: 20, description: "協調性はありますが、優柔不断な面があります。他人の意見に左右されやすく、自分の意志を貫くことが難しい傾向があります。しかし、縁の下の力持ちとして活躍できる場面では、実力を発揮することができます。" }],
      [3, { fortune: "大吉", score: 100, description: "創造力と表現力に優れた大吉数。明るく積極的な性格で、周囲から箸しみやすく慕われます。頭脳明晰で先見の明もあり、あらゆる分野で成功を収める可能性があります。芸術的才能にも恵まれています。" }],
      [4, { fortune: "凶", score: 25, description: "真面目で努力家ですが、苦労が多い傾向があります。地道な努力を重ねることで道が開けますが、時には柔軟性も必要です。安定を求める気持ちが強く、変化を嫌う面があります。" }],
      [5, { fortune: "大吉", score: 100, description: "自由と変化を好む大吉数。バランス感覚に優れ、多方面での活躍が期待できます。好奇心旺盛で、新しいことに挑戦する勇気があります。適応力が高く、どんな環境でも力を発揮できます。" }],
      [6, { fortune: "大吉", score: 100, description: "調和と安定をもたらす大吉数。家庭運に恵まれ、周囲との関係も良好です。責任感が強く、家族思いの性格です。人望に恵まれ、信頼される存在として成長していきます。" }],
      [7, { fortune: "吉", score: 70, description: "内省的で分析力に優れています。独立心があり、専門分野で成功する可能性があります。神秘的な力を持ち、直感力も鋭いです。精神面での充実を心がけることで、より良い結果を得られます。" }],
      [8, { fortune: "大吉", score: 100, description: "物質的な成功と豊かさをもたらす大吉数。意志が強く、困難を乗り越える力があります。経済面での安定が期待でき、事業運にも恵まれています。組織運営の才能もあります。" }],
      [9, { fortune: "凶", score: 30, description: "頭脳明晰ですが、変化の多い人生になります。博愛精神と奉仕の心を持ちますが、時として理想と現実のギャップに悩むことがあります。広い視野で物事を捉える能力があります。" }],
      [10, { fortune: "凶", score: 35, description: "波乱万丈な人生ですが、最終的には成功します。独立心と指導力がありますが、協調性も大切です。自分の道を切り開く力を持っていますが、周囲との調和を心がけることで、より良い結果を得られます。" }],
      [11, { fortune: "大吉", score: 100, description: "直感力と洞察力に優れた大吉数。霊感が強く、人々の心を読み取る能力があります。創造性に富み、芸術的才能にも恵まれています。精神的な成長を重ねることで、より高い次元での成功を収めます。" }],
      [12, { fortune: "吉", score: 60, description: "実践的で堅実な性格です。地道な努力が実を結び、安定した人生が期待できます。協調性があり、チームワークを大切にします。責任感が強く、信頼される存在として成長していきます。" }],
      [13, { fortune: "大吉", score: 100, description: "知恵と知識を重んじる大吉数。学習能力が高く、継続的な努力で大きな成果を上げます。指導力があり、後輩や部下を育てる才能に恵まれています。学問や研究分野での成功が期待できます。" }],
      [14, { fortune: "凶", score: 25, description: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。柔軟性と適応力が重要で、状況に応じて戦略を変えることが成功の鍵となります。" }],
      [15, { fortune: "大吉", score: 100, description: "家庭運と人望に恵まれた大吉数。温厚で親しみやすい性格で、多くの人から愛されます。家族思いで、家庭の平和を大切にします。社交性があり、良好な人間関係を築くことができます。" }],
      [16, { fortune: "大吉", score: 100, description: "責任感と指導力を持つ大吉数。組織をまとめる才能に恵まれ、リーダーとして活躍できます。誠実で信頼される存在として成長していきます。事業運にも恵まれ、経済的な成功が期待できます。" }],
      [17, { fortune: "吉", score: 55, description: "意志が強く、目標に向かって努力を続ける力があります。独立心があり、自分の道を切り開く才能に恵まれています。時として頑固な面もありますが、その意志の強さが成功をもたらします。" }],
      [18, { fortune: "吉", score: 50, description: "社交性があり、人とのつながりを大切にします。協調性に優れ、チームワークを発揮できます。人望に恵まれ、多くの人から信頼されます。バランス感覚が良く、安定した人生を送ることができます。" }],
      [19, { fortune: "凶", score: 30, description: "独立心が強く、自分の力で道を切り開こうとします。時として孤独を感じることもありますが、その強さが成功をもたらします。精神的な成長を重ねることで、より良い結果を得られます。" }],
      [20, { fortune: "凶", score: 35, description: "変化と適応の数です。状況に応じて柔軟に対応する能力がありますが、時として不安定さを感じることもあります。バランスを保つことが重要で、周囲との調和を心がけることで成功できます。" }],
      [21, { fortune: "大吉", score: 100, description: "独立心と独創性に富んだ大吉数。新しいアイデアを生み出す才能に恵まれています。リーダーシップがあり、周囲を引っ張っていく力があります。創造的な分野での成功が期待できます。" }],
      [22, { fortune: "凶", score: 25, description: "協調性はありますが、優柔不断な面があります。他人の意見に左右されやすく、自分の意志を貫くことが難しい傾向があります。しかし、チームワークを発揮できる場面では、実力を発揮することができます。" }],
      [23, { fortune: "大吉", score: 100, description: "芸術的才能と美的感覚に優れた大吉数。創造力が豊かで、表現力にも恵まれています。芸術や文化の分野での成功が期待できます。感性が鋭く、美しいものを愛する心があります。" }],
      [24, { fortune: "大吉", score: 100, description: "温和で協調性のある大吉数。人との調和を大切にし、平和を愛する性格です。家庭運に恵まれ、安定した幸せな家庭を築くことができます。人望に恵まれ、多くの人から愛されます。" }],
      [25, { fortune: "大吉", score: 100, description: "柔軟性と適応力に優れた大吉数。変化に対応する能力が高く、どんな環境でも力を発揮できます。バランス感覚が良く、安定した人生を送ることができます。社交性があり、良好な人間関係を築けます。" }],
      [26, { fortune: "凶", score: 30, description: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。柔軟性と適応力が重要で、状況に応じて戦略を変えることが成功の鍵となります。" }],
      [27, { fortune: "吉", score: 45, description: "知性と判断力に長けた数です。学習能力が高く、継続的な努力で大きな成果を上げます。指導力があり、後輩や部下を育てる才能に恵まれています。学問や研究分野での成功が期待できます。" }],
      [28, { fortune: "凶", score: 25, description: "変化と適応の数です。状況に応じて柔軟に対応する能力がありますが、時として不安定さを感じることもあります。バランスを保つことが重要で、周囲との調和を心がけることで成功できます。" }],
      [29, { fortune: "大吉", score: 100, description: "知性と判断力に長けた大吉数。学習能力が高く、継続的な努力で大きな成果を上げます。指導力があり、後輩や部下を育てる才能に恵まれています。学問や研究分野での成功が期待できます。" }],
      [30, { fortune: "凶", score: 30, description: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。柔軟性と適応力が重要で、状況に応じて戦略を変えることが成功の鍵となります。" }],
      [31, { fortune: "大吉", score: 100, description: "誠実で信頼される大吉数。責任感が強く、約束を守ることを大切にします。人望に恵まれ、多くの人から信頼されます。安定した人生を送ることができ、長期的な成功が期待できます。" }],
      [32, { fortune: "大吉", score: 100, description: "社交性と人気に恵まれた大吉数。コミュニケーション能力が高く、多くの人と良好な関係を築くことができます。人望に恵まれ、リーダーとして活躍する可能性があります。チームワークを発揮できる場面では、実力を発揮することができます。" }],
      [33, { fortune: "大吉", score: 100, description: "創造力と表現力が豊かな大吉数。芸術的才能に恵まれ、表現力にも優れています。感性が鋭く、美しいものを愛する心があります。創造的な分野での成功が期待できます。" }],
      [34, { fortune: "凶", score: 25, description: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。柔軟性と適応力が重要で、状況に応じて戦略を変えることが成功の鍵となります。" }],
      [35, { fortune: "大吉", score: 100, description: "温和で協調性のある大吉数。人との調和を大切にし、平和を愛する性格です。家庭運に恵まれ、安定した幸せな家庭を築くことができます。人望に恵まれ、多くの人から愛されます。" }],
      [36, { fortune: "凶", score: 20, description: "変化と適応の数です。状況に応じて柔軟に対応する能力がありますが、時として不安定さを感じることもあります。バランスを保つことが重要で、周囲との調和を心がけることで成功できます。" }],
      [37, { fortune: "大吉", score: 100, description: "知恵と知識を重んじる大吉数。学習能力が高く、継続的な努力で大きな成果を上げます。指導力があり、後輩や部下を育てる才能に恵まれています。学問や研究分野での成功が期待できます。" }],
      [38, { fortune: "凶", score: 15, description: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。柔軟性と適応力が重要で、状況に応じて戦略を変えることが成功の鍵となります。" }],
      [39, { fortune: "大吉", score: 100, description: "責任感と指導力を持つ大吉数。組織をまとめる才能に恵まれ、リーダーとして活躍できます。誠実で信頼される存在として成長していきます。事業運にも恵まれ、経済的な成功が期待できます。" }],
      [40, { fortune: "凶", score: 10, description: "変化と適応の数です。状況に応じて柔軟に対応する能力がありますが、時として不安定さを感じることもあります。バランスを保つことが重要で、周囲との調和を心がけることで成功できます。" }],
      [41, { fortune: "大吉", score: 100, description: "独立心と独創性に富んだ大吉数。新しいアイデアを生み出す才能に恵まれています。リーダーシップがあり、周囲を引っ張っていく力があります。創造的な分野での成功が期待できます。" }],
    ])

    const result = fortuneTable.get(strokeCount)
    if (result) {
      return result
    }

    // フォールバック：範囲による判定
    if (strokeCount >= 42 && strokeCount <= 50) {
      return { fortune: "大吉", score: 100, description: "安定した運勢を持ち、着実に成長していくことができます。継続的な努力が実を結び、長期的な成功が期待できます。バランス感覚が良く、安定した人生を送ることができます。" }
    }
    if (strokeCount >= 51 && strokeCount <= 60) {
      return { fortune: "中吉", score: 80, description: "安定した運勢を持ち、着実に成長していくことができます。継続的な努力が実を結び、長期的な成功が期待できます。バランス感覚が良く、安定した人生を送ることができます。" }
    }
    if (strokeCount >= 61 && strokeCount <= 70) {
      return { fortune: "小吉", score: 60, description: "穏やかな運勢を持ち、平和な人生を送ることができます。周囲との調和を大切にし、良好な人間関係を築くことができます。安定を求める気持ちが強く、変化を嫌う面があります。" }
    }
    if (strokeCount >= 71 && strokeCount <= 80) {
      return { fortune: "凶", score: 20, description: "注意が必要な運勢です。困難に直面することもありますが、努力と前向きな姿勢で乗り越えることができます。周囲との調和を心がけ、協調性を発揮することで、より良い結果を得ることができます。" }
    }

    return { fortune: "大凶", score: 10, description: "困難な運勢ですが、諦めずに努力を続けることで道が開けます。周囲のサポートを受けながら、一歩ずつ前進していくことが重要です。前向きな姿勢と継続的な努力が、運勢を改善する鍵となります。" }
  }

  /**
   * スコア計算（最適化版）
   */
  private static calculateScore(fortune: { fortune: string; score: number }): number {
    return fortune.score
  }

  /**
   * アドバイス生成（最適化版）
   */
  private static generateAdvice(
    tenFortune: any,
    jinFortune: any,
    chiFortune: any,
    gaiFortune: any,
    totalFortune: any,
  ): string {
    const fortunes = [tenFortune, jinFortune, chiFortune, gaiFortune, totalFortune]
    const goodFortunes = fortunes.filter((f) => f.fortune === "大吉" || f.fortune === "吉").length
    const badFortunes = fortunes.filter((f) => f.fortune === "凶" || f.fortune === "大凶").length

    if (goodFortunes >= 4) {
      return "非常に良い名前です。この名前の力を信じて、自信を持って人生を歩んでください。"
    }
    if (goodFortunes >= 3) {
      return "良い名前です。長所を活かして、短所を補う努力を続けてください。"
    }
    if (badFortunes >= 3) {
      return "名前の運勢に注意が必要です。努力と前向きな姿勢で運勢を改善していきましょう。"
    }

    return "バランスの取れた名前です。日々の努力と前向きな姿勢が運勢を左右します。"
  }

  /**
   * メイン分析関数（統一版）
   */
  static analyze(
    lastName: string,
    firstName: string,
    gender: "male" | "female" = "male",
    customFortuneData?: Record<string, any>,
  ): any {
    const originalLastName = lastName.trim()
    const originalFirstName = firstName.trim()

    if (process.env.NODE_ENV === "development") {
      console.log(`🔮 姓名判断開始（統一版）: 姓=${originalLastName}, 名=${originalFirstName}, 性別=${gender}`)
    }

    // 各格の計算
    const formats = this.calculateFormats(originalLastName, originalFirstName)

    // 吉凶判定
    const tenFortune = this.getFortune(formats.tenFormat)
    const jinFortune = this.getFortune(formats.jinFormat)
    const chiFortune = this.getFortune(formats.chiFormat)
    const gaiFortune = this.getFortune(formats.gaiFormat)
    const totalFortune = this.getFortune(formats.totalFormat)

    // スコア計算
    const tenScore = this.calculateScore(tenFortune)
    const jinScore = this.calculateScore(jinFortune)
    const chiScore = this.calculateScore(chiFortune)
    const gaiScore = this.calculateScore(gaiFortune)
    const totalScore = this.calculateScore(totalFortune)

    // 総合スコア（人格と総格を重視）
    const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

    // アドバイス生成
    const advice = this.generateAdvice(tenFortune, jinFortune, chiFortune, gaiFortune, totalFortune)

    // 文字詳細の生成
    const characterDetails = this.generateCharacterDetails(
      originalLastName,
      originalFirstName,
      formats.hasReisuuInLastName,
      formats.hasReisuuInFirstName,
    )

    const result = {
      categories: [
        {
          name: "天格",
          strokes: formats.tenFormat,
          fortune: tenFortune.fortune,
          score: tenScore,
          description: tenFortune.description,
        },
        {
          name: "人格",
          strokes: formats.jinFormat,
          fortune: jinFortune.fortune,
          score: jinScore,
          description: jinFortune.description,
        },
        {
          name: "地格",
          strokes: formats.chiFormat,
          fortune: chiFortune.fortune,
          score: chiScore,
          description: chiFortune.description,
        },
        {
          name: "外格",
          strokes: formats.gaiFormat,
          fortune: gaiFortune.fortune,
          score: gaiScore,
          description: gaiFortune.description,
        },
        {
          name: "総格",
          strokes: formats.totalFormat,
          fortune: totalFortune.fortune,
          score: totalScore,
          description: totalFortune.description,
        },
      ],
      overallScore,
      advice,
      characterDetails,
      hasReisuu: {
        lastName: formats.hasReisuuInLastName,
        firstName: formats.hasReisuuInFirstName,
      },
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ 姓名判断完了（統一版）: 総合スコア=${overallScore}`)
    }

    return result
  }

  /**
   * 文字詳細の生成（最適化版）
   */
  private static generateCharacterDetails(
    lastName: string,
    firstName: string,
    hasReisuuInLastName: boolean,
    hasReisuuInFirstName: boolean,
  ): any[] {
    const details: any[] = []

    // 姓の文字詳細
    if (hasReisuuInLastName) {
      details.push({
        name: "姓の霊数",
        character: "一",
        strokes: 1,
        isReisuu: true,
        isDefault: false,
      })
    }

    Array.from(lastName).forEach((char, i) => {
      const context = { fullText: lastName, position: i }
      const stroke = this.getCharStroke(char, context)
      details.push({
        name: `姓の${i + 1}文字目`,
        character: char,
        strokes: stroke,
        isReisuu: false,
        isDefault: stroke === 0,
      })
    })

    // 名の文字詳細
    Array.from(firstName).forEach((char, i) => {
      const context = { fullText: firstName, position: i }
      const stroke = this.getCharStroke(char, context)
      details.push({
        name: `名の${i + 1}文字目`,
        character: char,
        strokes: stroke,
        isReisuu: false,
        isDefault: stroke === 0,
      })
    })

    if (hasReisuuInFirstName) {
      details.push({
        name: "名の霊数",
        character: "一",
        strokes: 1,
        isReisuu: true,
        isDefault: false,
      })
    }

    return details
  }
}

// 外部から使用する関数（後方互換性のため）
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender: "male" | "female" = "male",
  customFortuneData?: Record<string, any>,
): any {
  return UnifiedNameAnalyzer.analyze(lastName, firstName, gender, customFortuneData)
}
