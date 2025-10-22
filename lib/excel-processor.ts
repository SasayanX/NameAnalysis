import * as XLSX from "xlsx"

export async function processExcel(file: File, name: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Process the Excel file based on its structure
        const result = analyzeNameFromExcel(workbook, name)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

function analyzeNameFromExcel(workbook: XLSX.WorkBook, name: string): any {
  // Check if all required sheets exist
  const requiredSheets = ["算出結果", "画数データ", "画数吉凶", "顧客データ"]
  const missingSheets = requiredSheets.filter((sheet) => !workbook.SheetNames.includes(sheet))

  if (missingSheets.length > 0) {
    // If exact sheet names don't match, try to find sheets with similar names
    const availableSheets = workbook.SheetNames
    console.log("Available sheets:", availableSheets)
    console.log("Missing sheets:", missingSheets)

    // Continue with available sheets, but log a warning
    console.warn(`Warning: Some expected sheets are missing or named differently: ${missingSheets.join(", ")}`)
  }

  // Get stroke count data
  const strokeCountSheet = findSheet(workbook, ["画数データ", "画数", "漢字データ"])
  const strokeCountData: Record<string, number> = {}

  if (strokeCountSheet) {
    const strokeCountJson = XLSX.utils.sheet_to_json<any>(workbook.Sheets[strokeCountSheet])
    // Assuming the sheet has columns for character and stroke count
    strokeCountJson.forEach((row) => {
      const character = row["文字"] || row["漢字"] || Object.values(row)[0]
      const count = row["画数"] || Object.values(row)[1]
      if (character && count) {
        strokeCountData[character] = Number(count)
      }
    })
  }

  // Get fortune/misfortune data
  const fortuneSheet = findSheet(workbook, ["画数吉凶", "吉凶", "運勢"])
  const fortuneData: Record<number, any> = {}

  if (fortuneSheet) {
    const fortuneJson = XLSX.utils.sheet_to_json<any>(workbook.Sheets[fortuneSheet])
    // Assuming the sheet has columns for stroke count and fortune
    fortuneJson.forEach((row) => {
      const strokeCount = row["画数"] || Object.values(row)[0]
      if (strokeCount) {
        fortuneData[Number(strokeCount)] = row
      }
    })
  }

  // Calculate stroke counts for the name
  const lastName = name.split(" ")[0] || ""
  const firstName = name.split(" ")[1] || ""

  const lastNameCount = calculateStrokeCount(lastName, strokeCountData)
  const firstNameCount = calculateStrokeCount(firstName, strokeCountData)

  // Calculate the different formats (天格, 人格, 地格, etc.)
  const tenFormat = lastNameCount + 1
  const jinFormat = calculateJinFormat(lastNameCount, firstNameCount)
  const chiFormat = firstNameCount
  const gaiFormat = calculateGaiFormat(tenFormat, chiFormat)
  const totalFormat = lastNameCount + firstNameCount

  // Get fortune for each format
  const tenFortune = fortuneData[tenFormat] || { 運勢: "不明", 説明: "" }
  const jinFortune = fortuneData[jinFormat] || { 運勢: "不明", 説明: "" }
  const chiFortune = fortuneData[chiFormat] || { 運勢: "不明", 説明: "" }
  const gaiFortune = fortuneData[gaiFormat] || { 運勢: "不明", 説明: "" }
  const totalFortune = fortuneData[totalFormat] || { 運勢: "不明", 説明: "" }

  // Calculate overall score (this is a simplified example)
  const calculateScore = (fortune: any) => {
    const rating = fortune["運勢"] || ""
    if (rating.includes("大吉")) return 90
    if (rating.includes("吉")) return 80
    if (rating.includes("中")) return 60
    if (rating.includes("凶")) return 30
    return 50 // default
  }

  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

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
  }
}

// Helper function to find a sheet with similar name
function findSheet(workbook: XLSX.WorkBook, possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    if (workbook.SheetNames.includes(name)) {
      return name
    }

    // Try to find a sheet that contains the name
    const matchingSheet = workbook.SheetNames.find((sheet) => sheet.includes(name) || name.includes(sheet))

    if (matchingSheet) {
      return matchingSheet
    }
  }

  // If no matching sheet is found, return the first sheet as fallback
  return workbook.SheetNames[0] || null
}

// Calculate stroke count for a name
function calculateStrokeCount(name: string, strokeCountData: Record<string, number>): number {
  let total = 0

  for (const char of name) {
    if (strokeCountData[char]) {
      total += strokeCountData[char]
    } else {
      // Fallback values for common characters if not found in data
      if (/[a-zA-Z]/.test(char)) {
        total += 1 // English letters
      } else if (/[ぁ-んァ-ン]/.test(char)) {
        total += 2 // Hiragana/Katakana
      } else {
        total += 5 // Default for unknown characters
      }
    }
  }

  return total
}

// Calculate 人格 (Jin Format)
function calculateJinFormat(lastNameCount: number, firstNameCount: number): number {
  // The last stroke of the last name + the first stroke of the first name
  // This is a simplified calculation
  return lastNameCount + firstNameCount
}

// Calculate 外格 (Gai Format)
function calculateGaiFormat(tenFormat: number, chiFormat: number): number {
  // This is a simplified calculation
  return tenFormat + chiFormat - 1
}

// Generate advice based on the fortune results
function generateAdvice(tenFortune: any, jinFortune: any, chiFortune: any, gaiFortune: any, totalFortune: any): string {
  let advice = "この名前の分析結果に基づくと、"

  // Add advice based on the most significant formats (人格 and 総格)
  if (jinFortune["運勢"]?.includes("吉")) {
    advice += "あなたは才能と良い性格を持ち、"
  } else if (jinFortune["運勢"]?.includes("凶")) {
    advice += "人生の中心的な部分で課題があるかもしれませんが、"
  }

  if (totalFortune["運勢"]?.includes("吉")) {
    advice += "人生全体を通して良い運勢に恵まれるでしょう。"
  } else if (totalFortune["運勢"]?.includes("凶")) {
    advice += "人生全体で注意が必要な場面があるかもしれません。"
  } else {
    advice += "バランスの取れた人生を送ることができるでしょう。"
  }

  // Add specific advice based on other formats
  if (tenFortune["運勢"]?.includes("凶")) {
    advice += " 社会的な印象については意識的に良い印象を与えるよう心がけると良いでしょう。"
  }

  if (chiFortune["運勢"]?.includes("吉")) {
    advice += " 特に若年期は良い運勢に恵まれる傾向があります。"
  }

  if (gaiFortune["運勢"]?.includes("凶")) {
    advice += " 対人関係では誤解を招かないよう注意が必要かもしれません。"
  }

  return advice
}
