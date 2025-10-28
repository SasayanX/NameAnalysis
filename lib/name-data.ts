// 統合版: lib/name-data-simple.tsのエイリアス
export { strokeCountData, getCharStroke, getCharStrokeWithContext } from "./name-data-simple"

// First, import the necessary functions from kanji-conversion
import { convertToOldKanji, isNewKanji } from "./kanji-conversion"
import { useStrokeData } from "@/contexts/stroke-data-context"

// レガシー互換性のためのデータ（非推奨）
const legacyStrokeCountData: Record<string, number> = {
  // 常用漢字（一部）
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  百: 6,
  千: 3,
  万: 3,
  円: 4,
  王: 4,
  玉: 5,
  木: 4,
  林: 8,
  森: 12,
  火: 4,
  水: 4,
  川: 3,
  山: 3,
  田: 5,
  土: 3,
  人: 2,
  口: 3,
  日: 4,
  月: 4,
  年: 6,
  大: 3,
  中: 4,
  小: 3,
  上: 3,
  下: 3,
  左: 5,
  右: 5,
  東: 8,
  西: 6,
  南: 9,
  北: 5,
  高: 10,
  安: 6,
  足: 7,
  手: 4,
  目: 5,
  耳: 6,
  心: 4,
  思: 9,
  愛: 13,
  美: 9,
  信: 9,
  明: 8,
  光: 6,
  音: 9,
  力: 2,
  男: 7,
  女: 3,
  子: 3,
  父: 4,
  母: 5,
  家: 10,
  学: 8,
  校: 10,
  先: 6,
  生: 5,
  会: 6,
  社: 7,
  国: 8,
  金: 8,
  銀: 14,
  本: 5,
  文: 4,
  字: 6,
  言: 7,
  話: 13,
  語: 14,
  名: 6,
  前: 9,
  後: 9,
  間: 12,
  時: 10,
  分: 4,
  秒: 9,
  今: 4,
  新: 13,
  古: 5,
  来: 7,
  行: 6,
  道: 12,
  通: 10,
  駅: 14,
  車: 7,
  電: 13,
  気: 6,
  食: 9,
  飲: 12,
  料: 10,
  理: 11,
  科: 9,
  数: 13,
  英: 8,
  歌: 14,
  楽: 15,
  花: 7,
  草: 9,
  海: 9,
  空: 8,
  雨: 8,
  雪: 11,
  風: 9,
  星: 9,
  太: 4,
  陽: 12,
  地: 6,
  球: 11,
  世: 5,
  界: 9,
  市: 5,
  町: 7,
  村: 7,
  区: 4,
  都: 11,
  府: 8,
  県: 9,
  島: 10,
  谷: 7,
  野: 11,
  原: 10,
  池: 6,
  湖: 12,

  // 人名によく使われる漢字（一部）
  佐: 7,
  藤: 18,
  鈴: 13,
  伊: 6,
  渡: 12,
  辺: 11,
  加: 5,
  松: 8,
  井: 7,
  々: 2,
  清: 11,
  橋: 16,
  岡: 8,
  長: 8,
  坂: 7,
  阿: 8,
  部: 11,
  遠: 13,
  青: 8,
  柳: 9,
  石: 5,
  吉: 6,
  宮: 10,
  崎: 11,
  正: 5,
  杉: 7,
  浦: 10,
  竹: 6,
  内: 4,
  菊: 11,
  河: 8,
  武: 8,
  角: 7,
  和: 8,
  平: 5,
  太: 4,
  三: 3,
  宅: 6,
  岩: 8,
  工: 3,
  岸: 8,
  斎: 11,

  // 平仮名
  あ: 3,
  い: 2,
  う: 2,
  え: 2,
  お: 3,
  か: 3,
  き: 3,
  く: 2,
  け: 3,
  こ: 2,
  さ: 3,
  し: 2,
  す: 2,
  せ: 3,
  そ: 2,
  た: 3,
  ち: 2,
  つ: 3,
  て: 3,
  と: 2,
  な: 3,
  に: 3,
  ぬ: 3,
  ね: 3,
  の: 2,
  は: 3,
  ひ: 3,
  ふ: 3,
  へ: 2,
  ほ: 4,
  ま: 3,
  み: 3,
  む: 3,
  め: 3,
  も: 3,
  や: 3,
  ゆ: 3,
  よ: 3,
  ら: 2,
  り: 2,
  る: 3,
  れ: 3,
  ろ: 3,
  わ: 3,
  を: 3,
  ん: 2,

  // カタカナ
  ア: 2,
  イ: 2,
  ウ: 2,
  エ: 2,
  オ: 3,
  カ: 2,
  キ: 3,
  ク: 2,
  ケ: 3,
  コ: 2,
  サ: 3,
  シ: 3,
  ス: 2,
  セ: 3,
  ソ: 2,
  タ: 3,
  チ: 3,
  ツ: 3,
  テ: 3,
  ト: 2,
  ナ: 3,
  ニ: 3,
  ヌ: 3,
  ネ: 3,
  ノ: 2,
  ハ: 2,
  ヒ: 3,
  フ: 3,
  ヘ: 2,
  ホ: 4,
  マ: 3,
  ミ: 3,
  ム: 3,
  メ: 3,
  モ: 3,
  ヤ: 3,
  ユ: 3,
  ヨ: 3,
  ラ: 2,
  リ: 2,
  ル: 3,
  レ: 3,
  ロ: 3,
  ワ: 2,
  ヲ: 3,
  ン: 2,

  // 旧字体（新字体との画数の差が大きいもの）
  國: 11, // 国: 8
  廣: 15, // 広: 5
  齊: 16, // 斉: 8
  濱: 17, // 浜: 11
  德: 15, // 徳: 14
  藝: 19, // 芸: 7
  關: 19, // 関: 14
  榮: 14, // 栄: 9
  澤: 16, // 沢: 8
  齋: 17, // 斎: 11
  櫻: 19, // 桜: 10
  龍: 16, // 竜: 10
  壽: 14, // 寿: 7
  曾: 11, // 曽: 11
  萬: 12, // 万: 3
  黑: 14, // 黒: 11
  寶: 20, // 宝: 8
  舊: 18, // 旧: 5
  眞: 10, // 真: 10
  緣: 14, // 縁: 15
  螢: 16, // 蛍: 11
  藥: 19, // 薬: 16
  讀: 19, // 読: 14
  歸: 14, // 帰: 10
  繪: 19, // 絵: 12
  緖: 15, // 緒: 14
  總: 14, // 総: 11
  聽: 17, // 聴: 17
  處: 11, // 処: 5
  步: 8, // 歩: 8
  證: 23, // 証: 12
  晝: 11, // 昼: 9
  疊: 22, // 畳: 12
  圓: 13, // 円: 4
  淨: 11, // 浄: 9
  營: 17, // 営: 12
  爭: 8, // 争: 8
  爲: 12, // 為: 9
  犧: 17, // 犠: 12
  獸: 19, // 獣: 11
  產: 14, // 産: 11
  畫: 12, // 画: 8
  當: 13, // 当: 6
  發: 12, // 発: 9
  眾: 11, // 衆: 12
  縣: 16, // 県: 9
  與: 14, // 与: 3
  舍: 8, // 舎: 8
  藏: 18, // 蔵: 15
  蟲: 19, // 虫: 6
  賣: 14, // 売: 7
  轉: 17, // 転: 11
  辭: 16, // 辞: 13
  遞: 14, // 逓: 10
  醫: 18, // 医: 7
  釋: 16, // 釈: 11
  鐵: 20, // 鉄: 13
  鑄: 22, // 鋳: 15
  閱: 15, // 閲: 15
  靜: 16, // 静: 14
  顯: 18, // 顕: 13
  飮: 12, // 飲: 12
  驛: 23, // 駅: 14
  驗: 23, // 験: 18
  髮: 16, // 髪: 14
  鷄: 19, // 鶏: 19
  辨: 16, // 弁: 5
  邊: 17, // 辺: 11
  學: 16, // 学: 8
  體: 23, // 体: 7
  點: 17, // 点: 9
  變: 23, // 変: 9
  觀: 23, // 観: 16
  齒: 15, // 歯: 12
  兒: 8, // 児: 7
  强: 11, // 強: 11
  戶: 4, // 戸: 4
  拔: 8, // 抜: 8
  插: 12, // 挿: 10
  晚: 11, // 晩: 11
  條: 11, // 条: 7
  棧: 12, // 桟: 10
  殘: 10, // 残: 10
  淚: 11, // 涙: 10
  溫: 12, // 温: 12
  狀: 8, // 状: 7
  畑: 9, // 畑: 9
  疎: 12, // 疎: 12
  眠: 10, // 眠: 10
  礦: 17, // 鉱: 13
  祕: 10, // 秘: 10
  禮: 18, // 礼: 5
  稻: 15, // 稲: 13
  穗: 14, // 穂: 14
  粹: 14, // 粋: 14
  絲: 13, // 糸: 6
  綠: 14, // 緑: 14
  臺: 14, // 台: 5
  莊: 11, // 荘: 9
  著: 13, // 著: 13
  蔣: 14, // 蒋: 13
  蘆: 19, // 芦: 7
  蠟: 21, // 蝋: 14
  衞: 16, // 衛: 16
  裝: 14, // 装: 12
  覽: 20, // 覧: 17
  謠: 17, // 謡: 17
  讓: 20, // 譲: 20
  賴: 15, // 頼: 16
  贊: 17, // 賛: 13
  踐: 15, // 践: 13
  輕: 15, // 軽: 12
  辯: 20, // 弁: 5
  逸: 12, // 逸: 12
  遙: 14, // 遥: 12
  郞: 10, // 郎: 10
  鄕: 13, // 郷: 11
  醬: 17, // 醤: 17
  錄: 16, // 録: 16
  鍊: 17, // 錬: 16
  陷: 11, // 陥: 10
  隨: 16, // 随: 12
  雜: 14, // 雑: 14
  靈: 17, // 霊: 15
  響: 20, // 響: 20
  頰: 17, // 頬: 14
  顏: 18, // 顔: 13
  飜: 18, // 翻: 15
  餘: 16, // 余: 7
  麥: 11, // 麦: 7
  黃: 12, // 黄: 11
  默: 16, // 黙: 15
}

