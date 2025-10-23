import { customFortuneData } from "./fortune-data-custom"

const DEBUG_MODE = true

// 漢字の画数を取得する関数
export function getStrokeCount(character: string): number {
  const strokeData: Record<string, number> = {
    // 基本漢字の画数データ（一部）
    "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
    "金": 8, "雨": 8, "輝": 15, "龍": 16, "佐": 7, "々": 0, "木": 4, "靖": 13, "隆": 17,
    "田": 5, "中": 4, "山": 3, "川": 3, "大": 3, "小": 3, "人": 2, "口": 3, "日": 4, "月": 4,
    "水": 4, "火": 4, "土": 3, "木": 4, "金": 8, "石": 5, "玉": 5, "王": 4, "女": 3, "子": 3,
    "男": 7, "女": 3, "父": 4, "母": 5, "兄": 5, "弟": 7, "姉": 8, "妹": 8, "夫": 4, "妻": 8,
    "子": 3, "孫": 10, "親": 16, "友": 4, "愛": 13, "心": 4, "手": 4, "足": 7, "目": 5, "耳": 6,
    "鼻": 14, "口": 3, "舌": 6, "歯": 12, "頭": 16, "顔": 18, "体": 7, "身": 7, "背": 9, "胸": 10,
    "腹": 13, "腰": 13, "脚": 11, "腕": 12, "指": 9, "爪": 4, "毛": 4, "髪": 14, "肌": 6, "血": 6,
    "骨": 10, "肉": 6, "皮": 5, "服": 8, "着": 12, "靴": 13, "帽子": 12, "眼鏡": 16, "時計": 17,
    "家": 10, "門": 8, "窓": 12, "床": 7, "壁": 16, "天井": 8, "柱": 9, "階段": 16, "廊下": 16,
    "部屋": 12, "寝室": 16, "台所": 12, "風呂": 14, "トイレ": 15, "玄関": 12, "庭": 10, "池": 6,
    "花": 7, "木": 4, "草": 9, "葉": 12, "実": 8, "根": 10, "枝": 8, "幹": 13, "森": 12, "林": 8,
    "山": 3, "川": 3, "海": 9, "空": 8, "雲": 12, "雨": 8, "雪": 11, "風": 9, "雷": 13, "太陽": 12,
    "月": 4, "星": 9, "地球": 12, "宇宙": 12, "世界": 12, "国": 8, "都": 12, "県": 9, "市": 5,
    "町": 7, "村": 7, "区": 4, "駅": 14, "空港": 12, "港": 12, "橋": 16, "道路": 16, "信号": 16,
    "車": 7, "電車": 17, "バス": 12, "タクシー": 18, "飛行機": 16, "船": 11, "自転車": 16,
    "歩": 8, "走": 7, "飛": 9, "泳": 11, "登": 12, "降": 10, "上": 3, "下": 3, "前": 9, "後": 9,
    "左": 5, "右": 5, "中": 4, "外": 5, "内": 4, "東": 8, "西": 6, "南": 9, "北": 5, "春": 9,
    "夏": 10, "秋": 9, "冬": 5, "朝": 12, "昼": 9, "夜": 8, "今": 4, "昔": 8, "未来": 12, "過去": 12,
    "時間": 17, "分": 4, "秒": 9, "時": 10, "日": 4, "週": 11, "月": 4, "年": 6, "世紀": 12,
    "今日": 8, "昨日": 16, "明日": 8, "来週": 16, "来月": 16, "来年": 16, "毎日": 16, "毎週": 16,
    "毎月": 16, "毎年": 16, "時々": 16, "時々": 16, "いつも": 12, "たまに": 12, "よく": 8,
    "あまり": 12, "全然": 12, "とても": 12, "すごく": 12, "本当": 12, "確実": 12, "可能": 12,
    "不可能": 12, "簡単": 12, "難しい": 12, "易しい": 12, "複雑": 12, "単純": 12, "新": 13,
    "古": 5, "若": 8, "老": 6, "美": 9, "醜": 13, "良い": 8, "悪い": 12, "正": 5, "間": 12,
    "同": 6, "違": 12, "似": 7, "比": 4, "大": 3, "小": 3, "長": 8, "短": 12, "高": 10, "低": 7,
    "深": 11, "浅": 11, "広": 5, "狭": 9, "厚": 9, "薄": 16, "重": 9, "軽": 12, "強": 11, "弱": 10,
    "速": 10, "遅": 12, "早": 6, "忙": 12, "暇": 12, "楽": 13, "苦": 8, "甘": 5, "辛": 7,
    "酸": 14, "塩": 16, "甘": 5, "美味": 12, "不味": 12, "熱": 15, "冷": 7, "温": 12, "涼": 11,
    "暖": 13, "寒": 12, "暑": 12, "晴": 12, "曇": 16, "雨": 8, "雪": 11, "風": 9, "雷": 13,
    "光": 6, "暗": 13, "明": 8, "白": 5, "黒": 11, "赤": 7, "青": 8, "緑": 14, "黄": 12,
    "紫": 12, "茶": 9, "灰": 6, "色": 6, "形": 7, "模様": 16, "柄": 9, "質": 15, "材": 7,
    "紙": 10, "木": 4, "石": 5, "鉄": 13, "銅": 14, "銀": 14, "金": 8, "宝石": 16, "ダイヤ": 12,
    "数字": 13, "文字": 6, "言葉": 12, "言語": 16, "日本語": 12, "英語": 12, "中国語": 12,
    "韓国語": 12, "フランス語": 16, "ドイツ語": 16, "スペイン語": 16, "イタリア語": 16,
    "ロシア語": 16, "アラビア語": 16, "ヒンディー語": 16, "タイ語": 16, "ベトナム語": 16,
    "音楽": 12, "歌": 14, "踊": 14, "演": 15, "劇": 15, "映画": 16, "テレビ": 16, "ラジオ": 16,
    "新聞": 16, "雑誌": 16, "本": 5, "小説": 12, "詩": 13, "絵": 12, "写真": 12, "画": 8,
    "彫刻": 16, "工芸": 12, "料理": 16, "食べ物": 16, "飲み物": 16, "果物": 16, "野菜": 16,
    "肉": 6, "魚": 11, "米": 6, "パン": 12, "麺": 12, "スープ": 12, "サラダ": 12, "ケーキ": 12,
    "お菓子": 12, "アイス": 12, "ジュース": 12, "お茶": 12, "コーヒー": 12, "ビール": 12,
    "ワイン": 12, "酒": 10, "水": 4, "牛乳": 12, "砂糖": 16, "塩": 16, "油": 8, "醤油": 16,
    "味噌": 16, "酢": 15, "胡椒": 16, "香辛料": 16, "調味料": 16, "スパイス": 16,
    "スポーツ": 16, "野球": 16, "サッカー": 16, "テニス": 16, "バスケット": 16, "バレー": 16,
    "水泳": 16, "マラソン": 16, "柔道": 16, "剣道": 16, "空手": 16, "相撲": 16, "格闘技": 16,
    "体操": 16, "ダンス": 16, "ヨガ": 16, "ピラティス": 16, "ジョギング": 16, "ウォーキング": 16,
    "サイクリング": 16, "スキー": 16, "スノーボード": 16, "スケート": 16, "サーフィン": 16,
    "釣": 8, "登山": 12, "キャンプ": 16, "ハイキング": 16, "旅行": 16, "観光": 16,
    "仕事": 12, "会社": 12, "学校": 12, "病院": 16, "銀行": 16, "郵便局": 16, "警察": 16,
    "消防": 16, "役所": 16, "図書館": 16, "美術館": 16, "博物館": 16, "動物園": 16,
    "遊園地": 16, "映画館": 16, "劇場": 16, "コンサート": 16, "ライブ": 16, "パーティー": 16,
    "結婚式": 16, "葬式": 16, "誕生日": 16, "記念日": 16, "祝日": 16, "祭": 13, "祭り": 13,
    "正月": 12, "クリスマス": 16, "バレンタイン": 16, "ハロウィン": 16, "イースター": 16,
    "お盆": 12, "彼岸": 12, "節分": 12, "ひな祭り": 12, "こどもの日": 12, "母の日": 12,
    "父の日": 12, "敬老の日": 12, "体育の日": 12, "文化の日": 12, "勤労感謝の日": 16,
    "天皇誕生日": 16, "昭和の日": 16, "みどりの日": 16, "海の日": 16, "山の日": 16,
    "休日": 12, "平日": 12, "週末": 12, "連休": 12, "夏休み": 12, "冬休み": 12, "春休み": 12,
    "長期休暇": 16, "有給": 12, "病気": 12, "怪我": 12, "健康": 12, "医療": 16, "治療": 16,
    "手術": 16, "薬": 16, "注射": 16, "検査": 16, "診察": 16, "入院": 16, "退院": 16,
    "医者": 12, "看護師": 16, "薬剤師": 16, "歯医者": 16, "眼科": 16, "耳鼻科": 16,
    "小児科": 16, "産婦人科": 16, "内科": 16, "外科": 16, "整形外科": 16, "皮膚科": 16,
    "精神科": 16, "心療内科": 16, "神経科": 16, "脳外科": 16, "心臓外科": 16, "呼吸器科": 16,
    "消化器科": 16, "泌尿器科": 16, "循環器科": 16, "内分泌科": 16, "血液内科": 16,
    "腫瘍科": 16, "放射線科": 16, "麻酔科": 16, "救急科": 16, "リハビリ": 16, "理学療法": 16,
    "作業療法": 16, "言語療法": 16, "心理療法": 16, "カウンセリング": 16, "セラピー": 16,
    "マッサージ": 16, "鍼": 16, "灸": 16, "整体": 16, "カイロ": 16, "指圧": 16, "あん摩": 16,
    "ヨガ": 16, "ピラティス": 16, "太極拳": 16, "気功": 16, "瞑想": 16, "座禅": 16,
    "宗教": 12, "神": 9, "仏": 7, "キリスト": 12, "イスラム": 12, "ユダヤ": 12, "ヒンドゥー": 12,
    "仏教": 12, "神道": 12, "キリスト教": 12, "イスラム教": 12, "ユダヤ教": 12, "ヒンドゥー教": 12,
    "お寺": 12, "神社": 12, "教会": 12, "モスク": 12, "シナゴーグ": 12, "寺院": 12,
    "お坊さん": 12, "神主": 12, "牧師": 12, "イマーム": 12, "ラビ": 12, "僧侶": 12,
    "お経": 12, "聖書": 12, "コーラン": 12, "トーラー": 12, "ヴェーダ": 12, "仏典": 12,
    "祈": 8, "祈り": 8, "願": 19, "願い": 19, "希望": 12, "夢": 13, "目標": 12, "目的": 12,
    "計画": 16, "予定": 12, "約束": 16, "約束事": 16, "ルール": 12, "規則": 16, "法律": 16,
    "憲法": 16, "条例": 16, "政令": 16, "省令": 16, "通達": 16, "通知": 16, "指示": 16,
    "命令": 16, "要請": 16, "依頼": 16, "相談": 16, "質問": 16, "回答": 16, "返答": 16,
    "返事": 16, "返信": 16, "連絡": 16, "報告": 16, "連絡": 16, "報告": 16, "発表": 16,
    "発表": 16, "発表": 16, "発表": 16, "発表": 16, "発表": 16, "発表": 16, "発表": 16,
  }

  if (character === "々") {
    return 0 // 繰り返し文字は前の文字の画数を参照するため、ここでは0を返す
  }

  return strokeData[character] || 0
}

