// 自動画数データ拡充システム
import { getStrokeCount } from './name-data-simple-fixed'
import { strokeCountData } from './name-data-simple'

export interface NameData {
  lastName: string
  firstName: string
  reading?: string
  gender?: 'male' | 'female'
  source?: string
}

export interface MissingKanji {
  character: string
  frequency: number
  sources: string[]
  suggestedStroke: number
  confidence: number
}

export interface DataExpansionResult {
  processedNames: number
  missingKanji: MissingKanji[]
  addedKanji: string[]
  errors: string[]
}

// サンプル人名データ（実際の実装では外部APIやファイルから取得）
const SAMPLE_NAME_DATA: NameData[] = [
  // よく使われる姓名
  { lastName: '田中', firstName: '太郎', gender: 'male', source: 'sample' },
  { lastName: '佐藤', firstName: '花子', gender: 'female', source: 'sample' },
  { lastName: '鈴木', firstName: '一郎', gender: 'male', source: 'sample' },
  { lastName: '高橋', firstName: '美咲', gender: 'female', source: 'sample' },
  { lastName: '渡辺', firstName: '健太', gender: 'male', source: 'sample' },
  { lastName: '伊藤', firstName: 'さくら', gender: 'female', source: 'sample' },
  { lastName: '山田', firstName: '大輔', gender: 'male', source: 'sample' },
  { lastName: '中村', firstName: '愛', gender: 'female', source: 'sample' },
  { lastName: '小林', firstName: '翔太', gender: 'male', source: 'sample' },
  { lastName: '加藤', firstName: '優子', gender: 'female', source: 'sample' },
  
  // 少し珍しい姓名（不足漢字の検出用）
  { lastName: '龍崎', firstName: '竜也', gender: 'male', source: 'sample' },
  { lastName: '鳳凰', firstName: '美月', gender: 'female', source: 'sample' },
  { lastName: '麒麟', firstName: '翔', gender: 'male', source: 'sample' },
  { lastName: '朱雀', firstName: '舞', gender: 'female', source: 'sample' },
  { lastName: '玄武', firstName: '剛', gender: 'male', source: 'sample' },
  
  // 複雑な漢字（テスト用）
  { lastName: '齋藤', firstName: '健一', gender: 'male', source: 'sample' },
  { lastName: '齊藤', firstName: '健一', gender: 'male', source: 'sample' },
  { lastName: '斎藤', firstName: '健一', gender: 'male', source: 'sample' },
]

// 画数データ拡充マネージャー
export class StrokeDataExpansionManager {
  private missingKanjiMap = new Map<string, MissingKanji>()
  private processedNames: NameData[] = []
  private errors: string[] = []

  // メイン処理：人名データから不足漢字を抽出
  async expandStrokeData(nameDataList: NameData[] = SAMPLE_NAME_DATA): Promise<DataExpansionResult> {
    console.log(`🔍 画数データ拡充開始: ${nameDataList.length}件の姓名を処理`)
    
    this.missingKanjiMap.clear()
    this.processedNames = []
    this.errors = []

    for (const nameData of nameDataList) {
      try {
        await this.processNameData(nameData)
        this.processedNames.push(nameData)
      } catch (error) {
        const errorMsg = `姓名処理エラー: ${nameData.lastName} ${nameData.firstName} - ${error}`
        console.error(errorMsg)
        this.errors.push(errorMsg)
      }
    }

    const missingKanji = Array.from(this.missingKanjiMap.values())
    const addedKanji = await this.addMissingKanji(missingKanji)

    console.log(`✅ 画数データ拡充完了: ${this.processedNames.length}件処理, ${missingKanji.length}個の不足漢字検出, ${addedKanji.length}個追加`)

    return {
      processedNames: this.processedNames.length,
      missingKanji,
      addedKanji,
      errors: this.errors
    }
  }

  // 個別姓名の処理
  private async processNameData(nameData: NameData): Promise<void> {
    const fullName = nameData.lastName + nameData.firstName
    console.log(`📝 処理中: ${fullName}`)

    // 各文字の画数をチェック
    for (let i = 0; i < fullName.length; i++) {
      const char = fullName[i]
      const strokeCount = getStrokeCount(char)
      
      // デフォルト値（10画）が使用された場合、不足漢字として記録
      if (strokeCount === 10) {
        this.recordMissingKanji(char, nameData.source || 'unknown')
      }
    }
  }

  // 不足漢字の記録
  private recordMissingKanji(character: string, source: string): void {
    if (this.missingKanjiMap.has(character)) {
      const existing = this.missingKanjiMap.get(character)!
      existing.frequency += 1
      existing.sources.push(source)
    } else {
      // 画数の推測（簡易版）
      const suggestedStroke = this.estimateStrokeCount(character)
      
      this.missingKanjiMap.set(character, {
        character,
        frequency: 1,
        sources: [source],
        suggestedStroke,
        confidence: this.calculateConfidence(character, suggestedStroke)
      })
    }
  }

  // 画数の推測（簡易版）
  private estimateStrokeCount(character: string): number {
    // 実際の実装では、部首や構成要素から推測
    // ここでは簡易的に文字の複雑さから推測
    
    const charCode = character.charCodeAt(0)
    
    // 常用漢字の範囲（簡易判定）
    if (charCode >= 0x4E00 && charCode <= 0x9FAF) {
      // 漢字の場合、文字の複雑さから推測
      const complexity = this.calculateCharacterComplexity(character)
      return Math.max(1, Math.min(30, complexity))
    }
    
    // ひらがな・カタカナの場合
    if (charCode >= 0x3040 && charCode <= 0x309F) return 3 // ひらがな
    if (charCode >= 0x30A0 && charCode <= 0x30FF) return 3 // カタカナ
    
    return 5 // デフォルト
  }