// 画数による吉凶データ
export const fortuneData: Record<number, any> = {
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
}

// 文字の画数を取得する関数
// function getCharStroke(char: string): number {
//   // 旧字体の場合は旧字体の画数を返す
//   if (isOldKanji(char) && oldKanjiStrokeData[char]) {
//     return oldKanjiStrokeData[char]
//   }

//   // 新字体の場合は新字体の画数を返す
//   if (strokeCountData[char]) {
//     return strokeCountData[char]
//   }

//   // 未登録の文字の場合のデフォルト値
//   if (/[a-zA-Z]/.test(char)) {
//     return 1 // 英字
//   } else if (/[ぁ-んァ-ン]/.test(char)) {
//     return 2 // ひらがな・カタカナ
//   } else {
//     return 5 // その他（漢字など）
//   }
// }

// 文字の画数を取得する関数（クライアントコンポーネント用）
export function useGetCharStroke() {
  const { strokeData } = useStrokeData()

  return function getCharStroke(char: string): number {
    // コンテキストから画数データを取得
    if (strokeData[char]) {
      return strokeData[char]
    }

    // 未登録の文字の場合のデフォルト値
    if (/[a-zA-Z]/.test(char)) {
      return 1 // 英字
    } else if (/[ぁ-んァ-ン]/.test(char)) {
      return 2 // ひらがな・カタカナ
    } else {
      return 5 // その他（漢字など）
    }
  }
}