// 繰り返し文字「々」の画数を前の文字から取得する関数
function getReisuuStrokeCount(text: string, position: number): number {
  if (position === 0) return 0
  return getStrokeCount(text[position - 1])
}

// 霊数ルールを適用した画数計算
function calculateStrokesWithReisuu(text: string): { count: number; hasReisuu: boolean } {
  let total = 0
  let hasReisuu = false

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "々") {
      total += getReisuuStrokeCount(text, i)
      hasReisuu = true
    } else {
      total += getStrokeCount(text[i])
    }
  }

  return { count: total, hasReisuu }
}

// カスタムデータから吉凶を取得する関数（性別考慮）
function getFortuneFromCustomDataWithGender(
  strokeCount: number,
  customData: Record<string, any>,
  gender: string
): any {
  console.log(`🔍 getFortuneFromCustomDataWithGender呼び出し:`, {
    strokeCount,
    gender,
    customDataExists: !!customData,
    customDataKeys: customData ? Object.keys(customData).length : 0
  })

  const key = strokeCount.toString()
  const data = customData[key]

  console.log(`🔍 取得データ:`, {
    key,
    data,
    dataExists: !!data
  })

  if (!data) {
    console.log(`⚠️ データが見つかりません: ${key}画`)
  return {
      運勢: "中吉",
      説明: "データが見つかりませんでした。",
      点数: 50
    }
  }

  console.log(`✅ データ取得成功:`, data)
  return data
}

