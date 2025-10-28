// 画数データ拡充の実行とテスト
import { runStrokeDataExpansion, scheduleStrokeDataExpansion } from './stroke-data-expansion'

// テスト実行用の関数
export async function testStrokeDataExpansion() {
  console.log('🧪 画数データ拡充テストを開始')
  
  try {
    const result = await runStrokeDataExpansion()
    
    console.log('📊 テスト結果:')
    console.log(`- 処理姓名数: ${result.processedNames}`)
    console.log(`- 不足漢字: ${result.missingKanji.length}個`)
    console.log(`- 追加漢字: ${result.addedKanji.length}個`)
    console.log(`- エラー: ${result.errors.length}件`)
    
    if (result.missingKanji.length > 0) {
      console.log('\n🔍 検出された不足漢字:')
      result.missingKanji.forEach(kanji => {
        console.log(`  ${kanji.character}: ${kanji.suggestedStroke}画 (頻度: ${kanji.frequency}, 信頼度: ${(kanji.confidence * 100).toFixed(1)}%)`)
      })
    }
    
    if (result.addedKanji.length > 0) {
      console.log('\n✅ 追加された漢字:')
      console.log(`  ${result.addedKanji.join(', ')}`)
    }
    
    return result
  } catch (error) {
    console.error('❌ テスト実行エラー:', error)
    throw error
  }
}

// 実際のデータソースから人名を取得する関数（拡張可能）
export async function fetchNameDataFromSources(): Promise<any[]> {
  // 実際の実装では、以下のようなソースからデータを取得
  // - 人名辞典API
  // - 統計データ
  // - CSVファイル
  // - ウェブスクレイピング
  
  console.log('📡 外部データソースから人名データを取得中...')
  
  // サンプルデータを返す（実際の実装では外部APIを呼び出し）
  return [
    { lastName: '田中', firstName: '太郎', gender: 'male', source: 'api' },
    { lastName: '佐藤', firstName: '花子', gender: 'female', source: 'api' },
    { lastName: '鈴木', firstName: '一郎', gender: 'male', source: 'api' },
    // より多くのデータ...
  ]
}

// 画数データの品質チェック
export function validateStrokeData(character: string, strokeCount: number): boolean {
  // 基本的な検証ルール
  if (strokeCount < 1 || strokeCount > 50) {
    console.warn(`⚠️ 異常な画数: ${character} = ${strokeCount}画`)
    return false
  }
  
  // 既存データとの整合性チェック
  // 実際の実装では、複数のソースで検証
  
  return true
}

// データベース更新のロールバック機能
export function rollbackStrokeData(addedKanji: string[]): void {
  console.log(`🔄 ロールバック: ${addedKanji.length}個の漢字を削除`)
  
  addedKanji.forEach(character => {
    // 実際の実装では、データベースから削除
    console.log(`  - ${character} を削除`)
  })
}