// サーバーコンポーネント用の関数（ローカルストレージから直接読み込む）
export function getCharStrokeServer(char: string): number {
  let strokeData: Record<string, number> = {}

  // ブラウザ環境でのみ実行
  if (typeof window !== "undefined") {
    const savedData = localStorage.getItem("strokeData")
    if (savedData) {
      try {
        strokeData = JSON.parse(savedData)
      } catch (e) {
        console.error("Failed to parse saved stroke data:", e)
      }
    }
  }

  if (strokeData[char]) {
    return strokeData[char]
  }

  // 未登録の文字の場合のデフォルト値
  if (/[a-zA-Z]/.test(char)) {
    return 1 // 英字
  } else if (/[ぁ-んァ-ン]/.test(char)) {
    return 2 // ひらがな・カタカナ
  } else {
    return 5 // その他（漢字など）
  }
}

// 名前の画数を計算する関数
export function calculateNameStrokes(name: string): number {
  let total = 0

  for (const char of name) {
    // total += getCharStroke(char)
    total += getCharStrokeServer(char)
  }

  return total
}

// 運勢を取得する関数
function getFortune(strokeCount: number): any {
  // strokeCountをキーとしてfortuneDataから運勢情報を取得
  const fortune = fortuneData[strokeCount] || { 運勢: "不明", 説明: "情報がありません" }
  return fortune
}

