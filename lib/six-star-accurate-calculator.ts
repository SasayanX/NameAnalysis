// CSVデータの型定義
interface CSVRecord {
  year: number
  month: number
  day: number
  destinyNumber: number
  star: string
  type: string
  zodiac: string
  element: string
}

// 計算結果の型定義
interface AccurateCalculationResult {
  starType: string
  confidence: number
  source: "csv" | "calculation"
  destinyNumber?: number
  zodiac?: string
  element?: string
}

// CSVデータのキャッシュ
let csvDataCache: CSVRecord[] | null = null
let csvLoadTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分

// CSVデータを読み込む
async function loadCSVData(): Promise<CSVRecord[]> {
  const now = Date.now()

  // キャッシュが有効な場合は使用
  if (csvDataCache && now - csvLoadTime < CACHE_DURATION) {
    console.log("📦 CSVキャッシュを使用")
    return csvDataCache
  }

  try {
    console.log("🔄 CSVデータを読み込み中...")
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-BBtsr8aWCfa7Q8aLdN3JwcZ507aceE.csv"

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())

    const records: CSVRecord[] = []

    // ヘッダー行をスキップして処理
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(",")

      if (columns.length >= 8) {
        const year = Number.parseInt(columns[0])
        const month = Number.parseInt(columns[1])
        const day = Number.parseInt(columns[2])
        const destinyNumber = Number.parseInt(columns[3])
        const star = columns[4].trim()
        const type = columns[5].trim()
        const zodiac = columns[6].trim()
        const element = columns[7].trim()

        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(destinyNumber)) {
          records.push({
            year,
            month,
            day,
            destinyNumber,
            star,
            type,
            zodiac,
            element,
          })
        }
      }
    }

    csvDataCache = records
    csvLoadTime = now

    console.log(`✅ CSVデータ読み込み完了: ${records.length}件`)
    return records
  } catch (error) {
    console.error("❌ CSVデータ読み込みエラー:", error)
    return []
  }
}

// CSVデータから該当する日付を検索
async function findInCSV(birthDate: Date): Promise<CSVRecord | null> {
  const records = await loadCSVData()

  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  // 完全一致検索
  const exactMatch = records.find((record) => record.year === year && record.month === month && record.day === day)

  if (exactMatch) {
    console.log(`🎯 CSVで完全一致発見: ${year}/${month}/${day}`)
    return exactMatch
  }

  // 短縮年での検索（例：69年→1969年）
  if (year >= 1900) {
    const shortYear = year % 100
    const shortYearMatch = records.find(
      (record) => record.year === shortYear && record.month === month && record.day === day,
    )

    if (shortYearMatch) {
      console.log(`🎯 CSV短縮年一致発見: ${shortYear}/${month}/${day} -> ${year}/${month}/${day}`)
      return {
        ...shortYearMatch,
        year: year, // 実際の年に修正
      }
    }
  }

  console.log(`❌ CSVに該当データなし: ${year}/${month}/${day}`)
  return null
}

// 正確な六星占術計算
export async function calculateAccurateSixStar(birthDate: Date): Promise<AccurateCalculationResult> {
  try {
    // まずCSVデータから検索
    const csvRecord = await findInCSV(birthDate)

    if (csvRecord) {
      const starType = `${csvRecord.star}人${csvRecord.type}`

      return {
        starType,
        confidence: 1.0, // CSVデータは最高信頼度
        source: "csv",
        destinyNumber: csvRecord.destinyNumber,
        zodiac: csvRecord.zodiac,
        element: csvRecord.element,
      }
    }

    // CSVにない場合は計算で求める
    console.log("🧮 計算による六星占術実行")
    return calculateBySixStarFormula(birthDate)
  } catch (error) {
    console.error("❌ 正確な六星占術計算エラー:", error)

    // エラー時のフォールバック
    return {
      starType: "水星人+",
      confidence: 0.0,
      source: "calculation",
    }
  }
}

