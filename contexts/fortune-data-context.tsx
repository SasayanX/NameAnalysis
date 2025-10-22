"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from "react"
import { customFortuneData, customFortuneExplanations, hasCustomData } from "@/lib/fortune-data-custom"

// FortuneDataの型定義
export type FortuneData = {
  運勢: string
  説明: string
}

// FortuneExplanationの型定義
export type FortuneExplanation = {
  title: string
  description: string
  characteristics: string[]
  advice: string
  examples: number[]
}

// 初期の基本吉凶データ（カスタムデータがない場合のフォールバック）
const initialFortuneData: Record<string, FortuneData> = {
  1: { 運勢: "大吉", 説明: "成功と繁栄の暗示。強い意志と指導力を持ち、目標達成に向けて邁進します。" },
  2: { 運勢: "凶", 説明: "不安定さと二面性を持ちます。協調性を意識し、バランスを保つことが重要です。" },
  3: { 運勢: "吉", 説明: "創造性と表現力に恵まれています。コミュニケーション能力が高く、人間関係が円滑です。" },
  4: { 運勢: "凶", 説明: "努力家ですが、困難に直面することがあります。忍耐強く取り組むことで道が開けます。" },
  5: { 運勢: "吉", 説明: "変化と適応力に優れています。好奇心旺盛で、多方面での活躍が期待できます。" },
  6: { 運勢: "大吉", 説明: "調和と安定をもたらします。家庭運に恵まれ、周囲との関係も良好です。" },
  7: { 運勢: "凶", 説明: "内省的で分析力に優れていますが、孤独を感じることも。精神面での充実を心がけましょう。" },
  8: { 運勢: "大吉", 説明: "物質的な成功と豊かさをもたらします。経済面での安定が期待できます。" },
  9: { 運勢: "吉", 説明: "博愛精神と奉仕の心を持ちます。広い視野で物事を捉え、社会貢献ができます。" },
  10: { 運勢: "中吉", 説明: "独立心と指導力があります。自分の道を切り開く力を持っていますが、協調も大切です。" },
  11: { 運勢: "凶", 説明: "直感力と霊感に優れていますが、精神的な緊張も。バランスを保つことが重要です。" },
  12: { 運勢: "吉", 説明: "実践的で堅実な性格です。地道な努力が実を結び、安定した人生が期待できます。" },
  13: { 運勢: "凶", 説明: "変化と挑戦の数です。困難に直面することもありますが、それを乗り越える力も持っています。" },
  14: { 運勢: "中吉", 説明: "自由を愛し、冒険心があります。経験を通じて成長し、充実した人生を送れます。" },
  15: { 運勢: "吉", 説明: "芸術的センスと表現力に恵まれています。人間関係も良好で、調和のとれた人生が期待できます。" },
  16: { 運勢: "大凶", 説明: "突然の変化や予期せぬ出来事に注意が必要です。柔軟な対応力を養いましょう。" },
  17: { 運勢: "中吉", 説明: "知性と分析力に優れています。深い洞察力で物事の本質を見抜くことができます。" },
  18: { 運勢: "大吉", 説明: "物質的な豊かさと成功をもたらします。リーダーシップを発揮し、周囲を導く力があります。" },
  19: {
    運勢: "凶",
    説明: "独立心が強く、自分の道を進みます。時に孤独を感じることもありますが、それが成長につながります。",
  },
  20: { 運勢: "中吉", 説明: "協調性と調和をもたらします。人間関係が円滑で、周囲からの信頼も厚いでしょう。" },
  21: { 運勢: "吉", 説明: "創造性と社交性に恵まれています。様々な場面で才能を発揮し、充実した人生を送れます。" },
  22: {
    運勢: "大吉",
    説明: "高い理想と実現力を持ちます。大きな目標に向かって着実に進み、成功を収めることができます。",
  },
  23: {
    運勢: "中吉",
    説明: "コミュニケーション能力が高く、人との繋がりを大切にします。社会的な活動で力を発揮します。",
  },
  24: {
    運勢: "凶",
    説明: "実務能力に優れていますが、時に孤独を感じることも。バランスを意識した生活を心がけましょう。",
  },
  25: { 運勢: "大吉", 説明: "知性と直感力のバランスが取れています。様々な状況に適応し、成功へと導かれます。" },
  26: { 運勢: "中吉", 説明: "家庭運に恵まれ、安定した人間関係を築けます。周囲への思いやりが幸せを招きます。" },
  27: {
    運勢: "吉",
    説明: "リーダーシップと奉仕の精神を持ちます。社会的な活動で力を発揮し、周囲に良い影響を与えます。",
  },
  28: { 運勢: "大吉", 説明: "経済的な成功と安定をもたらします。実務能力が高く、着実に目標を達成できます。" },
  29: { 運勢: "凶", 説明: "感受性が強く、芸術的な才能がありますが、感情の起伏に注意が必要です。" },
  30: { 運勢: "中吉", 説明: "創造性と表現力に恵まれています。自分の個性を活かした活動で成功が期待できます。" },
  31: { 運勢: "大吉", 説明: "統率力と実行力に優れています。組織のリーダーとして活躍できるでしょう。" },
  32: { 運勢: "大吉", 説明: "幸運に恵まれ、多くの人に支えられます。温厚な性格で信頼を得られます。" },
  33: { 運勢: "大吉", 説明: "才能と努力が実を結びます。社会的地位を築き、成功を収められるでしょう。" },
  34: { 運勢: "凶", 説明: "困難な状況に直面することがありますが、それを乗り越える強さも持っています。" },
  35: { 運勢: "吉", 説明: "温和で協調性があります。平和な環境で能力を発揮し、安定した人生を送れます。" },
  36: { 運勢: "凶", 説明: "波乱万丈な人生になりがちです。冷静な判断力を養い、安定を心がけましょう。" },
  37: { 運勢: "大吉", 説明: "独立心と実行力があります。自分の信念を貫き、大きな成功を収められるでしょう。" },
  38: { 運勢: "中吉", 説明: "芸術的才能に恵まれています。創作活動や表現の分野で力を発揮できます。" },
  39: { 運勢: "大吉", 説明: "知恵と勇気を兼ね備えています。困難を乗り越え、栄光を手にすることができます。" },
  40: { 運勢: "中吉", 説明: "慎重で計画性があります。着実に歩みを進め、安定した成果を得られるでしょう。" },
  41: { 運勢: "大吉", 説明: "徳望と実力を兼ね備えています。多くの人から尊敬され、大きな成功を収められます。" },
  42: { 運勢: "凶", 説明: "専門性は高いものの、応用力に欠ける面があります。柔軟性を身につけましょう。" },
  43: { 運勢: "凶", 説明: "散漫になりがちで、集中力を欠くことがあります。目標を明確にして取り組みましょう。" },
  44: { 運勢: "凶", 説明: "困難な状況に陥りやすいですが、忍耐強く取り組むことで道が開けます。" },
  45: { 運勢: "大吉", 説明: "順風満帆な人生を送れます。多くの人に愛され、幸福な生活を築けるでしょう。" },
  46: { 運勢: "凶", 説明: "努力が報われにくい面がありますが、諦めずに続けることで成果が得られます。" },
  47: { 運勢: "大吉", 説明: "花が咲くように美しい人生を送れます。才能が開花し、多方面で活躍できるでしょう。" },
  48: { 運勢: "大吉", 説明: "知恵と徳を兼ね備えています。指導者として多くの人を導くことができます。" },
  49: { 運勢: "凶", 説明: "変化の多い人生になりがちです。安定を求めず、変化を楽しむ心構えが大切です。" },
  50: { 運勢: "中吉", 説明: "浮き沈みの激しい人生ですが、最終的には安定した地位を築けるでしょう。" },
  51: { 運勢: "大吉", 説明: "一時的な困難はあっても、最終的には大きな成功を収められます。" },
  52: { 運勢: "大吉", 説明: "先見の明があり、将来を見通す力があります。計画的に行動し、成功を収められます。" },
  53: { 運勢: "中吉", 説明: "努力が実を結び、徐々に運勢が上昇します。継続的な取り組みが重要です。" },
  54: { 運勢: "凶", 説明: "困難な状況に直面することが多いですが、それが成長の糧となります。" },
  55: { 運勢: "中吉", 説明: "外見は華やかですが、内面の充実が重要です。バランスの取れた生活を心がけましょう。" },
  56: { 運勢: "凶", 説明: "旅路の多い人生になりがちです。安定よりも経験を重視する生き方が向いています。" },
  57: { 運勢: "大吉", 説明: "困難を乗り越える強い意志があります。最終的には大きな成功を収められるでしょう。" },
  58: { 運勢: "中吉", 説明: "晩年に運勢が開けます。若い頃の努力が後に大きな実を結ぶでしょう。" },
  59: { 運勢: "凶", 説明: "迷いが多く、方向性を見失いがちです。明確な目標を持つことが重要です。" },
  60: { 運勢: "凶", 説明: "暗雲が立ち込める時期がありますが、それを乗り越えれば光明が見えてきます。" },
  61: { 運勢: "大吉", 説明: "名声と実利を兼ね備えています。社会的に高い地位を築くことができるでしょう。" },
  62: { 運勢: "凶", 説明: "基盤が不安定になりがちです。しっかりとした土台作りを心がけましょう。" },
  63: { 運勢: "大吉", 説明: "富と名誉に恵まれます。家族や周囲の人々と共に繁栄を築けるでしょう。" },
  64: { 運勢: "凶", 説明: "破綻しやすい傾向があります。慎重な行動と計画性が必要です。" },
  65: { 運勢: "大吉", 説明: "富貴栄華を極めます。物質的にも精神的にも豊かな人生を送れるでしょう。" },
  66: { 運勢: "凶", 説明: "内外の困難に直面しがちです。冷静な判断力と忍耐力が求められます。" },
  67: { 運勢: "大吉", 説明: "智恵と勇気で道を切り開きます。多くの人に影響を与える存在になれるでしょう。" },
  68: { 運勢: "大吉", 説明: "発明や創造の才能があります。新しいことを生み出す力で成功を収められます。" },
  69: { 運勢: "凶", 説明: "不安定な状況が続きがちです。心の平静を保ち、着実に歩みを進めましょう。" },
  70: { 運勢: "凶", 説明: "寂しさを感じることが多いかもしれません。人とのつながりを大切にしましょう。" },
  71: { 運勢: "中吉", 説明: "努力が徐々に実を結びます。継続的な取り組みで成果を得られるでしょう。" },
  72: { 運勢: "凶", 説明: "労多くして功少なしの傾向があります。効率的な方法を見つけることが大切です。" },
  73: { 運勢: "大吉", 説明: "平和で安定した人生を送れます。家庭運にも恵まれ、幸福な生活を築けるでしょう。" },
  74: { 運勢: "凶", 説明: "逆境に立たされることがありますが、それを乗り越える力も持っています。" },
  75: { 運勢: "中吉", 説明: "晩成型の運勢です。年を重ねるごとに運勢が向上していくでしょう。" },
  76: { 運勢: "凶", 説明: "倒れやすい傾向がありますが、立ち直る力も強く持っています。" },
  77: { 運勢: "中吉", 説明: "家族運に恵まれます。身内の支えを受けて安定した人生を送れるでしょう。" },
  78: { 運勢: "中吉", 説明: "晩年に向けて運勢が安定します。経験を活かした活動で成果を得られます。" },
  79: { 運勢: "凶", 説明: "精神的な迷いが多くなりがちです。信念を持って行動することが重要です。" },
  80: { 運勢: "凶", 説明: "虚無感を感じることがあるかもしれません。生きがいを見つけることが大切です。" },
  81: { 運勢: "大吉", 説明: "最高の運勢です。全てが好転し、理想的な人生を送ることができるでしょう。" },
}