// スコアを計算する関数
function calculateScore(fortune: any): number {
  // 運勢に基づいてスコアを計算
  switch (fortune["運勢"]) {
    case "大吉":
      return 100
    case "吉":
      return 80
    case "中吉":
      return 60
    case "凶":
      return 40
    case "大凶":
      return 20
    default:
      return 50 // 不明な場合は中間的なスコア
  }
}

// アドバイスを生成する関数
function generateAdvice(tenFortune: any, jinFortune: any, chiFortune: any, gaiFortune: any, totalFortune: any): string {
  let advice = ""

  // 各運勢からアドバイスを生成
  if (tenFortune["運勢"] === "凶" || tenFortune["運勢"] === "大凶") {
    advice += "社会的な成功のためには、周囲との協調を心がけましょう。 "
  }
  if (jinFortune["運勢"] === "凶" || jinFortune["運勢"] === "大凶") {
    advice += "内面的な成長のために、自己分析を深め、精神的なバランスを取りましょう。 "
  }
  if (chiFortune["運勢"] === "凶" || chiFortune["運勢"] === "大凶") {
    advice += "家庭環境を大切にし、家族とのコミュニケーションを密にしましょう。 "
  }
  if (gaiFortune["運勢"] === "凶" || gaiFortune["運勢"] === "大凶") {
    advice += "対人関係においては、相手の立場を理解し、思いやりを持って接することが大切です。 "
  }
  if (totalFortune["運勢"] === "凶" || totalFortune["運勢"] === "大凶") {
    advice += "人生全体を通して、困難に立ち向かう勇気と、変化に対応する柔軟性を持ちましょう。 "
  }

  if (advice === "") {
    advice = "全体的に良好な運勢です。この調子で積極的に行動しましょう。"
  }

  return advice
}

