import { csvImportedData as importedData } from "@/lib/stroke-data/csv-imported-data"

// CSVインポートデータをエクスポート
export const csvImportedData = importedData

// その他のストア機能
export interface StoreState {
  csvData: Record<string, number>
  lastUpdated: Date
}

export const store: StoreState = {
  csvData: csvImportedData,
  lastUpdated: new Date(),
}

/**
 * ストアからデータを取得
 */
export function getStoreData(): Record<string, number> {
  return csvImportedData
}

/**
 * 特定の文字の画数をストアから取得
 */
export function getCharFromStore(char: string): number | undefined {
  return csvImportedData[char]
}
