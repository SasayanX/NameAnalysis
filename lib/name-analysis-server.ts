// サーバーサイド専用の姓名判断関数
export interface FortuneData {
  fortune: string
  description: string
}

export interface NameAnalysisResult {
  tenFormat: number
  jinFormat: number
  chiFormat: number
  gaiFormat: number
  totalFormat: number
  lastNameCount: number
  firstNameCount: number
  tenFortune: FortuneData
  jinFortune: FortuneData
  chiFortune: FortuneData
  gaiFortune: FortuneData
  totalFortune: FortuneData
}

export function analyzeNameServer(lastName: string, firstName: string): NameAnalysisResult {
  // 旧字体変換テーブル
  const oldKanjiMap: { [key: string]: string } = {
    '澤': '澤', '濱': '濱', '邊': '邊', '國': '國', '學': '學',
    '會': '會', '實': '實', '榮': '榮', '營': '營', '藝': '藝',
    '圓': '圓', '圖': '圖', '團': '團', '廣': '廣', '廳': '廳',
    '縣': '縣', '鄉': '鄉', '關': '關', '鹽': '鹽', '鐵': '鐵',
    '錢': '錢', '銀': '銀', '銅': '銅', '鋼': '鋼', '鐵': '鐵'
  }

  // 霊数を含む漢字のリスト
  const reisuuKanji = ['澤', '濱', '邊', '國', '學', '會', '實', '榮', '營', '藝']

  // 旧字体に変換
  const convertToOldKanji = (text: string): string => {
    return text.split('').map(char => oldKanjiMap[char] || char).join('')
  }

  // 画数計算（簡易版）
  const getStrokeCount = (char: string): number => {
    const strokeMap: { [key: string]: number } = {
      '澤': 17, '濱': 17, '邊': 18, '國': 11, '學': 16,
      '會': 13, '實': 14, '榮': 14, '營': 17, '藝': 18,
      '圓': 13, '圖': 14, '團': 14, '廣': 15, '廳': 25,
      '縣': 16, '鄉': 11, '關': 18, '鹽': 24, '鐵': 21,
      '錢': 16, '銀': 14, '銅': 14, '鋼': 16, '鐵': 21
    }
    return strokeMap[char] || 8 // デフォルト値
  }

  // 姓名を旧字体に変換
  const oldLastName = convertToOldKanji(lastName)
  const oldFirstName = convertToOldKanji(firstName)

  // 画数計算
  const lastNameCount = oldLastName.split('').reduce((sum, char) => sum + getStrokeCount(char), 0)
  const firstNameCount = oldFirstName.split('').reduce((sum, char) => sum + getStrokeCount(char), 0)

  // 霊数チェック
  const hasReisuuInLastName = oldLastName.split('').some(char => reisuuKanji.includes(char))
  const hasReisuuInFirstName = oldFirstName.split('').some(char => reisuuKanji.includes(char))

  // 五格計算
  const tenFormat = hasReisuuInLastName ? lastNameCount + 1 : lastNameCount
  const jinFormat = lastNameCount + firstNameCount
  const chiFormat = hasReisuuInFirstName ? firstNameCount + 1 : firstNameCount
  const totalFormat = lastNameCount + firstNameCount

  // 外格計算（霊数ルール適用）
  let gaiFormat: number
  if (hasReisuuInLastName && hasReisuuInFirstName) {
    gaiFormat = totalFormat + 2
  } else if (hasReisuuInLastName || hasReisuuInFirstName) {
    gaiFormat = totalFormat + 1
  } else {
    gaiFormat = totalFormat
  }

  // 運勢データを生成
  const getFortuneData = (count: number): FortuneData => {
    const fortunes = [
      { fortune: '大吉', description: '非常に良い運勢' },
      { fortune: '吉', description: '良い運勢' },
      { fortune: '中吉', description: '中程度の良い運勢' },
      { fortune: '小吉', description: '少し良い運勢' },
      { fortune: '末吉', description: '後半に良い運勢' },
      { fortune: '凶', description: '注意が必要な運勢' },
      { fortune: '大凶', description: '非常に注意が必要な運勢' }
    ]
    
    const index = count % fortunes.length
    return fortunes[index]
  }

  return {
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat,
    lastNameCount,
    firstNameCount,
    tenFortune: getFortuneData(tenFormat),
    jinFortune: getFortuneData(jinFormat),
    chiFortune: getFortuneData(chiFormat),
    gaiFortune: getFortuneData(gaiFormat),
    totalFortune: getFortuneData(totalFormat)
  }
}