const initialFortuneExplanations: Record<string, FortuneExplanation> = {
  大吉: {
    title: "大吉",
    description: "最高の運勢です。何事も順調に進み、大きな成功を収めることができます。",
    characteristics: ["強い意志力", "優れた指導力", "成功への道筋", "周囲からの信頼", "物質的豊かさ"],
    advice:
      "積極的に行動し、リーダーシップを発揮しましょう。この運勢を活かして大きな目標に挑戦することをお勧めします。",
    examples: [1, 6, 8, 18, 22, 25, 28, 31, 32, 33, 37, 39, 41, 45, 47, 48, 51, 52, 57, 61, 63, 65, 67, 68, 73, 81],
  },
  吉: {
    title: "吉",
    description: "良好な運勢です。努力が報われ、安定した成果を得ることができます。",
    characteristics: ["創造性", "表現力", "協調性", "安定性", "成長力"],
    advice: "持続的な努力を続け、周囲との調和を大切にしましょう。着実に歩みを進めることで成功に近づけます。",
    examples: [3, 5, 9, 12, 15, 21, 27, 35],
  },
  中吉: {
    title: "中吉",
    description: "中程度の良い運勢です。バランスの取れた人生を送ることができます。",
    characteristics: ["バランス感覚", "適応力", "協調性", "安定志向", "継続力"],
    advice: "現状を維持しながら、少しずつ改善を図りましょう。急激な変化よりも着実な成長を心がけることが大切です。",
    examples: [10, 14, 17, 20, 23, 26, 30, 38, 40, 50, 53, 55, 58, 71, 75, 77, 78],
  },
  凶: {
    title: "凶",
    description: "困難な運勢ですが、それを乗り越えることで成長できます。",
    characteristics: ["試練", "困難", "忍耐力", "成長の機会", "内面の強化"],
    advice: "困難に立ち向かう勇気を持ち、忍耐強く取り組みましょう。この時期の経験が将来の糧となります。",
    examples: [
      2, 4, 7, 11, 13, 19, 24, 29, 34, 36, 42, 43, 44, 46, 49, 54, 56, 59, 60, 62, 64, 66, 69, 70, 72, 74, 76, 79, 80,
    ],
  },
  大凶: {
    title: "大凶",
    description: "最も困難な運勢ですが、それを乗り越えれば大きな成長が期待できます。",
    characteristics: ["大きな試練", "予期せぬ変化", "忍耐力の試練", "精神的成長", "転換点"],
    advice:
      "この困難な時期を乗り越えるために、冷静さを保ち、周囲のサポートを求めることも大切です。必ず光明が見えてきます。",
    examples: [16],
  },
  中凶: {
    title: "中凶",
    description: "中程度の困難な運勢ですが、適切な対処で改善できます。",
    characteristics: ["中程度の困難", "改善の余地", "学習の機会", "忍耐力", "適応力"],
    advice: "現状を冷静に分析し、改善点を見つけて取り組みましょう。小さな変化から始めることが重要です。",
    examples: [],
  },
}