// analyzeNameFortune関数
export function analyzeNameFortune(lastName: string, firstName: string): any {
  // 空白を削除
  lastName = lastName.trim()
  firstName = firstName.trim()

  // 新字体が含まれているかチェック
  const hasNewKanji = [...lastName, ...firstName].some((char) => isNewKanji(char))

  // 旧字体に変換した名前
  const oldLastName = convertToOldKanji(lastName)
  const oldFirstName = convertToOldKanji(firstName)

  // 変換前と変換後で違いがあるかチェック
  const hasChanged = oldLastName !== lastName || oldFirstName !== firstName

  // 姓と名の画数を計算（旧字体優先）
  const lastNameCount = calculateNameStrokes(oldLastName)
  const firstNameCount = calculateNameStrokes(oldFirstName)

  // 霊数の判定
  const hasReisuuInLastName = oldLastName.length === 1
  const hasReisuuInFirstName = oldFirstName.length === 1

  // 各格の計算（霊数ルール適用）
  const tenFormat = hasReisuuInLastName ? lastNameCount + 1 : lastNameCount // 天格 = 姓の画数の合計（霊数含む）
  const chiFormat = hasReisuuInFirstName ? firstNameCount + 1 : firstNameCount // 地格 = 名の画数の合計（霊数含む）
  const totalFormat = lastNameCount + firstNameCount // 総格 = 全ての画数の合計（霊数除外）

  // 人格 = 姓の最後の文字と名の最初の文字の画数の合計
  const lastCharOfLastName = oldLastName.charAt(oldLastName.length - 1)
  const firstCharOfFirstName = oldFirstName.charAt(0)
  // const jinFormat = getCharStroke(lastCharOfLastName) + getCharStroke(firstCharOfFirstName)
  const jinFormat = getCharStrokeServer(lastCharOfLastName) + getCharStrokeServer(firstCharOfFirstName)

  // 外格の計算（霊数ルール適用）
  let gaiFormat: number
  if (hasReisuuInLastName && hasReisuuInFirstName) {
    // 両方とも一字の場合：外格 = 霊数 + 霊数 = 2画
    gaiFormat = 2
  } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
    // 一字姓・複数字名の場合：外格 = 霊数 + 名の最後の文字
    const lastCharOfFirstName = oldFirstName.charAt(oldFirstName.length - 1)
    gaiFormat = 1 + getCharStrokeServer(lastCharOfFirstName)
  } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
    // 複数字姓・一字名の場合：外格 = 姓の最初の文字 + 霊数
    const firstCharOfLastName = oldLastName.charAt(0)
    gaiFormat = getCharStrokeServer(firstCharOfLastName) + 1
  } else {
    // 通常の場合（複数字姓・複数字名）：外格 = 天格 + 地格 - 人格
    gaiFormat = tenFormat + chiFormat - jinFormat
  }

  // 各格の吉凶を取得
  const tenFortune = getFortune(tenFormat)
  const jinFortune = getFortune(jinFormat)
  const chiFortune = getFortune(chiFormat)
  const gaiFortune = getFortune(gaiFormat)
  const totalFortune = getFortune(totalFormat)

  // スコアの計算
  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  // 総合スコアの計算（人格と総格を重視）
  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

  // 結果を返す
  return {
    totalScore: overallScore,
    categories: [
      {
        name: "天格",
        score: tenScore,
        description: "社会的な成功や対外的な印象を表します",
        fortune: tenFortune["運勢"] || "不明",
        explanation: tenFortune["説明"] || "",
      },
      {
        name: "人格",
        score: jinScore,
        description: "性格や才能、人生の中心的な運勢を表します",
        fortune: jinFortune["運勢"] || "不明",
        explanation: jinFortune["説明"] || "",
      },
      {
        name: "地格",
        score: chiScore,
        description: "家庭環境や若年期の運勢を表します",
        fortune: chiFortune["運勢"] || "不明",
        explanation: chiFortune["説明"] || "",
      },
      {
        name: "外格",
        score: gaiScore,
        description: "対人関係や社会との関わり方を表します",
        fortune: gaiFortune["運勢"] || "不明",
        explanation: gaiFortune["説明"] || "",
      },
      {
        name: "総格",
        score: totalScore,
        description: "人生全体の運勢を総合的に表します",
        fortune: totalFortune["運勢"] || "不明",
        explanation: totalFortune["説明"] || "",
      },
    ],
    details: [
      { name: "姓の画数", value: `${lastNameCount}画` },
      { name: "名の画数", value: `${firstNameCount}画` },
      { name: "天格", value: `${tenFormat}画` },
      { name: "人格", value: `${jinFormat}画` },
      { name: "地格", value: `${chiFormat}画` },
      { name: "外格", value: `${gaiFormat}画` },
      { name: "総格", value: `${totalFormat}画` },
    ],
    advice: generateAdvice(tenFortune, jinFortune, chiFortune, gaiFortune, totalFortune),
    characterDetails: [
      { name: "姓の最初の文字", character: oldLastName.charAt(0), strokes: getCharStrokeServer(oldLastName.charAt(0)) },
      { name: "姓の最後の文字", character: lastCharOfLastName, strokes: getCharStrokeServer(lastCharOfLastName) },
      { name: "名の最初の文字", character: firstCharOfFirstName, strokes: getCharStrokeServer(firstCharOfFirstName) },
      {
        name: "名の最後の文字",
        character: oldFirstName.charAt(oldFirstName.length - 1),
        strokes: getCharStrokeServer(oldFirstName.charAt(oldFirstName.length - 1)),
      },
    ],
    kanjiInfo: {
      hasNewKanji,
      hasChanged,
      oldLastName: hasChanged ? oldLastName : null,
      oldFirstName: hasChanged ? oldFirstName : null,
    },
  }
}