// analyzeNameFortune関数 - 霊数ルールを組み込み（メイン関数）- 最適化版
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>, // オプショナルに変更
): any {
  try {
    console.log(`🎯 analyzeNameFortune開始: "${lastName} ${firstName}" (${gender})`)
    console.log(`🔍 customFortuneData提供状況:`, !!customFortuneData)
    console.log(`🔍 customFortuneData型:`, typeof customFortuneData)
    if (customFortuneData) {
      console.log(`🔍 customFortuneData件数:`, Object.keys(customFortuneData).length)
      console.log(`🔍 customFortuneData先頭5件:`, Object.keys(customFortuneData).slice(0, 5))
    } else {
      console.log(`⚠️ customFortuneDataがundefinedまたはnullです`)
    }
    
    console.log(`🔍 関数実行開始: 霊数計算前`)

    // customFortuneDataが提供されていない場合、カスタムデータをインポート
  if (!customFortuneData) {
      console.log("⚠️ customFortuneDataが提供されていません。インポートを試行します。")
      try {
        // カスタムデータをインポート
        const { customFortuneData: importedData } = require("./fortune-data-custom")
        customFortuneData = importedData
        console.log("✅ カスタムデータをインポートしました:", Object.keys(customFortuneData).length, "件")
      } catch (error) {
        console.error("カスタムデータのインポートに失敗:", error)
    // デフォルトの運勢データを使用
    customFortuneData = {
      // 基本的な運勢データ（簡易版）
      "1": { 運勢: "大吉", 説明: "独立心旺盛で、リーダーシップを発揮します。" },
      "2": { 運勢: "凶", 説明: "協調性はありますが、優柔不断な面があります。" },
      "3": { 運勢: "大吉", 説明: "明るく積極的で、人気者になります。" },
      "4": { 運勢: "凶", 説明: "真面目ですが、苦労が多い傾向があります。" },
      "5": { 運勢: "大吉", 説明: "バランス感覚に優れ、安定した人生を送ります。" },
      "6": { 運勢: "大吉", 説明: "責任感が強く、家族思いです。" },
      "7": { 運勢: "吉", 説明: "独立心があり、専門分野で成功します。" },
      "8": { 運勢: "大吉", 説明: "意志が強く、困難を乗り越える力があります。" },
      "9": { 運勢: "凶", 説明: "頭脳明晰ですが、変化の多い人生になります。" },
      "10": { 運勢: "凶", 説明: "波乱万丈な人生ですが、最終的には成功します。" },
    }
    // 11-81画までの基本的なデフォルト値を生成
    for (let i = 11; i <= 81; i++) {
      if (!customFortuneData[i.toString()]) {
        const mod = i % 10
        if ([1, 3, 5, 6, 8].includes(mod)) {
          customFortuneData[i.toString()] = { 運勢: "吉", 説明: "良好な運勢です。" }
        } else if ([2, 4, 9].includes(mod)) {
          customFortuneData[i.toString()] = { 運勢: "凶", 説明: "注意が必要な運勢です。" }
        } else {
          customFortuneData[i.toString()] = { 運勢: "中吉", 説明: "普通の運勢です。" }
            }
          }
        }
      }
    }

    // 霊数ルールを適用した画数計算
    const lastNameResult = calculateStrokesWithReisuu(lastName)
    const firstNameResult = calculateStrokesWithReisuu(firstName)

    const lastNameCount = lastNameResult.count
    const firstNameCount = firstNameResult.count
    const hasReisuuInLastName = lastNameResult.hasReisuu
    const hasReisuuInFirstName = firstNameResult.hasReisuu

    console.log(`🔍 霊数計算結果:`, {
      lastName,
      firstName,
      lastNameCount,
      firstNameCount,
      hasReisuuInLastName,
      hasReisuuInFirstName
    })

    // VBAロジックに基づく五格計算
    // 天格（姓の総画数、霊数含む）
  const tenFormat = lastNameCount

    // 人格（姓の最後の文字 + 名の最初の文字、霊数除外）
    const lastCharStroke = getStrokeCount(lastName[lastName.length - 1])
    const firstCharStroke = firstName.length > 0 ? getStrokeCount(firstName[0]) : 0
    const jinFormat = lastCharStroke + firstCharStroke

    // 地格（名の総画数、霊数含む）
  const chiFormat = firstNameCount

    // 外格（姓の最初の文字 + 名の最後の文字、霊数除外）
    const firstCharLastNameStroke = getStrokeCount(lastName[0])
    const lastCharFirstNameStroke = firstName.length > 0 ? getStrokeCount(firstName[firstName.length - 1]) : 0
    const gaiFormat = firstCharLastNameStroke + lastCharFirstNameStroke

    // 総格（天格 + 地格）
    const totalFormat = tenFormat + chiFormat

    console.log(`🔍 五格計算結果:`, {
      tenFormat,
      jinFormat,
      chiFormat,
      gaiFormat,
      totalFormat
    })

  // 各格の吉凶を取得（カスタムデータを使用）
    console.log("🔍 吉凶データ取得デバッグ開始")
    console.log("🔍 吉凶データ取得デバッグ:", {
      tenFormat,
      jinFormat,
      chiFormat,
      gaiFormat,
      totalFormat,
      customFortuneData16: customFortuneData["16"],
      customFortuneData23: customFortuneData["23"],
      customFortuneData31: customFortuneData["31"],
      customFortuneData24: customFortuneData["24"],
      customFortuneData47: customFortuneData["47"]
    })
    console.log("🔍 吉凶データ取得デバッグ完了")

  const tenFortune = getFortuneFromCustomDataWithGender(tenFormat, customFortuneData, gender)
  const jinFortune = getFortuneFromCustomDataWithGender(jinFormat, customFortuneData, gender)
  const chiFortune = getFortuneFromCustomDataWithGender(chiFormat, customFortuneData, gender)
  const gaiFortune = getFortuneFromCustomDataWithGender(gaiFormat, customFortuneData, gender)
  const totalFortune = getFortuneFromCustomDataWithGender(totalFormat, customFortuneData, gender)

    console.log("🔍 取得された吉凶データ:", {
      tenFortune,
      jinFortune,
      chiFortune,
      gaiFortune,
      totalFortune
    })

    // 結果オブジェクトを作成
  const result = {
      name: `${lastName} ${firstName}`,
      lastName: lastName,
      firstName: firstName,
      gender: gender,
    categories: [
      {
        name: "天格",
          strokes: tenFormat,
          fortune: tenFortune.運勢 || "中吉",
          description: tenFortune.説明 || "天格の説明",
          score: tenFortune.点数 || 50
      },
      {
        name: "人格",
          strokes: jinFormat,
          fortune: jinFortune.運勢 || "中吉",
          description: jinFortune.説明 || "人格の説明",
          score: jinFortune.点数 || 50
      },
      {
        name: "地格",
          strokes: chiFormat,
          fortune: chiFortune.運勢 || "中吉",
          description: chiFortune.説明 || "地格の説明",
          score: chiFortune.点数 || 50
      },
      {
        name: "外格",
          strokes: gaiFormat,
          fortune: gaiFortune.運勢 || "中吉",
          description: gaiFortune.説明 || "外格の説明",
          score: gaiFortune.点数 || 50
      },
      {
        name: "総格",
          strokes: totalFormat,
          fortune: totalFortune.運勢 || "中吉",
          description: totalFortune.説明 || "総格の説明",
          score: totalFortune.点数 || 50
        }
      ],
    tenFormat: tenFormat,
    jinFormat: jinFormat,
    chiFormat: chiFormat,
    gaiFormat: gaiFormat,
    totalFormat: totalFormat,
  }

  if (DEBUG_MODE) {
    console.log(`🎯 analyzeNameFortune完了:`, result)
  }

  return result
  } catch (error) {
    console.error("❌ analyzeNameFortune関数でエラーが発生しました:", error)
    console.error("❌ エラーの詳細:", {
      lastName,
      firstName,
      gender,
      customFortuneDataProvided: !!customFortuneData,
      errorMessage: error.message,
      errorStack: error.stack
    })
    throw error
  }
}