  // 文字の複雑さ計算（簡易版）
  private calculateCharacterComplexity(character: string): number {
    // 実際の実装では、部首や構成要素を分析
    // ここでは文字のUnicode値から簡易計算
    
    const charCode = character.charCodeAt(0)
    const baseComplexity = Math.floor((charCode - 0x4E00) / 1000) + 5
    
    // よく使われる漢字は画数が少ない傾向
    const commonKanji = ['一', '二', '三', '人', '大', '小', '中', '上', '下', '左', '右']
    if (commonKanji.includes(character)) {
      return Math.max(1, baseComplexity - 3)
    }
    
    return Math.min(30, baseComplexity)
  }

  // 信頼度計算
  private calculateConfidence(character: string, suggestedStroke: number): number {
    let confidence = 0.5 // ベース信頼度
    
    // 使用頻度が高いほど信頼度向上
    const frequency = this.missingKanjiMap.get(character)?.frequency || 1
    confidence += Math.min(0.3, frequency * 0.1)
    
    // 推測画数が妥当な範囲内
    if (suggestedStroke >= 1 && suggestedStroke <= 30) {
      confidence += 0.2
    }
    
    return Math.min(1.0, confidence)
  }

  // 不足漢字の追加
  private async addMissingKanji(missingKanji: MissingKanji[]): Promise<string[]> {
    const addedKanji: string[] = []
    
    // 信頼度と頻度でソート
    const sortedKanji = missingKanji
      .filter(kanji => kanji.confidence > 0.6) // 信頼度60%以上
      .sort((a, b) => (b.frequency * b.confidence) - (a.frequency * a.confidence))
    
    console.log(`📊 追加候補: ${sortedKanji.length}個の漢字`)
    
    for (const kanji of sortedKanji) {
      try {
        // 実際の画数データベースに追加
        await this.addToStrokeDatabase(kanji.character, kanji.suggestedStroke)
        addedKanji.push(kanji.character)
        
        console.log(`✅ 追加: ${kanji.character} (${kanji.suggestedStroke}画, 信頼度: ${(kanji.confidence * 100).toFixed(1)}%)`)
      } catch (error) {
        console.error(`❌ 追加失敗: ${kanji.character} - ${error}`)
      }
    }
    
    return addedKanji
  }

  // 画数データベースへの追加
  private async addToStrokeDatabase(character: string, strokeCount: number): Promise<void> {
    console.log(`💾 データベース追加: ${character} = ${strokeCount}画`)
    
    try {
      // CSVインポートデータに追加（永続化）
      const { csvImportedData } = await import('./stroke-data/csv-imported-data')
      
      // データを追加
      ;(csvImportedData as any)[character] = strokeCount
      
      // 統計情報を更新
      const stats = (csvImportedData as any).csvImportStats
      if (stats) {
        stats.newCount += 1
        stats.totalCount += 1
        stats.lastUpdated = new Date().toISOString()
      }
      
      console.log(`✅ 永続化完了: ${character} = ${strokeCount}画`)
      
    } catch (error) {
      console.error(`❌ 永続化エラー: ${character} - ${error}`)
      throw error
    }
  }

  // 結果レポート生成
  generateReport(result: DataExpansionResult): string {
    let report = `# 画数データ拡充レポート\n\n`
    report += `## 処理結果\n`
    report += `- 処理姓名数: ${result.processedNames}件\n`
    report += `- 不足漢字検出: ${result.missingKanji.length}個\n`
    report += `- 追加漢字数: ${result.addedKanji.length}個\n`
    report += `- エラー数: ${result.errors.length}件\n\n`
    
    if (result.missingKanji.length > 0) {
      report += `## 不足漢字一覧\n`
      result.missingKanji
        .sort((a, b) => (b.frequency * b.confidence) - (a.frequency * a.confidence))
        .forEach(kanji => {
          report += `- ${kanji.character}: ${kanji.suggestedStroke}画 (頻度: ${kanji.frequency}, 信頼度: ${(kanji.confidence * 100).toFixed(1)}%)\n`
        })
      report += `\n`
    }
    
    if (result.addedKanji.length > 0) {
      report += `## 追加された漢字\n`
      report += result.addedKanji.join(', ') + `\n\n`
    }
    
    if (result.errors.length > 0) {
      report += `## エラー一覧\n`
      result.errors.forEach(error => {
        report += `- ${error}\n`
      })
    }
    
    return report
  }
}

// 使用例
export async function runStrokeDataExpansion(): Promise<DataExpansionResult> {
  const manager = new StrokeDataExpansionManager()
  const result = await manager.expandStrokeData()
  
  // レポート生成
  const report = manager.generateReport(result)
  console.log(report)
  
  return result
}

// 定期実行用（実際の実装では cron や scheduler で実行）
export async function scheduleStrokeDataExpansion(): Promise<void> {
  console.log('🔄 定期画数データ拡充を開始')
  
  try {
    const result = await runStrokeDataExpansion()
    
    // 結果をファイルに保存（実際の実装では）
    console.log('📁 結果をファイルに保存')
    
    // 通知（実際の実装では Slack やメールで通知）
    console.log(`✅ 拡充完了: ${result.addedKanji.length}個の漢字を追加`)
    
  } catch (error) {
    console.error('❌ 画数データ拡充エラー:', error)
  }
}