// 六星占術の計算式による算出
function calculateBySixStarFormula(birthDate: Date): AccurateCalculationResult {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  console.log(`🧮 計算式による算出: ${year}/${month}/${day}`)

  // 立春調整（2月4日前は前年扱い）
  let adjustedYear = year
  if (month < 2 || (month === 2 && day < 4)) {
    adjustedYear = year - 1
  }

  // 基準年（甲子の年）
  const baseYear = 1924
  const yearDiff = adjustedYear - baseYear

  // 運命数の計算
  let destinyNumber = yearDiff % 60
  if (destinyNumber < 0) {
    destinyNumber += 60
  }
  destinyNumber += 1 // 1-60の範囲に調整

  // 星の決定（運命数を10で割った余りで決定）
  const starIndex = Math.floor((destinyNumber - 1) / 10) % 6
  const stars = ["土星", "金星", "火星", "水星", "木星", "天王星"]
  const star = stars[starIndex]

  // +/-の決定（運命数の奇偶で決定）
  const type = destinyNumber % 2 === 1 ? "+" : "-"

  // 干支の計算
  const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
  const zodiacIndex = (adjustedYear - baseYear) % 12
  const zodiac = zodiacSigns[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12]

  // 五行の対応
  const elementMap: Record<string, string> = {
    土星: "土",
    金星: "金",
    火星: "火",
    水星: "水",
    木星: "木",
    天王星: "土", // 天王星は土に対応
  }

  const starType = `${star}人${type}`

  console.log(`📊 計算結果: ${starType} (運命数: ${destinyNumber}, 干支: ${zodiac})`)

  return {
    starType,
    confidence: 0.3, // 計算による結果は信頼度低め
    source: "calculation",
    destinyNumber,
    zodiac,
    element: elementMap[star] || "水",
  }
}

// デバッグ情報を取得
export async function debugCalculation(birthDate: Date): Promise<{
  csvSearch: {
    found: boolean
    record?: CSVRecord
  }
  calculation: {
    adjustedYear: number
    destinyNumber: number
    starIndex: number
    zodiacIndex: number
  }
  comparison: {
    csvResult?: string
    calculationResult: string
    match: boolean
  }
}> {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  // CSV検索結果
  const csvRecord = await findInCSV(birthDate)

  // 計算結果
  let adjustedYear = year
  if (month < 2 || (month === 2 && day < 4)) {
    adjustedYear = year - 1
  }

  const baseYear = 1924
  const yearDiff = adjustedYear - baseYear
  let destinyNumber = yearDiff % 60
  if (destinyNumber < 0) {
    destinyNumber += 60
  }
  destinyNumber += 1

  const starIndex = Math.floor((destinyNumber - 1) / 10) % 6
  const zodiacIndex = (adjustedYear - baseYear) % 12

  const stars = ["土星", "金星", "火星", "水星", "木星", "天王星"]
  const star = stars[starIndex]
  const type = destinyNumber % 2 === 1 ? "+" : "-"
  const calculationResult = `${star}人${type}`

  const csvResult = csvRecord ? `${csvRecord.star}人${csvRecord.type}` : undefined

  return {
    csvSearch: {
      found: !!csvRecord,
      record: csvRecord || undefined,
    },
    calculation: {
      adjustedYear,
      destinyNumber,
      starIndex,
      zodiacIndex: zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12,
    },
    comparison: {
      csvResult,
      calculationResult,
      match: csvResult === calculationResult,
    },
  }
}

// CSVデータの統計情報を取得
export async function getCSVStatistics(): Promise<{
  totalRecords: number
  yearRange: { min: number; max: number }
  starTypeDistribution: Record<string, number>
  accuracyTest: {
    totalTests: number
    matches: number
    accuracy: number
  }
}> {
  try {
    const records = await loadCSVData()

    if (records.length === 0) {
      return {
        totalRecords: 0,
        yearRange: { min: 0, max: 0 },
        starTypeDistribution: {},
        accuracyTest: { totalTests: 0, matches: 0, accuracy: 0 },
      }
    }

    const years = records.map((r) => r.year)
    const starTypeDistribution: Record<string, number> = {}

    records.forEach((record) => {
      const starType = `${record.star}人${record.type}`
      starTypeDistribution[starType] = (starTypeDistribution[starType] || 0) + 1
    })

    // 精度テスト（最初の100件で実施）
    const testRecords = records.slice(0, Math.min(100, records.length))
    let matches = 0

    for (const record of testRecords) {
      const testDate = new Date(record.year, record.month - 1, record.day)
      const calculationResult = calculateBySixStarFormula(testDate)
      const csvResult = `${record.star}人${record.type}`

      if (calculationResult.starType === csvResult) {
        matches++
      }
    }

    return {
      totalRecords: records.length,
      yearRange: {
        min: Math.min(...years),
        max: Math.max(...years),
      },
      starTypeDistribution,
      accuracyTest: {
        totalTests: testRecords.length,
        matches,
        accuracy: testRecords.length > 0 ? (matches / testRecords.length) * 100 : 0,
      },
    }
  } catch (error) {
    console.error("統計情報取得エラー:", error)
    return {
      totalRecords: 0,
      yearRange: { min: 0, max: 0 },
      starTypeDistribution: {},
      accuracyTest: { totalTests: 0, matches: 0, accuracy: 0 },
    }
  }
}
