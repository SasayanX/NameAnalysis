// CSVデータの型定義
export interface SixStarCSVData {
  year: number
  month: number
  day: number
  destinyNumber: number
  star: string
  type: string
  zodiac: string
  element: string
}

// CSVデータのキャッシュ
let csvCache: SixStarCSVData[] | null = null
let lastLoadTime = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10分

// 干支の定義
export const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// CSVデータを読み込む
export async function loadSixStarCSV(): Promise<SixStarCSVData[]> {
  const now = Date.now()

  // キャッシュが有効な場合は返す
  if (csvCache && now - lastLoadTime < CACHE_DURATION) {
    console.log("📦 六星CSVキャッシュを使用")
    return csvCache
  }

  try {
    console.log("🔄 六星CSVデータを読み込み中...")

    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%81%8B%E5%91%BD%E6%95%B0-BBtsr8aWCfa7Q8aLdN3JwcZ507aceE.csv"

    const response = await fetch(csvUrl, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("📄 CSV生データ（最初の500文字）:", csvText.substring(0, 500))

    const lines = csvText.split("\n").filter((line) => line.trim())

    if (lines.length <= 1) {
      throw new Error("CSVデータが空または無効です")
    }

    // ヘッダー行を確認
    const header = lines[0].split(",").map((col) => col.trim())
    console.log("📋 CSVヘッダー:", header)

    const data: SixStarCSVData[] = []

    // ヘッダー行をスキップして処理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // カンマで分割（ダブルクォートを考慮）
      const columns = parseCSVLine(line)

      console.log(`📊 行${i}: [${columns.join(", ")}]`)

      if (columns.length >= 8) {
        const year = Number.parseInt(columns[0])
        const month = Number.parseInt(columns[1])
        const day = Number.parseInt(columns[2])
        const destinyNumber = Number.parseInt(columns[3])
        const star = columns[4]?.replace(/"/g, "").trim()
        const type = columns[5]?.replace(/"/g, "").trim()
        const zodiac = columns[6]?.replace(/"/g, "").trim()
        const element = columns[7]?.replace(/"/g, "").trim()

        // データの妥当性チェック
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(destinyNumber) && star && type) {
          // 日付の妥当性チェック
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            data.push({
              year,
              month,
              day,
              destinyNumber,
              star,
              type,
              zodiac: zodiac || "",
              element: element || "",
            })

            // 2000年9月のデータをログ出力
            if (year === 2000 && month === 9) {
              console.log(`🎯 2000年9月データ発見: 運命数=${destinyNumber}, 星=${star}, タイプ=${type}`)
            }
          }
        } else {
          console.warn(`⚠️ 無効なデータ行${i}: [${columns.join(", ")}]`)
        }
      } else {
        console.warn(`⚠️ 列数不足 行${i}: ${columns.length}列 [${columns.join(", ")}]`)
      }
    }

    if (data.length === 0) {
      throw new Error("有効なCSVデータが見つかりません")
    }

    csvCache = data
    lastLoadTime = now

    console.log(`✅ 六星CSVデータ読み込み完了: ${data.length}件`)

    // 2000年9月のデータを確認
    const test2000_9 = data.filter((d) => d.year === 2000 && d.month === 9)
    console.log(`🔍 2000年9月のデータ件数: ${test2000_9.length}`)
    if (test2000_9.length > 0) {
      console.log(`📊 2000年9月サンプル:`, test2000_9.slice(0, 5))
    }

    return data
  } catch (error) {
    console.error("❌ 六星CSV読み込みエラー:", error)

    // エラー時は空配列を返す
    csvCache = []
    lastLoadTime = now
    return []
  }
}

// CSV行を正しく解析する関数（ダブルクォート対応）
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// CSVデータから該当する日付を検索
export function findSixStarFromCSV(csvData: SixStarCSVData[], birthDate: Date): SixStarCSVData | null {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  console.log(`🔍 CSV検索: ${year}/${month}/${day}`)

  // 完全一致検索
  const exactMatch = csvData.find((data) => data.year === year && data.month === month && data.day === day)

  if (exactMatch) {
    console.log(`🎯 完全一致発見: ${exactMatch.star}人${exactMatch.type} (運命数: ${exactMatch.destinyNumber})`)
    return exactMatch
  }

  // 年月のみで検索（日は無視）- 運命数は年月で決まるため
  const monthMatch = csvData.find((data) => data.year === year && data.month === month)

  if (monthMatch) {
    console.log(`🎯 年月一致発見: ${year}/${month} -> 運命数${monthMatch.destinyNumber}`)
    return {
      ...monthMatch,
      day: day, // 実際の日に修正
    }
  }

  // 短縮年での検索（例：00年→2000年）
  if (year >= 2000) {
    const shortYear = year % 100
    const shortYearMatch = csvData.find((data) => data.year === shortYear && data.month === month)

    if (shortYearMatch) {
      console.log(`🎯 短縮年一致: ${shortYear}/${month} -> ${year}/${month} (運命数: ${shortYearMatch.destinyNumber})`)
      return {
        ...shortYearMatch,
        year: year, // 実際の年に修正
        day: day, // 実際の日に修正
      }
    }
  }

  console.log(`❌ CSV検索結果なし: ${year}/${month}/${day}`)
  return null
}

// 運命数をCSVから読み込む
export async function loadDestinyNumbersFromCSV(): Promise<
  Array<{
    year: number
    month: number
    day: number
    destinyNumber: number
    zodiac: string
  }>
> {
  try {
    const csvData = await loadSixStarCSV()
    return csvData.map((data) => ({
      year: data.year,
      month: data.month,
      day: data.day,
      destinyNumber: data.destinyNumber,
      zodiac: data.zodiac,
    }))
  } catch (error) {
    console.error("運命数CSV読み込みエラー:", error)
    return []
  }
}

// 生年月日から運命数を取得
export async function getDestinyNumberFromBirthdate(birthDate: Date): Promise<{
  destinyNumber: number | null
  zodiac: string | null
  source: "csv" | "calculation"
}> {
  try {
    const csvData = await loadSixStarCSV()
    const found = findSixStarFromCSV(csvData, birthDate)

    if (found) {
      return {
        destinyNumber: found.destinyNumber,
        zodiac: found.zodiac,
        source: "csv",
      }
    }

    // CSVにない場合は計算で算出
    const year = birthDate.getFullYear()
    const month = birthDate.getMonth() + 1

    // 立春調整
    let adjustedYear = year
    if (month < 2 || (month === 2 && birthDate.getDate() <= 3)) {
      adjustedYear = year - 1
    }

    const baseYear = 1924
    const yearDiff = adjustedYear - baseYear
    let destinyNumber = ((yearDiff * 12 + month - 1) % 60) + 1
    if (destinyNumber <= 0) {
      destinyNumber += 60
    }

    // 干支計算
    const zodiacIndex = (((adjustedYear - baseYear) % 12) + 12) % 12
    const zodiac = zodiacSigns[zodiacIndex]

    return {
      destinyNumber,
      zodiac,
      source: "calculation",
    }
  } catch (error) {
    console.error("運命数取得エラー:", error)
    return {
      destinyNumber: null,
      zodiac: null,
      source: "calculation",
    }
  }
}

// 干支を取得
export function getZodiac(year: number): string {
  const baseYear = 1924 // 甲子年
  const yearDiff = year - baseYear
  const zodiacIndex = ((yearDiff % 12) + 12) % 12
  return zodiacSigns[zodiacIndex]
}

// CSVデータの妥当性をチェック
export async function validateCSVData(): Promise<{
  isValid: boolean
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicates: number
  errors: string[]
}> {
  try {
    const csvData = await loadSixStarCSV()
    const errors: string[] = []
    let validRecords = 0
    let invalidRecords = 0

    // 重複チェック用のSet
    const dateSet = new Set<string>()
    let duplicates = 0

    csvData.forEach((record, index) => {
      const dateKey = `${record.year}-${record.month}-${record.day}`

      // 重複チェック
      if (dateSet.has(dateKey)) {
        duplicates++
        errors.push(`重複データ: ${dateKey} (行${index + 2})`)
      } else {
        dateSet.add(dateKey)
      }

      // データ妥当性チェック
      let isRecordValid = true

      if (record.year < 1900 || record.year > 2100) {
        errors.push(`無効な年: ${record.year} (行${index + 2})`)
        isRecordValid = false
      }

      if (record.month < 1 || record.month > 12) {
        errors.push(`無効な月: ${record.month} (行${index + 2})`)
        isRecordValid = false
      }

      if (record.day < 1 || record.day > 31) {
        errors.push(`無効な日: ${record.day} (行${index + 2})`)
        isRecordValid = false
      }

      if (record.destinyNumber < 1 || record.destinyNumber > 60) {
        errors.push(`無効な運命数: ${record.destinyNumber} (行${index + 2})`)
        isRecordValid = false
      }

      // サイトに記載された6つの星：土星、金星、火星、天王星、木星、水星
      const validStars = ["土星", "金星", "火星", "天王星", "木星", "水星"]
      if (!validStars.includes(record.star)) {
        errors.push(`無効な星: ${record.star} (行${index + 2})`)
        isRecordValid = false
      }

      if (record.type !== "+" && record.type !== "-") {
        errors.push(`無効なタイプ: ${record.type} (行${index + 2})`)
        isRecordValid = false
      }

      if (isRecordValid) {
        validRecords++
      } else {
        invalidRecords++
      }
    })

    const isValid = invalidRecords === 0 && duplicates === 0

    return {
      isValid,
      totalRecords: csvData.length,
      validRecords,
      invalidRecords,
      duplicates,
      errors: errors.slice(0, 50), // 最初の50個のエラーのみ
    }
  } catch (error) {
    return {
      isValid: false,
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      duplicates: 0,
      errors: [`CSV検証エラー: ${error}`],
    }
  }
}

// CSVデータの統計情報を取得
export async function getCSVDataStatistics(): Promise<{
  totalRecords: number
  yearRange: { min: number; max: number }
  starTypeDistribution: Record<string, number>
  monthDistribution: Record<number, number>
  sampleData: SixStarCSVData[]
}> {
  try {
    const csvData = await loadSixStarCSV()

    if (csvData.length === 0) {
      return {
        totalRecords: 0,
        yearRange: { min: 0, max: 0 },
        starTypeDistribution: {},
        monthDistribution: {},
        sampleData: [],
      }
    }

    const years = csvData.map((d) => d.year)
    const starTypeDistribution: Record<string, number> = {}
    const monthDistribution: Record<number, number> = {}

    csvData.forEach((record) => {
      // 星人タイプの分布
      const starType = `${record.star}人${record.type}`
      starTypeDistribution[starType] = (starTypeDistribution[starType] || 0) + 1

      // 月の分布
      monthDistribution[record.month] = (monthDistribution[record.month] || 0) + 1
    })

    // サンプルデータ（最初の20件）
    const sampleData = csvData.slice(0, 20)

    return {
      totalRecords: csvData.length,
      yearRange: {
        min: Math.min(...years),
        max: Math.max(...years),
      },
      starTypeDistribution,
      monthDistribution,
      sampleData,
    }
  } catch (error) {
    console.error("CSV統計情報取得エラー:", error)
    return {
      totalRecords: 0,
      yearRange: { min: 0, max: 0 },
      starTypeDistribution: {},
      monthDistribution: {},
      sampleData: [],
    }
  }
}

// 特定の日付範囲のデータを取得
export async function getCSVDataByDateRange(startDate: Date, endDate: Date): Promise<SixStarCSVData[]> {
  try {
    const csvData = await loadSixStarCSV()

    return csvData.filter((record) => {
      const recordDate = new Date(record.year, record.month - 1, record.day)
      return recordDate >= startDate && recordDate <= endDate
    })
  } catch (error) {
    console.error("日付範囲検索エラー:", error)
    return []
  }
}

// CSVデータをクリア（テスト用）
export function clearCSVCache(): void {
  csvCache = null
  lastLoadTime = 0
  console.log("🗑️ CSVキャッシュをクリアしました")
}

// 運命数の妥当性をチェック
export function validateDestinyNumber(destinyNumber: number): boolean {
  return destinyNumber >= 1 && destinyNumber <= 60
}

// 星人タイプの妥当性をチェック（天王星人を含む）
export function validateStarType(star: string, type: string): boolean {
  // サイトに記載された6つの星：土星、金星、火星、天王星、木星、水星
  const validStars = ["土星", "金星", "火星", "天王星", "木星", "水星"]
  const validTypes = ["+", "-"]

  return validStars.includes(star) && validTypes.includes(type)
}

// CSVデータの整合性をチェック
export async function checkCSVDataConsistency(): Promise<{
  isConsistent: boolean
  inconsistencies: string[]
  recommendations: string[]
}> {
  try {
    const csvData = await loadSixStarCSV()
    const inconsistencies: string[] = []
    const recommendations: string[] = []

    // 運命数と星の対応をチェック
    csvData.forEach((record, index) => {
      const expectedStar = getExpectedStarFromDestinyNumber(record.destinyNumber)
      if (expectedStar !== record.star) {
        inconsistencies.push(
          `行${index + 2}: 運命数${record.destinyNumber}に対して星${record.star}は不整合（期待値: ${expectedStar}）`,
        )
      }
    })

    // 運命数の分布をチェック
    const destinyDistribution: Record<number, number> = {}
    csvData.forEach((record) => {
      destinyDistribution[record.destinyNumber] = (destinyDistribution[record.destinyNumber] || 0) + 1
    })

    const missingNumbers = []
    for (let i = 1; i <= 60; i++) {
      if (!destinyDistribution[i]) {
        missingNumbers.push(i)
      }
    }

    if (missingNumbers.length > 0) {
      inconsistencies.push(`運命数${missingNumbers.join(", ")}のデータが不足しています`)
      recommendations.push("不足している運命数のデータを補完することを推奨します")
    }

    // 星人タイプの分布をチェック
    const starTypeDistribution: Record<string, number> = {}
    csvData.forEach((record) => {
      const starType = `${record.star}人${record.type}`
      starTypeDistribution[starType] = (starTypeDistribution[starType] || 0) + 1
    })

    const expectedStarTypes = [
      "土星人+",
      "土星人-",
      "金星人+",
      "金星人-",
      "火星人+",
      "火星人-",
      "天王星人+",
      "天王星人-",
      "木星人+",
      "木星人-",
      "水星人+",
      "水星人-",
    ]

    expectedStarTypes.forEach((starType) => {
      if (!starTypeDistribution[starType]) {
        inconsistencies.push(`${starType}のデータが存在しません`)
      }
    })

    return {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      recommendations,
    }
  } catch (error) {
    return {
      isConsistent: false,
      inconsistencies: [`整合性チェックエラー: ${error}`],
      recommendations: ["CSVデータの再読み込みを試してください"],
    }
  }
}

// 運命数から期待される星を取得（サイトの順序に基づく）
function getExpectedStarFromDestinyNumber(destinyNumber: number): string {
  // サイトに記載された順序：土星、金星、火星、天王星、木星、水星
  if (destinyNumber >= 1 && destinyNumber <= 10) return "土星"
  if (destinyNumber >= 11 && destinyNumber <= 20) return "金星"
  if (destinyNumber >= 21 && destinyNumber <= 30) return "火星"
  if (destinyNumber >= 31 && destinyNumber <= 40) return "天王星"
  if (destinyNumber >= 41 && destinyNumber <= 50) return "木星"
  if (destinyNumber >= 51 && destinyNumber <= 60) return "水星"
  return "水星" // デフォルト
}

// サイトの例（1989年→運命数59）をテスト
export async function testSiteExample1989(): Promise<{
  year: number
  expectedDestinyNumber: number
  csvResult: SixStarCSVData | null
  calculationResult: number
  isConsistent: boolean
}> {
  try {
    const csvData = await loadSixStarCSV()
    const testDate = new Date(1989, 0, 1) // 1989年1月1日
    const csvResult = findSixStarFromCSV(csvData, testDate)

    // 計算による結果
    const calculationResult = ((((1989 - 1924) % 60) * 12 + 1 - 1) % 60) + 1

    return {
      year: 1989,
      expectedDestinyNumber: 59, // サイトの例
      csvResult,
      calculationResult,
      isConsistent: csvResult?.destinyNumber === 59 || calculationResult === 59,
    }
  } catch (error) {
    console.error("1989年テストエラー:", error)
    return {
      year: 1989,
      expectedDestinyNumber: 59,
      csvResult: null,
      calculationResult: 0,
      isConsistent: false,
    }
  }
}
