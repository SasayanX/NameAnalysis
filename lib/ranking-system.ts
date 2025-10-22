export interface RankingEntry {
  id: string
  userId: string
  displayName: string // 個人情報保護済み
  fullName: string // 暗号化保存
  powerRank: string
  totalPoints: number
  prefecture?: string
  ageGroup?: string // 20代、30代など
  gender: "male" | "female"
  timestamp: Date
  isPublic: boolean // ランキング参加同意
}

export interface RankingStats {
  totalUsers: number
  averagePoints: number
  topRank: string
  userPercentile: number
}

// 個人情報を保護した表示名を生成
export function createDisplayName(lastName: string, firstName: string): string {
  const lastNameDisplay = lastName.length === 1 ? lastName : lastName.charAt(0) + "○".repeat(lastName.length - 1)

  const firstNameDisplay =
    firstName.length === 1 ? "○" + firstName : firstName.charAt(0) + "○".repeat(firstName.length - 1)

  return lastNameDisplay + firstNameDisplay
}

// ランキングデータを取得
export async function getRankingData(
  category: "overall" | "male" | "female" = "overall",
  limit = 100,
): Promise<RankingEntry[]> {
  // 実際の実装ではデータベースから取得
  // ここではサンプルデータを返す
  return []
}

// ユーザーの順位を取得
export async function getUserRanking(
  userId: string,
  category: "overall" | "male" | "female" = "overall",
): Promise<{ rank: number; entry: RankingEntry } | null> {
  // 実際の実装ではデータベースから取得
  return null
}

// ランキングに参加
export async function submitToRanking(
  userId: string,
  lastName: string,
  firstName: string,
  analysisResult: any,
  userProfile: {
    prefecture?: string
    ageGroup?: string
    gender: "male" | "female"
  },
): Promise<boolean> {
  try {
    const displayName = createDisplayName(lastName, firstName)

    const entry: Omit<RankingEntry, "id"> = {
      userId,
      displayName,
      fullName: encrypt(lastName + firstName), // 暗号化して保存
      powerRank: analysisResult.powerRank,
      totalPoints: analysisResult.totalPoints,
      prefecture: userProfile.prefecture,
      ageGroup: userProfile.ageGroup,
      gender: userProfile.gender,
      timestamp: new Date(),
      isPublic: true,
    }

    // データベースに保存
    // await saveRankingEntry(entry)

    return true
  } catch (error) {
    console.error("ランキング登録エラー:", error)
    return false
  }
}

// 暗号化関数（実際の実装では適切な暗号化ライブラリを使用）
function encrypt(text: string): string {
  // 実装例：crypto-jsなどを使用
  return btoa(text) // 簡易実装
}

// ランキング統計を取得
export async function getRankingStats(): Promise<RankingStats> {
  // 実際の実装ではデータベースから集計
  return {
    totalUsers: 12543,
    averagePoints: 387,
    topRank: "SSS",
    userPercentile: 75,
  }
}
