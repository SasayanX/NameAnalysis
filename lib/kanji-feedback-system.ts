// 漢字フィードバックシステム
export interface KanjiFeedback {
  character: string;
  userInput: string;
  suggestedStrokeCount?: number;
  suggestedReading?: string;
  isOldForm?: boolean;
  timestamp: Date;
  userId?: string;
  frequency: number;
}

export interface UnsupportedKanji {
  character: string;
  firstReported: Date;
  lastReported: Date;
  reportCount: number;
  suggestions: KanjiSuggestion[];
}

export interface KanjiSuggestion {
  strokeCount?: number;
  reading?: string;
  isOldForm?: boolean;
  confidence: number;
}

export class KanjiFeedbackSystem {
  private feedbackData: Map<string, KanjiFeedback[]> = new Map();
  private unsupportedKanji: Map<string, UnsupportedKanji> = new Map();
  private kanjiData: Map<string, any> = new Map();

  constructor(kanjiData?: any[]) {
    if (kanjiData) {
      kanjiData.forEach(kanji => {
        this.kanjiData.set(kanji.character, kanji);
      });
    }
  }

  // 未対応漢字の検出
  detectUnsupportedKanji(character: string): boolean {
    return !this.kanjiData.has(character);
  }

  // フィードバックの記録
  recordFeedback(feedback: Omit<KanjiFeedback, 'timestamp' | 'frequency'>): void {
    const fullFeedback: KanjiFeedback = {
      ...feedback,
      timestamp: new Date(),
      frequency: 1
    };

    const existing = this.feedbackData.get(feedback.character) || [];
    const existingIndex = existing.findIndex(f => f.userInput === feedback.userInput);
    
    if (existingIndex >= 0) {
      // 既存フィードバックの頻度を更新
      existing[existingIndex].frequency++;
    } else {
      // 新規フィードバックの追加
      existing.push(fullFeedback);
    }

    this.feedbackData.set(feedback.character, existing);

    // 未対応漢字データの更新
    this.updateUnsupportedKanji(feedback.character);
  }

  // 未対応漢字データの更新
  private updateUnsupportedKanji(character: string): void {
    const existing = this.unsupportedKanji.get(character);
    const feedbackList = this.feedbackData.get(character) || [];

    if (existing) {
      existing.lastReported = new Date();
      existing.reportCount = feedbackList.reduce((sum, f) => sum + f.frequency, 0);
    } else {
      this.unsupportedKanji.set(character, {
        character,
        firstReported: new Date(),
        lastReported: new Date(),
        reportCount: 1,
        suggestions: this.generateSuggestions(character, feedbackList)
      });
    }
  }

  // 提案の生成
  private generateSuggestions(character: string, feedbackList: KanjiFeedback[]): KanjiSuggestion[] {
    const suggestions: KanjiSuggestion[] = [];

    // ストローク数の統計的推定
    const strokeCounts = feedbackList
      .filter(f => f.suggestedStrokeCount)
      .map(f => f.suggestedStrokeCount!);
    
    if (strokeCounts.length > 0) {
      const avgStrokeCount = strokeCounts.reduce((sum, count) => sum + count, 0) / strokeCounts.length;
      suggestions.push({
        strokeCount: Math.round(avgStrokeCount),
        confidence: Math.min(strokeCounts.length / 5, 1.0) // 5件以上の報告で信頼度100%
      });
    }

    // 読みの統計的推定
    const readings = feedbackList
      .filter(f => f.suggestedReading)
      .map(f => f.suggestedReading!);
    
    if (readings.length > 0) {
      const mostCommonReading = this.findMostCommon(readings);
      suggestions.push({
        reading: mostCommonReading,
        confidence: Math.min(readings.length / 3, 1.0) // 3件以上の報告で信頼度100%
      });
    }

    // 旧字体判定
    const oldFormReports = feedbackList.filter(f => f.isOldForm === true).length;
    if (oldFormReports > 0) {
      suggestions.push({
        isOldForm: true,
        confidence: oldFormReports / feedbackList.length
      });
    }

    return suggestions;
  }

  // 最頻出値の検索
  private findMostCommon(array: string[]): string {
    const counts: Record<string, number> = {};
    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  // 頻出未対応漢字の取得
  getFrequentUnsupportedKanji(threshold: number = 3): UnsupportedKanji[] {
    return Array.from(this.unsupportedKanji.values())
      .filter(kanji => kanji.reportCount >= threshold)
      .sort((a, b) => b.reportCount - a.reportCount);
  }

  // フィードバック統計の取得
  getFeedbackStats(): {
    totalFeedback: number;
    uniqueKanji: number;
    frequentUnsupported: number;
  } {
    const totalFeedback = Array.from(this.feedbackData.values())
      .flat()
      .reduce((sum, f) => sum + f.frequency, 0);

    const uniqueKanji = this.feedbackData.size;
    const frequentUnsupported = this.getFrequentUnsupportedKanji().length;

    return {
      totalFeedback,
      uniqueKanji,
      frequentUnsupported
    };
  }

  // データのエクスポート
  exportFeedbackData(): {
    feedback: KanjiFeedback[];
    unsupported: UnsupportedKanji[];
  } {
    return {
      feedback: Array.from(this.feedbackData.values()).flat(),
      unsupported: Array.from(this.unsupportedKanji.values())
    };
  }
}