interface FortuneDataContextType {
  fortuneData: Record<string, FortuneData>
  setFortuneData: React.Dispatch<React.SetStateAction<Record<string, FortuneData>>>
  fortuneExplanations: Record<string, FortuneExplanation>
  setFortuneExplanations: React.Dispatch<React.SetStateAction<Record<string, FortuneExplanation>>>
  saveChanges: () => boolean
  resetToOriginal: () => void
  defaultFortuneData: Record<string, FortuneData>
  isDataLoaded: boolean
  updateToFile: (
    newData: Record<string, FortuneData>,
    newExplanations: Record<string, FortuneExplanation>,
  ) => Promise<boolean>
}

const FortuneDataContext = createContext<FortuneDataContextType | undefined>(undefined)

const FORTUNE_DATA_KEY = "fortuneData"
const FORTUNE_EXPLANATIONS_KEY = "fortuneExplanations"

export function FortuneDataProvider({ children }: { children: ReactNode }) {
  // カスタムデータがある場合はそれを使用、なければ初期データを使用
  const [fortuneData, setFortuneData] = useState<Record<string, FortuneData>>(
    hasCustomData() ? customFortuneData : initialFortuneData,
  )
  const [fortuneExplanations, setFortuneExplanations] = useState<Record<string, FortuneExplanation>>(
    hasCustomData() ? customFortuneExplanations : initialFortuneExplanations,
  )
  const [defaultFortuneData, setDefaultFortuneData] = useState<Record<string, FortuneData>>(
    hasCustomData() ? customFortuneData : initialFortuneData,
  )
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // 初期データの読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("FortuneDataProvider: 初期データ読み込み開始")

        // カスタムデータがある場合はそれを優先
        if (hasCustomData()) {
          console.log(`FortuneDataProvider: カスタムデータを使用します (${Object.keys(customFortuneData).length}件)`)
          setFortuneData(customFortuneData)
          setFortuneExplanations(customFortuneExplanations)
          setDefaultFortuneData(customFortuneData)
        } else {
          console.log("FortuneDataProvider: 初期データを使用します")
          // localStorageからの読み込みも試行
          const savedFortuneData = localStorage.getItem(FORTUNE_DATA_KEY)
          if (savedFortuneData) {
            try {
              const parsedData = JSON.parse(savedFortuneData)
              if (parsedData && typeof parsedData === "object" && Object.keys(parsedData).length > 0) {
                console.log(
                  `FortuneDataProvider: localStorageからデータを読み込みました (${Object.keys(parsedData).length}件)`,
                )
                setFortuneData(parsedData)
              }
            } catch (e) {
              console.error("FortuneDataProvider: localStorageデータの解析に失敗しました", e)
            }
          }

          const savedFortuneExplanations = localStorage.getItem(FORTUNE_EXPLANATIONS_KEY)
          if (savedFortuneExplanations) {
            try {
              const parsedExplanations = JSON.parse(savedFortuneExplanations)
              if (
                parsedExplanations &&
                typeof parsedExplanations === "object" &&
                Object.keys(parsedExplanations).length > 0
              ) {
                setFortuneExplanations(parsedExplanations)
              }
            } catch (e) {
              console.error("FortuneDataProvider: localStorage説明データの解析に失敗しました", e)
            }
          }
        }
      } catch (e) {
        console.error("FortuneDataProvider: データ読み込み中にエラーが発生しました", e)
      } finally {
        setIsDataLoaded(true)
        console.log("FortuneDataProvider: データ読み込み完了")
      }
    }
  }, [])

  // データが変更されたときに自動的に保存（localStorageのみ）
  useEffect(() => {
    if (isDataLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(FORTUNE_DATA_KEY, JSON.stringify(fortuneData))
        console.log(
          `FortuneDataProvider: 吉凶データをlocalStorageに保存しました (${Object.keys(fortuneData).length}件)`,
        )
      } catch (e) {
        console.error("FortuneDataProvider: 吉凶データの自動保存に失敗しました", e)
      }
    }
  }, [fortuneData, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(FORTUNE_EXPLANATIONS_KEY, JSON.stringify(fortuneExplanations))
        console.log(
          `FortuneDataProvider: 説明データをlocalStorageに保存しました (${Object.keys(fortuneExplanations).length}件)`,
        )
      } catch (e) {
        console.error("FortuneDataProvider: 説明データの自動保存に失敗しました", e)
      }
    }
  }, [fortuneExplanations, isDataLoaded])

  // 手動保存（localStorageのみ）
  const saveChanges = useCallback(() => {
    try {
      if (!fortuneData || typeof fortuneData !== "object" || Object.keys(fortuneData).length === 0) {
        console.error("FortuneDataProvider: 保存しようとしているデータが無効です")
        return false
      }

      if (
        !fortuneExplanations ||
        typeof fortuneExplanations !== "object" ||
        Object.keys(fortuneExplanations).length === 0
      ) {
        console.error("FortuneDataProvider: 保存しようとしている説明データが無効です")
        return false
      }

      localStorage.setItem(FORTUNE_DATA_KEY, JSON.stringify(fortuneData))
      localStorage.setItem(FORTUNE_EXPLANATIONS_KEY, JSON.stringify(fortuneExplanations))

      console.log("FortuneDataProvider: データをlocalStorageに手動保存しました")
      return true
    } catch (e) {
      console.error("FortuneDataProvider: データの手動保存に失敗しました", e)
      return false
    }
  }, [fortuneData, fortuneExplanations])

  // ファイルに保存（デプロイ後も永続化）
  const updateToFile = useCallback(
    async (newData: Record<string, FortuneData>, newExplanations: Record<string, FortuneExplanation>) => {
      try {
        console.log("FortuneDataProvider: ファイルにデータを保存します")

        const response = await fetch("/api/update-fortune-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fortuneData: newData,
            fortuneExplanations: newExplanations,
          }),
        })

        const result = await response.json()

        if (result.success) {
          console.log("FortuneDataProvider: ファイルへの保存が成功しました")
          // 現在のデータも更新
          setFortuneData(newData)
          setFortuneExplanations(newExplanations)
          setDefaultFortuneData(newData)

          // localStorageにも保存
          localStorage.setItem(FORTUNE_DATA_KEY, JSON.stringify(newData))
          localStorage.setItem(FORTUNE_EXPLANATIONS_KEY, JSON.stringify(newExplanations))

          return true
        } else {
          console.error("FortuneDataProvider: ファイルへの保存に失敗しました", result.error)
          return false
        }
      } catch (e) {
        console.error("FortuneDataProvider: ファイル保存中にエラーが発生しました", e)
        return false
      }
    },
    [],
  )

  // リセット（基本データに戻す）
  const resetToOriginal = useCallback(() => {
    const baseData = hasCustomData() ? customFortuneData : initialFortuneData
    const baseExplanations = hasCustomData() ? customFortuneExplanations : initialFortuneExplanations

    setFortuneData(baseData)
    setFortuneExplanations(baseExplanations)
    try {
      localStorage.setItem(FORTUNE_DATA_KEY, JSON.stringify(baseData))
      localStorage.setItem(FORTUNE_EXPLANATIONS_KEY, JSON.stringify(baseExplanations))
      console.log("FortuneDataProvider: データを基本データにリセットしました")
    } catch (e) {
      console.error("FortuneDataProvider: データのリセット中にエラーが発生しました", e)
    }
  }, [])

  return (
    <FortuneDataContext.Provider
      value={{
        fortuneData,
        setFortuneData,
        fortuneExplanations,
        setFortuneExplanations,
        saveChanges,
        resetToOriginal,
        defaultFortuneData,
        isDataLoaded,
        updateToFile,
      }}
    >
      {children}
    </FortuneDataContext.Provider>
  )
}

export function useFortuneData() {
  const context = useContext(FortuneDataContext)
  if (context === undefined) {
    throw new Error("useFortuneData must be used within a FortuneDataProvider")
  }
  return context
}

// 互換性のためのエ���スポート
export { initialFortuneData as defaultFortuneData }
